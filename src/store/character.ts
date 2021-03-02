import { isEmpty, pick } from 'lodash-es';
import { observable, makeObservable, ObservableSet, ObservableMap, computed, action } from 'mobx';
import shortid from 'shortid';

import { createContextNoNullCheck } from '../utils/react';
import { collections } from './collection';
import { Abilities, Spell, Race, AbilityType, Skill, Class } from './types';
import { getModifiers, getTotalScoreCosts, addBonusScores } from '../utils/ability';

interface OptionalCharacterParams {
  id?: string;
  baseAbility?: Abilities;
  bonusAbilityType?: AbilityType;

  level?: number;

  raceId?: string;
  classId?: string;
  skillRanks?: Array<[string, number]>;
  spellbookIds?: string[];
}

export default class Character {
  id: string;
  name: string;
  baseAbility: Abilities;
  bonusAbilityType: AbilityType;

  level: number;

  raceId: string;
  classId: string;
  skillRanks: ObservableMap<string, number>;
  spellbookIds: ObservableSet<string>;

  constructor(
    name: string,
    {
      id,
      baseAbility,
      bonusAbilityType = AbilityType.str,
      level = 1,
      raceId = 'Human',
      classId = 'Fighter',
      skillRanks = [],
      spellbookIds,
    }: OptionalCharacterParams = {}
  ) {
    makeObservable(this, {
      name: observable,
      baseAbility: observable,

      abilityModifier: computed,
      abilityCost: computed,

      bonusAbilityType: observable,
      bonusAbility: computed,

      raceId: observable,
      race: computed,
      setRace: action,

      classId: observable,
      class: computed,

      spellbook: computed,
    });

    this.name = name;
    this.id = id ?? shortid.generate();

    this.baseAbility = baseAbility ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    this.bonusAbilityType = bonusAbilityType ?? AbilityType.str;

    this.level = level;

    this.raceId = raceId;
    this.classId = classId;

    this.skillRanks = observable.map(new Map<string, number>(skillRanks), { deep: false });

    this.spellbookIds = observable.set(new Set(spellbookIds), { deep: false });
  }

  get race(): Race {
    return (
      collections.race.getById(this.raceId) || {
        id: 'unknown',
        name: '未知',
        ability: {},
      }
    );
  }
  setRace(raceId: string): void {
    this.raceId = raceId;
    this.bonusAbilityType = AbilityType.str;
  }

  get class(): Class {
    return (
      collections.class.getById(this.classId) || {
        id: 'unknown',
        name: '未知',
        hd: 0,
        classSkills: [],
      }
    );
  }

  get ability(): Abilities {
    return addBonusScores(this.baseAbility, this.bonusAbility);
  }
  get abilityModifier(): Abilities {
    return getModifiers(this.ability);
  }
  get abilityCost(): number {
    return getTotalScoreCosts(this.baseAbility);
  }
  get bonusAbility(): Partial<Abilities> {
    if (isEmpty(this.race.ability)) {
      return { [this.bonusAbilityType]: 2 };
    }

    return this.race.ability;
  }
  resetBaseAbility(): void {
    this.baseAbility = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  }

  isClassSkill(s: Skill): boolean {
    return this.class.classSkills.includes(s.id);
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

  get spellbook(): Array<Spell> {
    return Array.from(this.spellbookIds)
      .map((id) => collections.spell.getById(id))
      .filter((t): t is Spell => Boolean(t));
  }

  static serializableProps = [
    'raceId',
    'classId',
    'baseAbility',
    'bonusAbilityType',
    'spellbookIds',
  ];

  static stringify(c: Character): string {
    return JSON.stringify({
      id: c.id,
      name: c.name,
      spellbook: Array.from(c.spellbook).map((s) => s.id),
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
