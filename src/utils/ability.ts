import { mapValues } from 'lodash-es';

import { Abilities, AbilityType } from '../store/types';

export const ABILITY_TYPES = [
  AbilityType.str,
  AbilityType.dex,
  AbilityType.con,
  AbilityType.int,
  AbilityType.wis,
  AbilityType.cha,
];

export const abilityTranslates = {
  str: '力量',
  dex: '敏捷',
  con: '体质',
  int: '智力',
  wis: '感知',
  cha: '魅力',
};

export function addBonusScores(base: Abilities, bonus: Partial<Abilities>): Abilities {
  return {
    str: base.str + (bonus.str ?? 0),
    dex: base.dex + (bonus.dex ?? 0),
    con: base.con + (bonus.con ?? 0),
    int: base.int + (bonus.int ?? 0),
    wis: base.wis + (bonus.wis ?? 0),
    cha: base.cha + (bonus.cha ?? 0),
  };
}

export function getModifierFromScore(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getModifiers(ab: Abilities): Abilities {
  return mapValues(ab, getModifierFromScore);
}

export function showModifier(mod: number): string {
  return `${mod < 0 ? '' : '+'}${mod}`;
}

export const ABILITY_COST: Record<number, number> = {
  7: -4,
  8: -2,
  9: -1,
  10: 0,
  11: 1,
  12: 2,
  13: 3,
  14: 5,
  15: 7,
  16: 10,
  17: 13,
  18: 17,
};

export const MINIMUM_ABILITY_SCORE = 7;
export const MAXIMUM_ABILITY_SCORE = 18;
export const ABILITY_POINTS = 25;

export function getScoreCost(score: number): number {
  return ABILITY_COST[score] ?? 0;
}

export function getTotalScoreCosts(ab: Abilities): number {
  return Object.values(ab)
    .map((v) => getScoreCost(v))
    .reduce((acc, v) => acc + v, 0);
}
