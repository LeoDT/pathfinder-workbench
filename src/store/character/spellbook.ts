import { range, without } from 'lodash-es';
import { computed, makeObservable } from 'mobx';

import { ArcaneSchool } from '../../types/arcaneSchool';
import { AbilityType, Class, Spell, SpellCastingType } from '../../types/core';
import { validateGainArcaneSchoolEffectInput } from '../../utils/effect';
import { partitionSpellsByLevel, spellsPerDayByAbilityModifier } from '../../utils/spell';
import { collections } from '../collection';
import Character from '.';
import { EffectGainArcaneSchoolPrepareSlotArgs } from '../../types/effectType';

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
    const spells = collections.spell.getByIds(this.knownSpellIds);

    return partitionSpellsByLevel(spells, this.class);
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

    return partitionSpellsByLevel(spells, this.class);
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

    return partitionSpellsByLevel(spells, this.class);
  }

  get knownSpecialSpells(): Array<Spell[]> {
    const slot = this.arcaneSchoolPrepareSlot;
    if (!slot) {
      return [];
    }

    const spells = collections.spell
      .getByIds(this.knownSpellIds)
      .filter((s) => s.meta.school && s.meta.school === slot.school);

    return partitionSpellsByLevel(spells, this.class);
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
  get arcaneSchoolPrepareSlot(): EffectGainArcaneSchoolPrepareSlotArgs | null {
    const es = this.character.effect.getGainArcaneSchoolPrepareSlotEffects()?.[0];

    if (es) {
      const { effect } = es;

      return {
        amount: effect.args.amount ?? 1,
        school: effect.args.school,
      };
    }

    return null;
  }

  get wizardNewSpellSlots(): number {
    if (this.cl === 1) {
      return 3 + this.abilityModifier;
    }

    return 2;
  }

  getSlotUsageForSpell(s: Spell): number {
    const forbid = this.arcaneSchool?.forbiddenSchool.map((s) => s.id.toLowerCase());
    if (forbid) {
      return forbid.includes(s.meta.school) ? 2 : 1;
    }

    return 1;
  }
}
