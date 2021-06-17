import SPELL_BY_CLASS_LEVEL from '../../data/spell-by-class-level.json';
import { Class, Spell } from '../../types/core';
import { Collection, CollectionOptions } from './base';

export class SpellCollection extends Collection<Spell> {
  static spellByClassLevel = SPELL_BY_CLASS_LEVEL as Record<string, string[][]>;

  constructor(data: Array<Spell>, options?: CollectionOptions) {
    super('spell', data, options);
  }

  getByClass(clas: Class | string): string[][] {
    const cId = (typeof clas === 'string' ? clas : clas.id).toLowerCase();

    if (!SpellCollection.spellByClassLevel[cId]) {
      throw Error(`no class/spell data for ${cId}`);
    }

    return SpellCollection.spellByClassLevel[cId];
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

  partitionSpellsByLevel(
    spells: Spell[],
    clas: Class,
    spellLevels?: Record<string, number>
  ): Array<Spell[]> {
    const result: Array<Spell[]> = [];

    spells.forEach((spell) => {
      const level = this.getSpellLevelForClass(spell, clas, spellLevels);

      if (!result[level]) {
        result[level] = [];
      }

      result[level].push(spell);
    });

    return result;
  }
}
