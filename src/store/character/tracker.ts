import { Spell } from '../../types/core';
import { CharacterSpellbook } from './spellbook';
import Character from '.';
import { makeObservable, observable } from 'mobx';

interface Tracker {
  name: string;
  max: number;
  current: number;
}

interface RawCharacterTracker {
  spellTracker?: Array<[string, string[]]>;
  trackers?: Tracker[];
}

export class CharacterTracker {
  character: Character;

  spellTracker: Map<string, string[]>; // Map<classId, spellId[]>
  trackers: Tracker[];

  constructor(c: Character, raw?: RawCharacterTracker) {
    makeObservable(this, {
      spellTracker: observable,
      trackers: observable,
    });

    this.character = c;

    this.spellTracker = new Map(raw?.spellTracker);
    this.trackers = raw?.trackers ?? [];
  }

  castSpell(spellbook: CharacterSpellbook, spell: Spell): void {
    const spells = this.spellTracker.get(spellbook.class.id) ?? [];

    this.spellTracker.set(spellbook.class.id, [...spells, spell.id]);
  }
  resetSpellTracker(spellbook: CharacterSpellbook): void {
    this.spellTracker.set(spellbook.class.id, []);
  }

  static stringify(c: CharacterTracker): string {
    return JSON.stringify({
      spellTracker: c.spellTracker,
      trackers: c.trackers,
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static parse(s: string | any, c: Character): CharacterTracker {
    const json = typeof s === 'string' ? JSON.parse(s) : s;
    const tracker = new CharacterTracker(c, json);

    return tracker;
  }
}
