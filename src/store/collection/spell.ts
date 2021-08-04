import SPELL_BY_CLASS_LEVEL from '../../data/spell-by-class-level.json';
import { Class, Spell } from '../../types/core';
import { Collection, CollectionOptions } from './base';

export class SpellCollection extends Collection<Spell> {
  SPELL_BY_CLASS_LEVEL: Record<string, string[][]>;

  constructor(data: Array<Spell>, options?: CollectionOptions) {
    super('spell', data, options);

    this.SPELL_BY_CLASS_LEVEL = SPELL_BY_CLASS_LEVEL as Record<string, string[][]>;
  }

  getByClass(clas: Class | string): string[][] {
    const cId = (typeof clas === 'string' ? clas : clas.id).toLowerCase();

    if (!this.SPELL_BY_CLASS_LEVEL[cId]) {
      throw Error(`no class/spell data for ${cId}`);
    }

    return this.SPELL_BY_CLASS_LEVEL[cId];
  }

  getByClassLevel(clas: Class | string, level: number): string[] {
    const spells = this.getByClass(clas);

    if (!spells[level]) {
      const cId = typeof clas === 'string' ? clas : clas.id;
      throw Error(`no class/spell data for ${cId} in level ${level}`);
    }

    return spells[level];
  }

  getSpellLevelForClass(
    spell: Spell | string,
    clas: Class | string,
    spellLevels?: Record<string, number>
  ): number {
    const allSpells = this.getByClass(clas);
    const sId = typeof spell === 'string' ? spell : spell.id;

    const level =
      spellLevels?.[sId] ?? allSpells.findIndex((spells) => spells.find((s) => s === sId));

    if (level === -1) {
      throw new Error(
        `can not find spell "${sId}" for class ${typeof clas === 'string' ? clas : clas.id}`
      );
    }

    return level;
  }
}
