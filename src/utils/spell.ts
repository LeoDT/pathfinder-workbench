import { collections } from '../store/collection';
import { ArcaneSchoolStandard } from '../types/arcaneSchool';
import { Spell } from '../types/core';
import { classTranslates } from './class';

export const translates = {
  school: '学派',
  subschool: '子学派',
  level: '环位',
  domain: '领域',
  castingTime: '施法时间',
  components: '成分',
  range: '距离',
  effect: '效果',
  target: '目标',
  area: '区域',
  aiming: '目标, 区域或区域',
  duration: '持续时间',
  saving: '豁免',
  resistance: '法术抗力',
};

export const schoolTranslates: Record<string, string> = {};
collections.arcaneSchool.data.forEach((s) => {
  schoolTranslates[s.id.toLowerCase()] = s.name;

  (s as ArcaneSchoolStandard).focused?.forEach((f) => {
    schoolTranslates[f.id.toLowerCase()] = f.name;
  });
});

export const spellsPerDayByAbilityModifier: Record<number, number[]> = {
  0: [],
  1: [1],
  2: [1, 1],
  3: [1, 1, 1],
  4: [1, 1, 1, 1],
  5: [2, 1, 1, 1, 1],
  6: [2, 2, 1, 1, 1, 1],
  7: [2, 2, 2, 1, 1, 1, 1],
  8: [2, 2, 2, 2, 1, 1, 1, 1],
  9: [3, 2, 2, 2, 2, 1, 1, 1, 1],
  10: [3, 3, 2, 2, 2, 2, 1, 1, 1],
  11: [3, 3, 3, 2, 2, 2, 2, 1, 1],
  12: [3, 3, 3, 3, 2, 2, 2, 2, 1],
  13: [4, 3, 3, 3, 3, 2, 2, 2, 2],
  14: [4, 4, 3, 3, 3, 3, 2, 2, 2],
  15: [4, 4, 4, 3, 3, 3, 3, 2, 2],
  16: [4, 4, 4, 4, 3, 3, 3, 3, 2],
  17: [5, 4, 4, 4, 4, 3, 3, 3, 3],
};

export function getLowestSpellLevelFromMeta(spell: Spell): number {
  const { level } = spell.meta;

  if (level) {
    const levels = level
      .split(', ')
      .map((l) => parseInt(l.replace(/^[a-z/\s]+\s(\d+)$/, '$1')))
      .filter((n) => !Number.isNaN(n));

    return Math.min(...levels);
  }

  return 0;
}

export function translateSpellMetaSchool(s: string): string {
  return s
    .split(', ')
    .map((s) => schoolTranslates[s] || s)
    .join(', ');
}

export function translateSpellMetaLevel(s: string): string {
  let result = s;

  Object.entries(classTranslates).forEach(([key, value]) => {
    result = result.replace(key, value);
  });

  return result;
}
