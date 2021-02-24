import { isEmpty } from 'lodash-es';
import { observable, makeObservable, ObservableSet, computed, action } from 'mobx';
import shortid from 'shortid';

import { createContextNoNullCheck } from '../utils/react';
import { Collection, collections } from './collection';
import { Abilities, Spell, Race, AbilityType } from './types';
import { getModifiers, getTotalScoreCosts, addBonusScores } from '../utils/ability';

export default class Character {
  id: string;
  name: string;
  baseAbility: Abilities;
  bonusAbilityType: AbilityType;

  raceId: string;
  classId: string;
  spellbook: ObservableSet<Spell>;

  constructor(name: string, id?: string) {
    makeObservable(this, {
      baseAbility: observable,

      abilityModifier: computed,
      abilityCost: computed,

      bonusAbilityType: observable,
      bonusAbility: computed,

      setRace: action,
      raceId: observable,
      race: computed,

      classId: observable,
    });

    this.name = name;
    this.id = id ?? shortid.generate();

    this.baseAbility = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    this.bonusAbilityType = AbilityType.str;

    this.raceId = 'Human';
    this.classId = 'Fighter';

    this.spellbook = observable.set(new Set(), { deep: false });
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

  static stringify(c: Character): string {
    return JSON.stringify({
      id: c.id,
      name: c.name,
      spellbook: Array.from(c.spellbook).map((s) => s.id),
    });
  }

  static parse(s: string, spellCollection: Collection<Spell>): Character {
    const json = JSON.parse(s);
    const character = new Character(json.name, json.id);

    for (const spellId of json.spellbook) {
      const spell = spellCollection.getById(spellId);

      if (spell) {
        character.spellbook.add(spell);
      }
    }

    return character;
  }
}

export const [useCurrentCharacter, CurrentCharacterContext] = createContextNoNullCheck<Character>();
