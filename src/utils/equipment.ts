import { range } from 'lodash-es';
import shortid from 'shortid';

import {
  Armor,
  ArmorSize,
  ArmorType,
  Equipment,
  MagicItem,
  MagicItemType,
  Spell,
  SpellItem,
  SpellItemType,
  Weapon,
  WeaponSize,
  WeaponType,
} from '../types/core';
import { getArmorCostWeightInSize } from './armorType';
import { Coin, makeCoin, makeCoinFromString } from './coin';
import { getLowestSpellLevelFromMeta } from './spell';

export const equipmentTypeTranslates = {
  weapon: '武器',
  armor: '护甲',
  magicItem: '奇物',
  spellItem: '药剂/卷轴/魔杖',
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

const scrollCosts = [12.5, 25, 150, 375, 700, 1125, 1650, 2275, 3000, 3825];
const potionCosts = [25, 50, 300, 750];
const wandCosts = [375, 750, 4500, 11250, 210000];

export function spellItemCostWeight(
  spell: Spell,
  type: SpellItemType
): { cost: Coin; weight: number } {
  const level = getLowestSpellLevelFromMeta(spell);
  let cost = 0;

  switch (type) {
    case 'scroll':
      cost = scrollCosts[level] ?? 0;
      break;
    case 'potion':
      cost = potionCosts[level] ?? 0;
      break;
    case 'wand':
      cost = wandCosts[level] ?? 0;
      break;
  }

  return { cost: makeCoin(cost), weight: 0 };
}

export function equipmentCostWeight(e: Equipment): { cost: Coin; weight: number } {
  switch (e.equipmentType) {
    case 'armor':
      return armorCostWeight(e.type, e.size, e.masterwork, e.enchantment, e.spiked);

    case 'weapon':
      return weaponCostWeight(e.type, e.size, e.masterwork, e.enchantment);

    case 'magicItem':
      return magicItemCostWeight(e.type);

    case 'spellItem':
      return spellItemCostWeight(e.type, e.spellItemType);
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

export function makeSpellItem(spell: Spell, type: SpellItemType, name: string): SpellItem {
  return {
    _type: 'common',
    equipmentType: 'spellItem',
    id: shortid(),
    name,
    spellItemType: type,
    type: spell,
  };
}

export const spellItemTypeTranslates: Record<SpellItemType, string> = {
  scroll: '卷轴',
  potion: '药剂',
  wand: '魔杖',
};
export function getSpellItemDefaultName(spell: Spell, type: SpellItemType): string {
  return `${spell.name}${spellItemTypeTranslates[type]}`;
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

export function getArmorMaxDex(a: Armor): number {
  return a.type.meta.maxDex ?? Infinity;
}
