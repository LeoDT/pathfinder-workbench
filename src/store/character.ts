import { isEmpty, pick, last, compact, uniq, range, intersection } from 'lodash-es';
import { observable, makeObservable, IObservableArray, computed, action } from 'mobx';
import shortid from 'shortid';

import { collections } from './collection';
import {
  AbilityType,
  Abilities,
  Race,
  Skill,
  Class,
  ClassLevel,
  ClassFeat,
  Feat,
  SkillSystem,
} from '../types/core';
import { CharacterUpgrade } from '../types/characterUpgrade';
import { getModifiers, addBonusScores } from '../utils/ability';
import {
  getClassFeatByLevel,
  getSpellCastingEffectFromClassLevel,
  getClassLevel,
} from '../utils/class';

import Spellbook from './spellbook';
import CharacterStatus from './characterStatus';
import CharacterEquip from './characterEquip';

interface OptionalCharacterParams {
  id?: string;
  baseAbility?: Abilities;
  bonusAbilityType?: AbilityType;

  level?: number;

  raceId?: string;
  upgrades?: CharacterUpgrade[];
}

export default class Character {
  id: string;
  name: string;
  skillSystem: SkillSystem;
  baseAbility: Abilities;
  bonusAbilityType: AbilityType;

  pendingUpgrade: CharacterUpgrade | null;
  upgrades: IObservableArray<CharacterUpgrade>;

  raceId: string;
  favoredClassIds: string[];
  spellbooks: IObservableArray<Spellbook>;

  status: CharacterStatus;
  equipment: CharacterEquip;

  constructor(
    name: string,
    {
      id,
      baseAbility,
      bonusAbilityType = AbilityType.str,
      raceId = 'Human',
      upgrades,
    }: OptionalCharacterParams = {}
  ) {
    makeObservable(this, {
      name: observable,
      skillSystem: observable,
      baseAbility: observable,
      abilityModifier: computed,

      bonusAbilityType: observable,
      bonusAbility: computed,

      raceId: observable,
      race: computed,
      setRace: action,

      favoredClassIds: observable,

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
    this.skillSystem = 'core';

    this.baseAbility = baseAbility ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    this.bonusAbilityType = bonusAbilityType ?? AbilityType.str;

    this.pendingUpgrade = null;
    this.upgrades = observable.array(upgrades || [], { deep: false });

    this.favoredClassIds = [];

    this.raceId = raceId;

    this.spellbooks = observable.array([], { deep: false });
    this.status = new CharacterStatus(this);
    this.equipment = new CharacterEquip(this);

    this.ensureSpellbooks();
  }

  setSkillSystem(s: SkillSystem): void {
    this.skillSystem = s;
  }

  get race(): Race {
    return collections.race.getById(this.raceId);
  }
  setRace(raceId: string): void {
    this.raceId = raceId;
    this.bonusAbilityType = AbilityType.str;
  }

  get ability(): Abilities {
    return addBonusScores(this.baseAbility, this.bonusAbility);
  }
  get abilityModifier(): Abilities {
    return getModifiers(this.ability);
  }
  get bonusAbility(): Partial<Abilities> {
    if (isEmpty(this.race.ability)) {
      return { [this.bonusAbilityType]: 2 };
    }

    return this.race.ability;
  }

  startUpgrade(): void {
    const lastUpgrade = last(this.upgrades);
    const lastUpgradeClass = lastUpgrade ? lastUpgrade.classId : 'Barbarian';

    this.pendingUpgrade = {
      classId: lastUpgradeClass,
      skills: new Map(),
      abilities: {},
      feats: [],
      spells: [],
      levelFeat: this.level % 2 === 1,
      levelAbility: this.level % 4 === 1,
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
  ): { rank: number; modifier: number; classBonus: number; isClassSkill: boolean; total: number } {
    const rank = this.skillRanks.get(s.id) || 0;
    const modifier = this.abilityModifier[s.ability];
    const isClassSkill = this.isClassSkill(s);
    const classBonus = rank > 0 && isClassSkill ? 3 : 0;

    return { rank, modifier, classBonus, isClassSkill, total: rank + modifier + classBonus };
  }

  get gainedFeats(): Feat[] {
    return this.upgradesWithPending
      .map((up) => up.feats.map((f) => collections.feat.getById(f)))
      .flat();
  }

  ensureSpellbooks(): void {
    const books: Array<Spellbook> = [];

    this.levelDetail.forEach((level, clas) => {
      const existedSpellbook = this.spellbooks.find((sb) => sb.class === clas);

      if (existedSpellbook) {
        books.push(existedSpellbook);
      }

      const e = getSpellCastingEffectFromClassLevel(clas, level);

      if (e) {
        const newSpellbook = new Spellbook(this, clas, e.castingType, e.abilityType);
        books.push(newSpellbook);
      }
    });

    this.spellbooks.replace(books);
  }

  static serializableProps = ['raceId', 'baseAbility', 'bonusAbilityType'];

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
