import { observable, ObservableSet } from 'mobx';
import shortid from 'shortid';

import { createContextNoNullCheck } from '../utils/react';
import { Collection } from './collection';
import { Spell } from './types';

export default class Character {
  id: string;
  name: string;
  spellbook: ObservableSet<Spell>;

  constructor(name: string, id?: string) {
    this.name = name;
    this.id = id ?? shortid.generate();
    this.spellbook = observable.set(new Set(), { deep: false });
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
