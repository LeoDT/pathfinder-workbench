import { remove } from 'lodash-es';
import { makeObservable, observable, reaction } from 'mobx';

import { Spell } from '../../types/core';
import { CharacterSpellbook } from './spellbook';
import Character from '.';

export interface Tracker {
  id: string;
  name: string;
  max: number;
  current: number;
  readonly: boolean;
}

export interface RawCharacterTracker {
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

    const dispose = reaction(
      () => this.character.formulaParserReady,
      (r) => {
        if (r) {
          this.initTrackerFromEffects();

          dispose();
        }
      }
    );
  }

  initTrackerFromEffects(): void {
    const es = this.character.effect.getAddTrackerEffects();

    es.forEach(({ effect, source }) => {
      const { args } = effect;
      const id = args.id || source.id;
      const name = args.name || source.name;
      const { max, maxFormula } = args;

      const existed = this.trackers.find((t) => t.id === id);
      const realMax = max
        ? max
        : maxFormula
        ? this.character.parseFormulaNumber(maxFormula)
        : undefined;

      if (typeof realMax === 'undefined') {
        throw new Error(
          'invalid args for EffectAddTracker, either `max` or `maxFormula` should be provided.'
        );
      }

      if (existed) {
        this.updateTracker(existed, {
          id,
          name,
          max: realMax,
          current: existed.current,
          readonly: true,
        });
      } else {
        this.addTracker(id, name, realMax);
      }
    });
  }

  addTracker(id: string, name: string, max: number, readonly = true): void {
    this.trackers.push({
      id,
      name,
      max,
      current: max,
      readonly: readonly,
    });
  }
  removeTracker(t: Tracker): void {
    remove(this.trackers, t);
  }
  updateTracker(t: Tracker, update: Partial<Tracker>): void {
    Object.assign(t, update);
  }

  restoreTracker(t: Tracker): void {
    this.updateTracker(t, { current: t.max });
  }
  increaseTracker(t: Tracker): void {
    this.updateTracker(t, { current: Math.min(t.current + 1, t.max) });
  }
  decreaseTracker(t: Tracker): void {
    this.updateTracker(t, { current: Math.max(t.current - 1, 0) });
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
