import { isEmpty, pick } from 'lodash-es';
import { observable, makeObservable, ObservableSet, computed, action } from 'mobx';
import shortid from 'shortid';

import { createContextNoNullCheck } from '../utils/react';
import { collections } from './collection';
import { Abilities, Spell, Race, AbilityType } from './types';
import { getModifiers, getTotalScoreCosts, addBonusScores } from '../utils/ability';

interface OptionalCharacterParams {
  id?: string;
  baseAbility?: Abilities;
  bonusAbilityType?: AbilityType;

  raceId?: string;
  classId?: string;
  spellbookIds?: string[];
}

export default class Character {
  id: string;
  name: string;
  baseAbility: Abilities;
  bonusAbilityType: AbilityType;

  raceId: string;
  classId: string;
  spellbookIds: ObservableSet<string>;

  constructor(
    name: string,
    {
      id,
      baseAbility,
      bonusAbilityType = AbilityType.str,
      raceId = 'Human',
      classId = 'Fighter',
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

      spellbook: computed,
    });

    this.name = name;
    this.id = id ?? shortid.generate();

    this.baseAbility = baseAbility ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    this.bonusAbilityType = bonusAbilityType ?? AbilityType.str;

    this.raceId = raceId;
    this.classId = classId;

    this.spellbookIds = observable.set(new Set(spellbookIds), { deep: false });
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
