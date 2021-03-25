import { range } from 'lodash-es';
import { computed, observable, makeObservable, action } from 'mobx';

import { AbilityType, Class, Spell, SpellCastingType } from '../types/core';

import { spellsPerDayByAbilityModifier } from '../utils/spell';

import { collections } from './collection';
import Character from './character';

type KnownSpells = Array<string[] | 'all'>;

export default class Spellbook {
  character: Character;
  class: Class;
  castingType: SpellCastingType;
  abilityType: AbilityType;
  knownSpellIds: KnownSpells;

  constructor(
    c: Character,
    clas: Class,
    castingType: SpellCastingType,
    abilityType: AbilityType,
    knownSpellIds: string[][]
  ) {
    makeObservable(this, {
      cl: computed,
      abilityModifier: computed,
      classSpells: computed,
      knownSpells: computed,

      initKnownSpells: action,
    });

    this.character = c;
    this.class = clas;
    this.castingType = castingType;
    this.abilityType = abilityType;
    this.knownSpellIds = observable.array(knownSpellIds);
  }

  get cl(): number {
    return this.character.levelDetail[this.class.id];
  }

  get abilityModifier(): number {
    return this.character.abilityModifier[this.abilityType];
  }

  get classSpells(): Record<number, Spell[]> {
    return collections.spell
      .getByClass(this.class)
      .map((spells) => spells.map((s) => collections.spell.getById(s)));
  }

  get knownSpells(): Array<Spell[]> {
    return this.knownSpellIds.map((spells, level) => {
      if (spells === 'all') {
        return collections.spell
          .getByClassLevel(this.class, level)
          .map((s) => collections.spell.getById(s));
      }

      return spells.map((s) => collections.spell.getById(s));
    });
  }

  get spellsPerDay(): number[] {
    const byClass = this.class.levels[this.cl].spellsPerDay as number[];
    const modifier = this.abilityModifier;
    // 0 level spells is not affected by ability modifiers
    const byAbility = [0, ...spellsPerDayByAbilityModifier[modifier]];

    return range(10).map((i) => {
      const c = byClass[i] || 0;
      const a = byAbility[i] || 0;

      if (c === 0) return c;

      return a + c;
    });
  }

  initKnownSpells(): void {
    this.knownSpellIds = observable.array([]);

    switch (this.castingType) {
      case 'wizard-like': {
        this.knownSpellIds.push('all');
        break;
      }

      default:
        return;
    }
  }

  get wizardNewSpellSlots(): number {
    if (this.cl === 1) {
      return 3 + this.abilityModifier;
    }

    return 2;
  }
}
