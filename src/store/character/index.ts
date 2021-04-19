import { compact, intersection, isEmpty, last, pick, range, uniq } from 'lodash-es';
import { IObservableArray, action, computed, makeObservable, observable } from 'mobx';
import shortid from 'shortid';

import { CharacterUpgrade } from '../../types/characterUpgrade';
import {
  Abilities,
  AbilityType,
  Alignment,
  Bonus,
  Class,
  ClassFeat,
  ClassLevel,
  Feat,
  Race,
  RacialTrait,
  Skill,
  SkillSystem,
} from '../../types/core';
import { addBonusScores, getModifiers } from '../../utils/ability';
import { aggregateBonusesAmount } from '../../utils/bonus';
import { getClassFeatByLevel, getClassLevel } from '../../utils/class';
import { coreToConsolidated } from '../../utils/skill';
import { collections } from '../collection';
import Spellbook from '../spellbook';
import CharacterEffect from './effect';
import CharacterEquip from './equip';
import { CharacterProficiency } from './proficiency';
import CharacterStatus from './status';

interface OptionalCharacterParams {
  id?: string;
  skillSystem?: SkillSystem;
  alignment?: Alignment;
  baseAbility?: Abilities;
  bonusAbilityType?: AbilityType[];
  favoredClassIds?: string[];

  level?: number;

  raceId?: string;
  alternateRaceTraitIds?: string[];

  upgrades?: CharacterUpgrade[];
}

export default class Character {
  id: string;
  name: string;
  skillSystem: SkillSystem;
  alignment: Alignment;
  baseAbility: Abilities;
  bonusAbilityType: AbilityType[];

  pendingUpgrade: CharacterUpgrade | null;
  upgrades: IObservableArray<CharacterUpgrade>;

  raceId: string;
  alternateRaceTraitIds: string[];
  favoredClassIds: string[];
  spellbooks: IObservableArray<Spellbook>;

  status: CharacterStatus;
  equipment: CharacterEquip;
  effect: CharacterEffect;
  proficiency: CharacterProficiency;

  constructor(
    name: string,
    {
      id,
      skillSystem = 'core',
      alignment = Alignment.N,
      baseAbility,
      bonusAbilityType,
      raceId = 'Human',
      alternateRaceTraitIds,
      favoredClassIds,
      upgrades,
    }: OptionalCharacterParams = {}
  ) {
    makeObservable(this, {
      name: observable,
      skillSystem: observable,
      alignment: observable,
      favoredClassIds: observable,
      baseAbility: observable,
      abilityModifier: computed,

      maxBonusAbilityType: computed,
      bonusAbilityType: observable,
      bonusAbility: computed,

      raceId: observable,
      alternateRaceTraitIds: observable,
      race: computed,
      setRace: action,

      pendingUpgrade: observable,
      startUpgrade: action,
      cancelUpgrade: action,
      finishUpgrade: action,

      level: computed,
      levelDetail: computed,
      levelDetailForShow: computed,
      levelDetailWithoutPending: computed,
      classLevelDetail: computed,
      gainedClassFeats: computed,
      classes: computed,

      classSkills: computed,
      skillRanks: computed,
      skillRanksWithoutPending: computed,

      gainedFeats: computed,
    });

    this.id = id ?? shortid.generate();
    this.name = name;
    this.skillSystem = skillSystem;
    this.alignment = alignment;

    this.baseAbility = baseAbility ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    this.bonusAbilityType = bonusAbilityType ?? [AbilityType.str];

    this.pendingUpgrade = null;
    this.upgrades = observable.array(upgrades || [], { deep: false });

    this.favoredClassIds = favoredClassIds || [];

    this.raceId = raceId;
    this.alternateRaceTraitIds = alternateRaceTraitIds || [];

    this.spellbooks = observable.array([], { deep: false });
    this.status = new CharacterStatus(this);
    this.equipment = new CharacterEquip(this);
    this.effect = new CharacterEffect(this);
    this.proficiency = new CharacterProficiency(this);

    this.ensureSpellbooks();
  }

  setSkillSystem(s: SkillSystem): void {
    this.skillSystem = s;
  }

  get race(): Race {
    return collections.race.getById(this.raceId);
  }
  setRace(raceId: string, alternateRaceTraitIds?: string[]): void {
    this.raceId = raceId;
    this.bonusAbilityType = [AbilityType.str];

    if (alternateRaceTraitIds) {
      this.alternateRaceTraitIds = alternateRaceTraitIds;
    }
  }
  get racialTraits(): Array<RacialTrait> {
    const traits = [...this.race.racialTrait];
    const replaced: string[] = [];

    this.alternateRaceTraitIds.forEach((id) => {
      const alt = this.race.alternateRacialTrait.find((t) => t.id === id);

      if (alt) {
        traits.push(alt);
        alt.replace?.forEach((r) => replaced.push(r));
      }
    });

    return traits.filter((t) => !replaced.includes(t.id));
  }

  get ability(): Abilities {
    return addBonusScores(this.baseAbility, this.bonusAbility);
  }
  get abilityModifier(): Abilities {
    return getModifiers(this.ability);
  }
  get maxBonusAbilityType(): number {
    const effects = this.effect.getAbilityBonusEffects();
    let amount = 0;

    if (isEmpty(this.race.ability)) {
      amount += 1;
    }

    return amount + effects.length;
  }
  get bonusAbility(): Partial<Abilities> {
    if (isEmpty(this.race.ability)) {
      const abilities: Partial<Abilities> = {};

      this.bonusAbilityType.forEach((t) => {
        abilities[t] = 2;
      });

      return abilities;
    }

    return this.race.ability;
  }

  startUpgrade(): void {
    const lastUpgrade = last(this.upgrades);
    const lastUpgradeClass = lastUpgrade ? lastUpgrade.classId : 'Barbarian';
    const levelFeat = (this.level + 1) % 2 === 1;
    const levelAbility = (this.level + 1) % 4 === 1;

    this.pendingUpgrade = {
      classId: lastUpgradeClass,
      favoredClassBonus: 'hp',
      hp: 0,
      skills: new Map(),
      abilities: {},
      feats: [],
      effectInputs: new Map(),
      spells: [],
      levelFeat,
      levelAbility,
      classSpeciality: null,
    };
  }
  cancelUpgrade(): void {
    this.pendingUpgrade = null;
  }
  finishUpgrade(): void {
    if (this.pendingUpgrade) {
      this.upgrades.push(this.pendingUpgrade);
      this.pendingUpgrade = null;
    }
  }

  get upgradesWithPending(): Array<CharacterUpgrade> {
    return compact([...this.upgrades, this.pendingUpgrade]);
  }
  get level(): number {
    return Math.max(this.upgradesWithPending.length, 1);
  }
  get levelDetail(): Map<Class, number> {
    const levels = new Map<Class, number>();

    this.upgradesWithPending.forEach(({ classId }) => {
      const clas = collections.class.getById(classId);
      const l = levels.get(clas) || 0;

      levels.set(clas, l + 1);
    });

    return levels;
  }
  get levelDetailForShow(): Array<string> {
    return Array.from(this.levelDetail.entries()).map(([clas, level]) => `${level}级${clas.name}`);
  }
  get levelDetailWithoutPending(): Map<Class, number> {
    const levels = new Map<Class, number>();

    this.upgrades.forEach(({ classId }) => {
      const clas = collections.class.getById(classId);
      const l = levels.get(clas) || 0;

      levels.set(clas, l + 1);
    });

    return levels;
  }

  get maxFavoredClass(): number {
    let max = 1;
    const effects = this.effect.getGainFavoredClassAmountEffects();

    effects.forEach(({ effect }) => {
      max += effect.args.amount;
    });

    return max;
  }
  get classLevelDetail(): Map<Class, ClassLevel> {
    const classLevels = new Map<Class, ClassLevel>();

    this.levelDetail.forEach((l, clas) => {
      const classLevel = getClassLevel(clas, l);

      classLevels.set(clas, classLevel);
    });

    return classLevels;
  }

  getLevelForClass(clas: Class): number {
    const l = this.levelDetail.get(clas);

    if (l) {
      return l;
    }

    throw new Error('No class level for character');
  }

  get gainedClassFeats(): Map<Class, ClassFeat[]> {
    const result = new Map<Class, ClassFeat[]>();

    this.levelDetail.forEach((level, clas) => {
      result.set(
        clas,
        range(level)
          .map((l) => getClassFeatByLevel(clas, l + 1))
          .flat()
      );
    });

    return result;
  }
  get classes(): Array<Class> {
    return uniq(this.upgradesWithPending.map((u) => u.classId)).map((cId) =>
      collections.class.getById(cId)
    );
  }

  get classSkills(): Array<string> {
    return uniq(this.classes.map((c) => c.classSkills).flat());
  }
  isClassSkill(s: Skill): boolean {
    if (s.parent) {
      return this.classSkills.includes(s.parent) || this.classSkills.includes(s.id);
    }

    if (s.core) {
      return intersection(this.classSkills, s.core).length > 0;
    }

    return this.classSkills.includes(s.id);
  }
  get skillRanksFromEffects(): Map<string, number> {
    const rankBonuses = new Map<string, Bonus[]>();

    this.effect.getGainSkillEffects().forEach(({ effect }) => {
      const skill = collections.coreSkill.getById(effect.args.skillId);
      const realSkill = this.skillSystem === 'consolidated' ? coreToConsolidated(skill) : skill;

      const bonuses = rankBonuses.get(realSkill.id) ?? [];

      rankBonuses.set(realSkill.id, [...bonuses, effect.args.bonus]);
    });

    const ranks = new Map<string, number>();

    for (const [sId, bonus] of rankBonuses) {
      ranks.set(sId, aggregateBonusesAmount(bonus));
    }

    return ranks;
  }
  get skillRanks(): Map<string, number> {
    const ranks = new Map<string, number>();

    this.upgradesWithPending.forEach(({ skills }) => {
      Array.from(skills.entries()).forEach(([k, v]) => {
        ranks.set(k, (ranks.get(k) || 0) + v);
      });
    });

    return ranks;
  }
  get skillRanksWithoutPending(): Map<string, number> {
    const ranks = new Map<string, number>();

    this.upgrades.forEach(({ skills }) => {
      Array.from(skills.entries()).forEach(([k, v]) => {
        ranks.set(k, (ranks.get(k) || 0) + v);
      });
    });

    return ranks;
  }
  getSkillDetail(
    s: Skill
  ): {
    rank: number;
    modifier: number;
    classBonus: number;
    fromEffect: number;
    isClassSkill: boolean;
    total: number;
  } {
    const rank = this.skillRanks.get(s.id) ?? 0;
    const modifier = this.abilityModifier[s.ability];
    const isClassSkill = this.isClassSkill(s);
    const classBonus = rank > 0 && isClassSkill ? 3 : 0;
    const fromEffect = this.skillRanksFromEffects.get(s.id) ?? 0;

    return {
      rank,
      modifier,
      classBonus,
      isClassSkill,
      fromEffect,
      total: rank + modifier + classBonus + fromEffect,
    };
  }

  get gainedFeats(): Feat[] {
    return this.upgradesWithPending
      .map((up) => up.feats.filter((f) => f).map((f) => collections.feat.getById(f)))
      .flat();
  }

  ensureSpellbooks(): void {
    const books: Array<Spellbook> = [];

    const effects = this.effect.getGainSpellCastingEffects();

    effects.forEach(({ effect, source }) => {
      const clas = this.classes.find((c) => {
        if (source._type === 'classFeat') {
          return c.feats.indexOf(source) !== -1;
        }

        return false;
      });

      if (clas) {
        const existedSpellbook = this.spellbooks.find((sb) => sb.class === clas);

        if (existedSpellbook) {
          books.push(existedSpellbook);
        } else {
          const newSpellbook = new Spellbook(
            this,
            clas,
            effect.args.castingType,
            effect.args.abilityType
          );
          books.push(newSpellbook);
        }
      }
    });

    this.spellbooks.replace(books);
  }

  static serializableProps = [
    'skillSystem',
    'alignment',
    'raceId',
    'alternateRaceTraitIds',
    'baseAbility',
    'bonusAbilityType',
    'favoredClassIds',
  ];

  static stringify(c: Character): string {
    return JSON.stringify({
      id: c.id,
      name: c.name,
      upgrades: c.upgrades.map((u) => ({ ...u, skills: Array.from(u.skills.entries()) })),
      equipment: CharacterEquip.stringify(c.equipment),
      ...pick(c, Character.serializableProps),
    });
  }

  static parse(s: string): Character {
    const json = JSON.parse(s);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json.upgrades = json.upgrades.map((u: any) => {
      return { ...u, skills: new Map(u.skills) };
    });

    const character = new Character(json.name, json);

    if (json.equipment) {
      character.equipment = CharacterEquip.parse(json.equipment, character);
    }

    return character;
  }
}
