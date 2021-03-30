import { range } from 'lodash-es';
import { computed, makeObservable } from 'mobx';

import { AbilityType, Class, Spell, SpellCastingType } from '../types/core';

import { spellsPerDayByAbilityModifier } from '../utils/spell';

import { collections } from './collection';
import Character from './character';

export default class Spellbook {
  character: Character;
  class: Class;
  castingType: SpellCastingType;
  abilityType: AbilityType;

  constructor(c: Character, clas: Class, castingType: SpellCastingType, abilityType: AbilityType) {
    makeObservable(this, {
      cl: computed,
      abilityModifier: computed,
      classSpells: computed,
      knownSpells: computed,
    });

    this.character = c;
    this.class = clas;
    this.castingType = castingType;
    this.abilityType = abilityType;
  }

  get cl(): number {
    return this.character.getLevelForClass(this.class);
  }
  get abilityModifier(): number {
    return this.character.abilityModifier[this.abilityType];
  }

  get classSpells(): Record<number, Spell[]> {
    return collections.spell
      .getByClass(this.class)
      .map((spells) => spells.map((s) => collections.spell.getById(s)));
  }

  get knownSpellIds(): string[] {
    const fromUpgrades = this.character.upgradesWithPending.map((u) => u.spells).flat();
    let fromClass: string[] = [];

    switch (this.castingType) {
      case 'wizard-like':
        fromClass = collections.spell.getByClassLevel(this.class, 0);
    }

    return [...fromClass, ...fromUpgrades];
  }
  get knownSpells(): Array<Spell[]> {
    const spells: Array<Spell[]> = [];

    this.knownSpellIds.forEach((sId) => {
      const level = collections.spell.getSpellLevelForClass(sId, this.class);
      const spell = collections.spell.getById(sId);

      if (!spells[level]) {
        spells[level] = [];
      }

      spells[level].push(spell);
    });

    return spells;
  }

  get spellsPerDay(): number[] {
    const byClass = this.class.levels[this.cl - 1].spellsPerDay as number[];
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

  get wizardNewSpellSlots(): number {
    if (this.cl === 1) {
      return 3 + this.abilityModifier;
    }

    return 2;
  }

  static stringify(): void {
    return;
  }
}
