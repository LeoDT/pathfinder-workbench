import { range } from 'lodash-es';
import shortid from 'shortid';

import {
  Armor,
  ArmorSize,
  ArmorType,
  Equipment,
  MagicItem,
  MagicItemType,
  Weapon,
  WeaponSize,
  WeaponType,
} from '../types/core';
import { getArmorCostWeightInSize } from './armorType';
import { Coin, makeCoin, makeCoinFromString } from './coin';

export const equipmentTypeTranslates = {
  weapon: '武器',
  armor: '护甲',
  magicItem: '奇物',
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

export function magicItemCostWeight(type: MagicItemType): { cost: Coin; weight: number } {
  return {
    cost: makeCoinFromString(type.meta.price),
    weight: type.meta.weight,
  };
}

export function equipmentCostWeight(e: Equipment): { cost: Coin; weight: number } {
  switch (e.equipmentType) {
    case 'armor':
      return armorCostWeight(e.type, e.size, e.masterwork, e.enchantment, e.spiked);

    case 'weapon':
      return weaponCostWeight(e.type, e.size, e.masterwork, e.enchantment);

    case 'magicItem':
      return magicItemCostWeight(e.type);
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

export function makeMagicItem(type: MagicItemType, name: string): MagicItem {
  return {
    _type: 'common',
    equipmentType: 'magicItem',
    id: shortid(),
    name,
    type,
  };
}

export function showEquipment(e: Equipment): string {
  switch (e.equipmentType) {
    case 'weapon':
    case 'armor': {
      const n = [e.name];

      if (e.enchantment) {
        n.push(`+${e.enchantment}`);
      }

      if (e.masterwork && !e.enchantment) {
        n.push('(精品)');
      }

      if (e.equipmentType === 'armor' && e.spiked) {
        n.unshift('带刺');
      }

      return n.join('');
    }

    default:
      return e.name;
  }
}

export function getWeaponModifier(w: Weapon): number {
  let mod = 0;

  if (w.enchantment) {
    mod += w.enchantment;
  }

  if (w.masterwork && !w.enchantment) {
    mod += 1;
  }

  return mod;
}

export function getWeaponDamageModifier(w: Weapon): number {
  let mod = 0;

  if (w.enchantment) {
    mod += w.enchantment;
  }

  return mod;
}

export function getArmorPenalty(a: Armor): number {
  let mod = a.type.meta.penalty;

  if (a.enchantment) {
    mod += 1;
  }

  if (a.masterwork && !a.enchantment) {
    mod += 1;
  }

  return mod;
}
