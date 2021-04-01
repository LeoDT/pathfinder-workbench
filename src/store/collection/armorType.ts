import { ArmorType } from '../../types/core';

import ARMOR_SIZE_DATA from '../../data/armor-size.json';

import { Coin, coinMultiply } from '../../utils/coin';
import { Collection, CollectionOptions } from './base';

export type ArmorSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge';

export default class ArmorTypeCollection extends Collection<ArmorType> {
  static sizeCostWeight = ARMOR_SIZE_DATA as Record<ArmorSize, { cost: number; weight: number }>;

  constructor(data: Array<ArmorType>, options?: CollectionOptions) {
    super('armorType', data, options);
  }

  getCostWeightForSize(a: ArmorType, size: ArmorSize): { cost: Coin; weight: number } {
    const { cost, weight } = a.meta;

    const multipliers = ArmorTypeCollection.sizeCostWeight[size];

    if (multipliers) {
      return { cost: coinMultiply(cost, multipliers.cost), weight: weight * multipliers.weight };
    }

    throw new Error(`invalid armor size: ${size}`);
  }
}
