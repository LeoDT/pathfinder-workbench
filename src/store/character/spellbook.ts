import { range, without } from 'lodash-es';
import { action, computed, makeObservable } from 'mobx';

import { ArcaneSchool } from '../../types/arcaneSchool';
import { AbilityType, Bonus, Class, Spell, SpellCastingType } from '../../types/core';
import { Domain } from '../../types/domain';
import { EffectGainSpellCastingArgs } from '../../types/effectType';
import {
  validateGainArcaneSchoolEffectInput,
  validateGainDomainEffectInput,
  validateGainSchoolSpellDCEffectInput,
} from '../../utils/effect';
import { spellsPerDayByAbilityModifier } from '../../utils/spell';
import { collections } from '../collection';
import { Character } from '.';

export class CharacterSpellbook {
  character: Character;
  class: Class;
  castingType: SpellCastingType;
  abilityType: AbilityType;
  spellSourceClass: Class[];
  maxSpellLevel?: number;

  spellLevelCache: Map<string, number>;

  constructor(c: Character, clas: Class, options: EffectGainSpellCastingArgs) {
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

      domain: computed,
      domainPrepareSlot: computed,
      domainSpellLevels: computed,

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
    this.castingType = options.castingType;
    this.abilityType = options.abilityType;
    this.spellSourceClass = options.spellSourceClass
      ? collections.class.getByIds(options.spellSourceClass)
      : [clas];
    this.maxSpellLevel = options.maxSpellLevel;

    this.spellLevelCache = new Map<string, number>();
  }

  getSpellLevel(spell: Spell | string): number {
    const sId = typeof spell === 'string' ? spell : spell.id;

    const cached = this.spellLevelCache.get(sId);
    if (cached !== undefined) {
      return cached;
    }

    let level = -1;

    if (this.bloodlineSpellLevels) {
      level = this.bloodlineSpellLevels[sId] ?? -1;
    }

    if (this.domainSpellLevels) {
      level = this.domainSpellLevels[sId] ?? -1;
    }

    if (level === -1) {
      for (const [l, spells] of this.classSpells) {
        if (spells.find((s) => s.id === sId)) {
          level = l;
          break;
        }
      }
    }

    if (level !== -1) {
      this.spellLevelCache.set(sId, level);

      return level;
    }

    throw Error(`can not get spell level for ${sId}`);
  }

  get cl(): number {
    return this.character.getLevelForClass(this.class);
  }
  get abilityModifier(): number {
    return this.character.abilityModifier[this.abilityType];
  }

  get classSpells(): Map<number, Spell[]> {
    const spellLevel: Record<string, number> = {};

    const allSpells = this.spellSourceClass.map((c) => collections.spell.getByClass(c));
    let maxLevel = 0;
    for (let spellsForClass of allSpells) {
      if (this.maxSpellLevel) {
        spellsForClass = spellsForClass.slice(0, this.maxSpellLevel + 1);
      }

      for (const [level, spellsForLevel] of spellsForClass.entries()) {
        for (const s of spellsForLevel) {
          if (spellLevel[s] === undefined || spellLevel[s] > level) {
            spellLevel[s] = level;
          }
        }

        if (level > maxLevel) maxLevel = level;
      }
    }

    const result = new Map<number, Spell[]>();
    for (let i = 0; i < maxLevel; i++) {
      result.set(i, []);
    }

    for (const [sId, level] of Object.entries(spellLevel)) {
      const spell = collections.spell.getById(sId);

      if (!result.has(level)) {
        result.set(level, []);
      }

      (result.get(level) as Array<Spell>).push(spell);
    }

    return result;
  }

  partitionSpellsByLevel(spells: Spell[]): Array<Spell[]> {
    const result: Array<Spell[]> = [];

    spells.forEach((spell) => {
      const level = this.getSpellLevel(spell);

      if (!result[level]) {
        result[level] = [];
      }

      result[level].push(spell);
    });

    return result;
  }

  get knownSpellIds(): string[] {
    const fromUpgrades = this.character.upgradesWithPending
      .map((u) => u.spells)
      .flat()
      .filter((s) => !this.removedSpellIds.includes(s));
    let fromClass: string[] = [];

    switch (this.castingType) {
      case 'wizard-like':
        fromClass = (this.classSpells.get(0) || []).map((s) => s.id);
        break;
      case 'sorcerer-like':
        if (this.bloodlineSpells.length) {
          fromClass = this.bloodlineSpells.map((s) => s.id);
        }
        break;
      case 'cleric-like':
        this.spellsPerDay.forEach((c, l) => {
          if (c !== 0 || l === 0) {
            fromClass = fromClass.concat((this.classSpells.get(l) || []).map((s) => s.id));
          }
        });
        break;
    }

    return [...fromClass, ...fromUpgrades, ...this.addedSpellIds];
  }
  get knownSpells(): Array<Spell[]> {
    const spells = collections.spell.getByIds(this.knownSpellIds);

    return this.partitionSpellsByLevel(spells);
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

    return this.partitionSpellsByLevel(spells);
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

    return this.partitionSpellsByLevel(spells);
  }

  get knownSpecialSpells(): Array<Spell[]> {
    if (this.arcaneSchoolPrepareSlot) {
      const slot = this.arcaneSchoolPrepareSlot;

      const spells = collections.spell
        .getByIds(this.knownSpellIds)
        .filter((s) => s.meta.school && s.meta.school === slot.school);

      return this.partitionSpellsByLevel(spells);
    }

    if (this.domainPrepareSlot) {
      const slot = this.domainPrepareSlot;

      return this.partitionSpellsByLevel(slot.spells);
    }

    return [];
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

  get domain(): { domains: Domain[]; spells: boolean } | null {
    const es = this.character.effect.getGainDomainEffects()?.[0];

    if (es) {
      const input = validateGainDomainEffectInput(es.input);

      if (!input) {
        return null;
      }

      return {
        domains: collections.domain.getByIds(input.domains),
        spells: es.effect.args.spells,
      };
    }

    return null;
  }
  get domainSpellLevels(): Record<string, number> | null {
    if (this.domain?.spells) {
      const result: Record<string, number> = {};

      this.domain?.domains.forEach((d) => {
        d.spells?.forEach((s, l) => {
          if (result[s] === undefined) {
            result[s] = l;
          } else {
            result[s] = result[s] > l ? l : result[s];
          }
        });
      });

      return result;
    }

    return null;
  }
  get domainPrepareSlot(): { amount: number; spells: Spell[] } | null {
    if (this.domain?.spells) {
      return {
        amount: 1,
        spells: this.domain?.domains
          .map((d) => (d.spells ? collections.spell.getByIds(d.spells) : []))
          .flat(),
      };
    }

    return null;
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

  get bloodlineSpellLevels(): Record<string, number> | null {
    if (this.bloodlineSpells.length) {
      const result: Record<string, number> = {};

      this.bloodlineSpells.forEach((s, l) => {
        result[s.id] = l + 1;
      });

      return result;
    }

    return null;
  }

  getSorcererNewSpellSlotsForLevel(spellLevel: number): number {
    const level = this.character.getLevelForClass(this.class);
    const currentLevel = collections.class.getClassLevel(this.class, level);

    if (currentLevel.spellsKnown) {
      const currentLevelSpellsKnown = currentLevel.spellsKnown[spellLevel] || 0;

      if (level === 1) {
        return currentLevelSpellsKnown;
      } else {
        const lastLevel = collections.class.getClassLevel(this.class, level - 1);

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

  getDifficultyClass(s: Spell): number {
    const l = this.getSpellLevel(s);

    const es = this.character.effect.getGainSchoolSpellDCEffects();
    const bonuses: Bonus[] = [];

    if (es) {
      es.forEach(({ effect, input }) => {
        const realInput = validateGainSchoolSpellDCEffectInput(input);
        const school = collections.arcaneSchool.getById(realInput.school);

        if (s.meta.school.toLowerCase() === school.id.toLowerCase()) {
          bonuses.push(effect.args.bonus);
        }
      });
    }

    return 10 + this.abilityModifier + l + this.character.aggregateBonusesMaxAmount(bonuses);
  }
}
