import { range } from 'lodash-es';
import shortid from 'shortid';
import {
  ArmorSize,
  ArmorType,
  WeaponSize,
  WeaponType,
  Equipment,
  Weapon,
  Armor,
} from '../types/core';

import { getArmorCostWeightInSize } from './armorType';
import { Coin, makeCoin, makeCoinFromString } from './coin';

export const equipmentTypeTranslates = {
  weapon: '武器',
  armor: '护甲',
};

export const MAX_ENCHANTMENT = 5;
export const enchantmentOptions = range(MAX_ENCHANTMENT + 1).map((i) => ({
  text: `+${i}`,
  value: i,
}));

export const armorSpikeWeightRise = 10;
export const armorSpikeCost = 50;
export const shieldSpikeWeightRise = 5;
export const shieldSpikeCost = 10;

export const armorMasterworkCost = 150;
export const armorEnchantmentCosts = [1000, 4000, 9000, 16000, 25000];

export const weaponEnchantmentCosts = [2000, 8000, 18000, 32000, 50000];
export const weaponMasterworkCost = 300;

export function armorCostWeight(
  type: ArmorType,
  size: ArmorSize,
  masterwork: boolean,
  enchantment: number,
  spiked: boolean
): { cost: Coin; weight: number } {
  const { cost: baseCost, weight: baseWeight } = getArmorCostWeightInSize(type, size);

  let cost = baseCost.amount;
  let weight = baseWeight;
  let realMasterwork = masterwork;

  if (enchantment) {
    cost += armorEnchantmentCosts[enchantment - 1] ?? 0;
    realMasterwork = false;
  }

  if (realMasterwork) {
    cost += armorMasterworkCost;
  }

  if (spiked) {
    if (type.meta.category === 'shield') {
      cost += shieldSpikeCost;
      weight += shieldSpikeWeightRise;
    } else {
      cost += armorSpikeCost;
      weight += armorSpikeWeightRise;
    }
  }

  return { cost: makeCoin(cost), weight };
}

export function weaponCostWeight(
  type: WeaponType,
  size: WeaponSize,
  masterwork: boolean,
  enchantment: number
): { cost: Coin; weight: number } {
  let cost = makeCoinFromString(type.meta.cost).amount;
  let weight = type.meta.weight;
  let realMasterwork = masterwork;

  if (size === 'small') {
    weight /= 2;
  }

  if (size === 'large') {
    weight *= 2;
  }

  if (enchantment) {
    cost += weaponEnchantmentCosts[enchantment - 1] ?? 0;
    realMasterwork = false;
  }

  if (realMasterwork) {
    cost += weaponMasterworkCost;
  }

  return { cost: makeCoin(cost), weight };
}

export function equipmentCostWeight(e: Equipment): { cost: Coin; weight: number } {
  switch (e.equipmentType) {
    case 'armor':
      return armorCostWeight(e.type, e.size, e.masterwork, e.enchantment, e.spiked);

    case 'weapon':
      return weaponCostWeight(e.type, e.size, e.masterwork, e.enchantment);
  }
}

export function makeArmor(
  type: ArmorType,
  name: string,
  size: ArmorSize,
  masterwork: boolean,
  enchantment: number,
  spiked: boolean
): Armor {
  return {
    _type: 'common',
    equipmentType: 'armor',
    id: shortid(),
    name,
    type,
    size,
    masterwork,
    enchantment,
    spiked,
  };
}

export function makeWeapon(
  type: WeaponType,
  name: string,
  size: WeaponSize,
  masterwork: boolean,
  enchantment: number
): Weapon {
  return {
    _type: 'common',
    equipmentType: 'weapon',
    id: shortid(),
    name,
    type,
    size,
    masterwork,
    enchantment,
  };
}
