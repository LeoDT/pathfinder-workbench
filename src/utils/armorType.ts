import { ArmorType, ArmorSize } from '../types/core';

import ARMOR_SIZE_DATA from '../data/armor-size.json';
import { Coin, coinMultiply } from './coin';

export const armorTypeMetaTranslates = {
  category: '盔甲类型',
  cost: '价格',
  ac: '护甲加值',
  maxDex: '最大敏捷加值',
  penalty: '防具检定减值',
  arcaneFailureChance: '奥术失败机率',
  speed30: '速度30尺',
  speed20: '速度20尺',
  weight: '重量',
  buckler: '小圆盾',
};

export const armorCategoryTranslates = {
  light: '轻型盔甲',
  medium: '中型盔甲',
  heavy: '重型盔甲',
  shield: '盾牌',
};

export function getArmorCostWeightInSize(
  a: ArmorType,
  size: ArmorSize
): { cost: Coin; weight: number } {
  const { cost, weight } = a.meta;

  const multipliers = ARMOR_SIZE_DATA[size];

  if (multipliers) {
    return { cost: coinMultiply(cost, multipliers.cost), weight: weight * multipliers.weight };
  }

  throw new Error(`invalid armor size: ${size}`);
}
