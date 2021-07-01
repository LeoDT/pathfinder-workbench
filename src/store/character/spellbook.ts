import { range, without } from 'lodash-es';
import { action, computed, makeObservable } from 'mobx';

import { ArcaneSchool } from '../../types/arcaneSchool';
import { AbilityType, Class, Spell, SpellCastingType } from '../../types/core';
import { getClassLevel } from '../../utils/class';
import { validateGainArcaneSchoolEffectInput } from '../../utils/effect';
import { spellsPerDayByAbilityModifier } from '../../utils/spell';
import { collections } from '../collection';
import { Character } from '.';

export interface SpellManageAction {
  action: 'add' | 'remove';
  spellId: string;
}

export class CharacterSpellbook {
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
      preparedSpellIds: computed,
      preparedSpells: computed,

      knownSpecialSpells: computed,
      preparedSpecialSpellIds: computed,
      preparedSpecialSpells: computed,

      arcaneSchool: computed,
      arcaneSchoolPrepareSlot: computed,

      bloodlineSpells: computed,
      bloodlineSpellLevels: computed,

      addedSpellIds: computed,
      removedSpellIds: computed,

      addSpell: action,
      removeSpell: action,
    });

    this.character = c;
    this.class = clas;
    this.castingType = castingType;
    this.abilityType = abilityType;
  }

  getSpellLevel(spell: Spell | string): number {
    let spellLevels = undefined;

    if (this.bloodlineSpells.length) {
      spellLevels = this.bloodlineSpellLevels;
    }

    return collections.spell.getSpellLevelForClass(spell, this.class, spellLevels);
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
    const fromUpgrades = this.character.upgradesWithPending
      .map((u) => u.spells)
      .flat()
      .filter((s) => !this.removedSpellIds.includes(s));
    let fromClass: string[] = [];

    switch (this.castingType) {
      case 'wizard-like':
        fromClass = collections.spell.getByClassLevel(this.class, 0);
        break;
      case 'sorcerer-like':
        if (this.bloodlineSpells.length) {
          fromClass = this.bloodlineSpells.map((s) => s.id);
        }
        break;
    }

    return [...fromClass, ...fromUpgrades, ...this.addedSpellIds];
  }
  get knownSpells(): Array<Spell[]> {
    const spells = collections.spell.getByIds(this.knownSpellIds);
    let spellLevels = undefined;

    if (this.bloodlineSpells.length) {
      spellLevels = this.bloodlineSpellLevels;
    }

    return collections.spell.partitionSpellsByLevel(spells, this.class, spellLevels);
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

  get preparedSpellIds(): string[] {
    return this.character.preparedSpellIds.get(this.class.id) ?? [];
  }
  get preparedSpells(): Array<Spell[]> {
    const spells = collections.spell.getByIds(this.preparedSpellIds);

    return collections.spell.partitionSpellsByLevel(spells, this.class);
  }

  prepareSpell(s: Spell): void {
    this.character.preparedSpellIds.set(this.class.id, [...this.preparedSpellIds, s.id]);
  }
  unprepareSpell(s: Spell): void {
    if (this.castingType === 'wizard-like') {
      this.wizardUnprepareSpell(s);
    } else {
      this.character.preparedSpellIds.set(this.class.id, without(this.preparedSpellIds, s.id));
    }
  }
  wizardUnprepareSpell(s: Spell): void {
    const index = this.preparedSpellIds.lastIndexOf(s.id);
    const ids = [...this.preparedSpellIds];
    ids.splice(index, 1);

    this.character.preparedSpellIds.set(this.class.id, ids);
  }

  get preparedSpecialSpellIds(): string[] {
    return this.character.preparedSpecialSpellIds.get(this.class.id) ?? [];
  }
  get preparedSpecialSpells(): Array<Spell[]> {
    const spells = collections.spell.getByIds(this.preparedSpecialSpellIds);

    return collections.spell.partitionSpellsByLevel(spells, this.class);
  }

  get knownSpecialSpells(): Array<Spell[]> {
    const slot = this.arcaneSchoolPrepareSlot;
    if (!slot) {
      return [];
    }

    const spells = collections.spell
      .getByIds(this.knownSpellIds)
      .filter((s) => s.meta.school && s.meta.school === slot.school);

    return collections.spell.partitionSpellsByLevel(spells, this.class);
  }

  prepareSpecialSpell(s: Spell): void {
    this.character.preparedSpecialSpellIds.set(this.class.id, [
      ...this.preparedSpecialSpellIds,
      s.id,
    ]);
  }
  unprepareSpecialSpell(s: Spell): void {
    this.character.preparedSpecialSpellIds.set(
      this.class.id,
      without(this.preparedSpecialSpellIds, s.id)
    );
  }

  get arcaneSchool(): {
    school: ArcaneSchool;
    forbiddenSchool: ArcaneSchool[];
    focused?: string;
  } | null {
    const es = this.character.effect.getGainArcaneSchoolEffects()?.[0];

    if (es) {
      const input = validateGainArcaneSchoolEffectInput(es.input);

      const school = collections.arcaneSchool.getById(input.school);
      const forbiddenSchool = collections.arcaneSchool.getByIds(input.forbiddenSchool);

      return { school, forbiddenSchool, focused: input.focused };
    }

    return null;
  }
  get arcaneSchoolPrepareSlot(): { amount: number; school: string } | null {
    switch (this.arcaneSchool?.school.type) {
      case 'elemental':
        return { amount: 1, school: this.arcaneSchool?.school.id.toLowerCase() };
      case 'standard':
        if (this.arcaneSchool?.school.noSchoolSlot) {
          return null;
        }

        return { amount: 1, school: this.arcaneSchool?.school.id.toLowerCase() };
      default:
        return null;
    }
  }

  get wizardNewSpellSlots(): number {
    if (this.cl === 1) {
      return 3 + this.abilityModifier;
    }

    return 2;
  }

  get bloodlineSpells(): Spell[] {
    if (this.character.bloodline) {
      const { spells } = this.character.bloodline;
      const shouldKnow = Math.floor((this.cl - 1) / 2); // 1 spell every 2 level from lv.3

      return collections.spell.getByIds(spells.slice(0, shouldKnow));
    }

    return [];
  }

  get bloodlineSpellLevels(): Record<string, number> {
    const result: Record<string, number> = {};

    this.bloodlineSpells.forEach((s, l) => {
      result[s.id] = l + 1;
    });

    return result;
  }

  getSorcererNewSpellSlotsForLevel(spellLevel: number): number {
    const level = this.character.getLevelForClass(this.class);
    const currentLevel = getClassLevel(this.class, level);

    if (currentLevel.spellsKnown) {
      const currentLevelSpellsKnown = currentLevel.spellsKnown[spellLevel] || 0;

      if (level === 1) {
        return currentLevelSpellsKnown;
      } else {
        const lastLevel = getClassLevel(this.class, level - 1);

        if (lastLevel.spellsKnown) {
          return currentLevelSpellsKnown - (lastLevel.spellsKnown[spellLevel] || 0);
        } else {
          throw new Error(`no spells known for class ${this.class.name} at level ${level}`);
        }
      }
    } else {
      throw new Error(`no spells known for class ${this.class.name} at level ${level}`);
    }
  }

  getSlotUsageForSpell(s: Spell): number {
    const forbid = this.arcaneSchool?.forbiddenSchool.map((s) => s.id.toLowerCase());
    if (forbid) {
      return forbid.includes(s.meta.school) ? 2 : 1;
    }

    return 1;
  }

  get addedSpellIds(): string[] {
    return this.character.spellManageHistory
      .filter((m) => m.action === 'add')
      .map((m) => m.spellId);
  }
  get removedSpellIds(): string[] {
    return this.character.spellManageHistory
      .filter((m) => m.action === 'remove')
      .map((m) => m.spellId);
  }
  addSpell(s: Spell | string): void {
    const id = typeof s === 'string' ? s : s.id;

    const removed = this.character.spellManageHistory.find(
      (m) => m.action === 'remove' && m.spellId === id
    );

    if (removed) {
      this.character.spellManageHistory.remove(removed);
    } else {
      this.character.spellManageHistory.push({ action: 'add', spellId: id });
    }
  }

  removeSpell(s: Spell): void {
    const id = typeof s === 'string' ? s : s.id;

    const added = this.character.spellManageHistory.find(
      (m) => m.action === 'add' && m.spellId === id
    );

    if (added) {
      this.character.spellManageHistory.remove(added);
    } else {
      this.character.spellManageHistory.push({ action: 'remove', spellId: id });
    }
  }
}
