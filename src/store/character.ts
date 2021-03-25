import { isEmpty, pick, last, compact, uniq } from 'lodash-es';
import { observable, makeObservable, IObservableArray, computed, action } from 'mobx';
import shortid from 'shortid';

import { createContextNoNullCheck } from '../utils/react';
import { collections } from './collection';
import { AbilityType, Abilities, Race, Skill, Class, ClassFeat } from '../types/core';
import { CharacterUpgrade } from '../types/characterUpgrade';
import { getModifiers, addBonusScores } from '../utils/ability';
import { getClassFeatByLevel, getSpellCastingEffectFromClassLevel } from '../utils/class';

import Spellbook from './spellbook';

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
  baseAbility: Abilities;
  bonusAbilityType: AbilityType;

  pendingUpgrade: CharacterUpgrade | null;
  upgrades: IObservableArray<CharacterUpgrade>;

  raceId: string;
  favoredClassIds: string[];
  spellbooks: IObservableArray<Spellbook>;

  constructor(
    name: string,
    {
      id,
      baseAbility,
      bonusAbilityType = AbilityType.str,
      raceId = 'Dwarf',
      upgrades,
    }: OptionalCharacterParams = {}
  ) {
    makeObservable(this, {
      name: observable,
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
      finishUpgrade: action,

      level: computed,
      levelDetail: computed,
      gainedClassFeats: computed,
      classes: computed,

      classSkills: computed,
      skillRanks: computed,
    });

    this.name = name;
    this.id = id ?? shortid.generate();

    this.baseAbility = baseAbility ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    this.bonusAbilityType = bonusAbilityType ?? AbilityType.str;

    this.pendingUpgrade = null;
    this.upgrades = observable.array(upgrades || [], { deep: false });

    this.favoredClassIds = [];

    this.raceId = raceId;

    this.spellbooks = observable.array([], { deep: false });
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
    const lastUpgradeClass = lastUpgrade ? lastUpgrade.classId : 'Wizard';

    this.pendingUpgrade = {
      classId: lastUpgradeClass,
      skills: new Map(),
      abilities: {},
      feats: [],
      spells: [],
      levelFeat: this.level % 2 === 1,
      levelAbility: this.level % 4 === 1,
    };
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
  get levelDetail(): Record<string, number> {
    const levels: Record<string, number> = {};

    this.upgradesWithPending.forEach(({ classId }) => {
      levels[classId] = levels[classId] ? levels[classId] + 1 : 1;
    });

    return levels;
  }

  get gainedClassFeats(): Record<string, ClassFeat[]> {
    const result: Record<string, ClassFeat[]> = {};

    this.upgradesWithPending.forEach((up) => {
      result[up.classId] = result[up.classId] || [];

      const clas = collections.class.getById(up.classId);
      const feats = getClassFeatByLevel(clas, result[up.classId].length + 1);

      result[up.classId] = [...result[up.classId], ...feats];
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
  getSkillDetail(
    s: Skill
  ): { rank: number; modifier: number; classBonus: number; isClassSkill: boolean; total: number } {
    const rank = this.skillRanks.get(s.id) || 0;
    const modifier = this.abilityModifier[s.ability];
    const isClassSkill = this.isClassSkill(s);
    const classBonus = rank > 0 && isClassSkill ? 3 : 0;

    return { rank, modifier, classBonus, isClassSkill, total: rank + modifier + classBonus };
  }

  initSpellbook(): void {
    const books: Array<Spellbook> = [];

    Object.keys(this.levelDetail).forEach((c) => {
      const clas = collections.class.getById(c);
      const e = getSpellCastingEffectFromClassLevel(clas, this.levelDetail[c]);

      if (e) {
        books.push(new Spellbook(this, clas, e.castingType, e.abilityType, []));
      }
    });

    this.spellbooks.replace(books);
  }

  static serializableProps = ['raceId', 'baseAbility', 'bonusAbilityType', 'upgrades'];

  static stringify(c: Character): string {
    return JSON.stringify({
      id: c.id,
      name: c.name,
      ...pick(c, Character.serializableProps),
    });
  }

  static parse(s: string): Character {
    const json = JSON.parse(s);
    const character = new Character(json.name, json);

    return character;
  }
}

export const [useCurrentCharacter, CurrentCharacterContext] = createContextNoNullCheck<Character>();
