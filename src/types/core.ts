import { Effect } from './effectType';

export enum Alignment {
  LG = 'LG',
  NG = 'NG',
  CG = 'CG',
  LN = 'LN',
  N = 'N',
  CN = 'CN',
  LE = 'LE',
  NE = 'NE',
  CE = 'CE',
}

export enum AbilityType {
  str = 'str',
  dex = 'dex',
  con = 'con',
  int = 'int',
  wis = 'wis',
  cha = 'cha',
}

export interface Abilities {
  [AbilityType.str]: number;
  [AbilityType.dex]: number;
  [AbilityType.con]: number;
  [AbilityType.int]: number;
  [AbilityType.wis]: number;
  [AbilityType.cha]: number;
}

export type EntityType =
  | 'common'
  | 'skill'
  | 'bonusType'
  | 'race'
  | 'class'
  | 'archetype'
  | 'spell'
  | 'feat'
  | 'racialTrait'
  | 'classFeat'
  | 'weaponType'
  | 'armorType'
  | 'magicItemType'
  | 'arcaneSchool'
  | 'bloodline'
  | 'domain'
  | 'combatStyle'
  | 'fighterWeaponTrainingGroup';

export interface CalculatedValue {
  name: string;
  formula: string;
  showInName?: boolean;
  showInNameTemplate?: string;
}

export interface Entity {
  _type: EntityType;
  id: string;
  name: string;
  deprecated?: boolean;
  calculatedValues?: CalculatedValue[];
}

export interface SpecialFeat extends Entity {
  desc: string;
  effects?: Effect[];
  effectsWhen?: string;
  type?: 'su' | 'ex' | 'sp';
  replace?: string[];
  subs?: SpecialFeat[];
  when?: string; // only used for subs
}

export type SkillSystem = 'core' | 'consolidated';

export interface Skill extends Entity {
  _type: 'skill';
  ability: AbilityType;
  category?: boolean;
  parent?: string;
  core?: string[];
  armorPenalty?: boolean;
  trained?: boolean;
}

export type RaceSize = 'small' | 'medium';
export interface RacialTrait extends SpecialFeat {
  _type: 'racialTrait';
}
export interface Race extends Entity {
  _type: 'race';
  ability: Partial<Abilities>;
  racialTrait: Array<RacialTrait>;
  alternateRacialTrait: Array<RacialTrait>;
  desc: Record<string, string>;
  size: RaceSize;
  speed: number;
}

export interface SpellMeta {
  school: string;
  subschool?: string;
  level: string;
  castingTime?: string;
  components?: string;
  effect?: string;
  area?: string;
  target?: string;
  aiming?: string;
  duration?: string;
  saving?: string;
  resistance?: string;
}

export interface Spell extends Entity {
  _type: 'spell';
  meta: SpellMeta;
  book: string;
  desc: string;
}

export type SpellCastingType = 'wizard-like' | 'sorcerer-like' | 'cleric-like';

export interface FeatMeta {
  requirement?: string;
  benefit?: string;
  special?: string;
  normal?: string;
}

export type FeatType =
  | 'general'
  | 'combat'
  | 'metamagic'
  | 'item creation'
  | 'teamwork'
  | 'grit'
  | 'performance'
  | 'style'
  | 'panache'
  | 'technique'
  | 'stare'
  | 'arcane discovery';

export interface Feat extends Entity {
  _type: 'feat';
  meta: FeatMeta;
  book: string;
  type: FeatType[];
  brief: string;
  desc?: string;
  multipleTimes?: boolean;
  effectsWhen?: string;
  effects?: Effect[];
}

export interface ClassFeatGrow extends Entity {
  _type: 'common';
  level: number;
  effects?: Effect[];
}
export interface ClassFeat extends SpecialFeat {
  _type: 'classFeat';
  grow?: Array<ClassFeatGrow>;
  origin?: ClassFeat;
  placeholder?: boolean;
  subs?: ClassFeat[];
}

export interface ClassLevel {
  level: number;
  bab: Array<number>;
  fortitude: number;
  reflex: number;
  will: number;
  special?: Array<string>;
  spellsPerDay?: Array<number>;
  spellsKnown?: Array<number>;
}

export interface Class extends Entity {
  _type: 'class';
  desc: Record<string, string>;
  hd: number;
  alignment: Alignment[];
  classSkills: Array<string>;
  skillPoints: number;
  feats: Array<ClassFeat>;
  levels: Array<ClassLevel>;
}

export interface Archetype extends Entity {
  _type: 'archetype';
  class: string;
  book: string;
  desc: Record<string, string>;
  feats: Array<ClassFeat>;
}

export type WeaponTraining = 'simple' | 'martial' | 'exotic';
export type WeaponCategory = 'light' | 'one-handed' | 'two-handed' | 'ranged' | 'unarmed attacks';
export type WeaponDamageType = 'P' | 'B' | 'S' | 'P or S' | 'B or S' | 'B and P' | 'P and S';

export interface FighterWeaponTrainingGroup extends Entity {
  _type: 'fighterWeaponTrainingGroup';
  weapons: string[];
}

export interface WeaponTypeMeta {
  training: WeaponTraining;
  category: WeaponCategory;
  cost: string;
  damage?: string;
  critical?: string;
  range?: number;
  weight: number;
  damageType?: WeaponDamageType;
  special?: string[];
  bothHand?: boolean;
  fighterWeaponTrainingGroup?: string[];
}

export interface WeaponType extends Entity {
  _type: 'weaponType';
  desc?: string;
  meta: WeaponTypeMeta;
}

export type ArmorCategory = 'light' | 'medium' | 'heavy' | 'shield';

export interface ArmorTypeMeata {
  category: ArmorCategory;
  cost: string;
  ac: number;
  maxDex?: number;
  penalty: number;
  arcaneFailureChance: string;
  speed30?: number;
  speed20?: number;
  weight: number;
  buckler?: boolean;
}
export interface ArmorType extends Entity {
  _type: 'armorType';
  desc?: string;
  meta: ArmorTypeMeata;
}

export type WeaponSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge';

export interface Weapon extends Entity {
  _type: 'common';
  equipmentType: 'weapon';
  type: WeaponType;
  masterwork: boolean;
  enchantment: number;
  size: WeaponSize;
}

export type ArmorSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge';

export interface Armor extends Entity {
  _type: 'common';
  equipmentType: 'armor';
  type: ArmorType;
  masterwork: boolean;
  enchantment: number;
  spiked: boolean;
  size: ArmorSize;
}

export type MagicItemSlot =
  | 'ring'
  | 'belt'
  | 'body'
  | 'chest'
  | 'eyes'
  | 'feet'
  | 'hand'
  | 'head'
  | 'headband'
  | 'neck'
  | 'shoulders'
  | 'wrists'
  | 'none';

export interface MagicItemTypeMeta {
  group: string;
  price: string;
  weight: number;
  casterLevel: number;
  aura: string;
  slot: MagicItemSlot;
}

export interface MagicItemType extends Entity {
  _type: 'magicItemType';
  desc?: string;
  meta: MagicItemTypeMeta;
  effects?: Effect[];
  effectsWhen?: string;
}

export interface MagicItem extends Entity {
  _type: 'common';
  equipmentType: 'magicItem';
  type: MagicItemType;
}

export type SpellItemType = 'potion' | 'scroll' | 'wand';

export interface SpellItem extends Entity {
  _type: 'common';
  equipmentType: 'spellItem';
  spellItemType: SpellItemType;
  type: Spell;
}

export type EquipmentType = 'weapon' | 'armor' | 'magicItem' | 'spellItem';
export type Equipment = Weapon | Armor | MagicItem | SpellItem;

export interface BonusType extends Entity {
  stack: boolean;
  flatFootedAC?: boolean;
  touchAC?: boolean;
}

export interface Bonus {
  amount: number | number[];
  amountFormula?: string | string[];
  type: string;
  ignored?: boolean;
}

export interface NamedBonus {
  name: string;
  bonus: Bonus;
}
