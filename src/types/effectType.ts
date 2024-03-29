/* eslint-disable @typescript-eslint/no-empty-interface */
import {
  AbilityType,
  ArmorCategory,
  Bonus,
  FeatType,
  NamedBonus,
  SpellCastingType,
  WeaponTraining,
} from './core';

export enum EffectType {
  gainFeat = 'gainFeat',

  abilityBonus = 'abilityBonus',
  racialAbilityBonus = 'racialAbilityBonus',

  gainSpellCasting = 'gainSpellCasting',
  gainSchoolSpellDC = 'gainSchoolSpellDC',

  gainFavoredClassAmount = 'gainFavoredClassAmount',
  gainProficiency = 'gainProficiency',
  gainSelectedWeaponProficiency = 'gainSelectedWeaponProficiency',

  gainClassSkill = 'gainClassSkill',
  gainSkill = 'gainSkill',

  gainInitiative = 'gainInitiative',
  gainAC = 'gainAC',
  gainCMD = 'gainCMD',
  gainSave = 'gainSave',
  gainHP = 'gainHP',
  gainTwoWeaponFighting = 'gainTwoWeaponFighting',
  gainSpeed = 'gainSpeed',

  classFeatSource = 'classFeatSource',
  classFeatPlaceholder = 'classFeatPlaceholder',

  enchantUnarmedStrike = 'enchantUnarmedStrike',
  addAttackOption = 'addAttackOption',
  meleeAttackAbility = 'meleeAttackAbility',
  twoHandDamageMultiplier = 'twoHandDamageMultiplier',
  gainWeaponBonus = 'gainWeaponBonus',

  addTracker = 'addTracker',

  gainArcaneSchool = 'gainArcaneSchool',

  gainBloodline = 'gainBloodline',

  gainDomain = 'gainDomain',

  gainCombatStyle = 'gainCombatStyle',

  gainFighterWeaponTraining = 'gainFighterWeaponTraining',
  gainArmorCheckPenalty = 'gainArmorCheckPenalty',
  gainArmorMaxDexBonus = 'gainArmorMaxDexBonus',

  selectFromSubs = 'selectFromSubs',

  gainGrit = 'gainGrit',
}

export interface BaseEffect<TYPE extends EffectType, ARGS> {
  type: TYPE;
  when?: string;
  args: ARGS;
  growArgs?: Array<{ level: number; args: ARGS }>;
  origin?: Effect;
}

export interface EffectGainFeatArgs {
  ignorePrerequisites?: boolean;
  featTypes?: FeatType[];
  feats?: string[]; // override above
  bloodlineFeat?: boolean; // merge above
  combatStyleFeat?: boolean; // merge above
  forceFeat?: string; // override above
}
export type EffectGainFeat = BaseEffect<EffectType.gainFeat, EffectGainFeatArgs | null>;

export interface EffectRacialAbilityBonusArgs {
  abilityType?: AbilityType;
}
export type EffectRacialAbilityBonus = BaseEffect<
  EffectType.racialAbilityBonus,
  EffectRacialAbilityBonusArgs
>;

export interface EffectAbilityBonusArgs {
  bonus: Bonus;
  abilityType: AbilityType;
}
export type EffectAbilityBonus = BaseEffect<EffectType.abilityBonus, EffectAbilityBonusArgs>;

export interface EffectGainArcaneSchoolArgs {
  standardForbidden: number;
}
export type EffectGainArcaneSchool = BaseEffect<
  EffectType.gainArcaneSchool,
  EffectGainArcaneSchoolArgs
>;
export interface EffectGainArcaneSchoolInput {
  school: string;
  focused?: string;
  forbiddenSchool: Array<string>;
}

export interface EffectGainSpellCastingArgs {
  castingType: SpellCastingType;
  abilityType: AbilityType;
  spellSourceClass?: string[];
  maxSpellLevel?: number;
}
export type EffectGainSpellCasting = BaseEffect<
  EffectType.gainSpellCasting,
  EffectGainSpellCastingArgs
>;

export interface EffectGainSchoolSpellDCArgs {
  bonus: Bonus;
}
export type EffectGainSchoolSpellDC = BaseEffect<
  EffectType.gainSchoolSpellDC,
  EffectGainSchoolSpellDCArgs
>;
export interface EffectGainSchoolSpellDCInput {
  school: string;
}

export interface EffectGainFavoredClassAmountArgs {
  amount: number;
}
export type EffectGainFavoredClassAmount = BaseEffect<
  EffectType.gainFavoredClassAmount,
  EffectGainFavoredClassAmountArgs
>;

export interface EffectGainProficiencyArgs {
  weaponWithSpecial?: string[];
  weaponTraining?: WeaponTraining[];
  armorTraining?: ArmorCategory[];
  shieldTraining?: 'normal'[];
  weapon?: string[];
  armor?: string[];
  shield?: string[];
}
export type EffectGainProficiency = BaseEffect<
  EffectType.gainProficiency,
  EffectGainProficiencyArgs
>;

export interface EffectGainSelectedWeaponProficiencyArgs {
  training: WeaponTraining[];
}
export type EffectGainSelectedWeaponProficiency = BaseEffect<
  EffectType.gainSelectedWeaponProficiency,
  EffectGainSelectedWeaponProficiencyArgs
>;

export interface EffectGainSkillArgs {
  skillId: string;
  bonus: Bonus;
}
export type EffectGainSkill = BaseEffect<EffectType.gainSkill, EffectGainSkillArgs>;

export interface EffectGainClassSkillArgs {
  skillId: string;
}
export type EffectGainClassSkill = BaseEffect<EffectType.gainClassSkill, EffectGainClassSkillArgs>;

export interface EffectGainInitiativeArgs {
  bonus: Bonus;
}
export type EffectGainInitiative = BaseEffect<EffectType.gainInitiative, EffectGainInitiativeArgs>;

export interface EffectGainACArgs {
  bonus: Bonus;
}
export type EffectGainAC = BaseEffect<EffectType.gainAC, EffectGainACArgs>;

export interface EffectGainCMDArgs {
  bonus: Bonus;
}
export type EffectGainCMD = BaseEffect<EffectType.gainCMD, EffectGainCMDArgs>;

export interface EffectGainSaveArgs {
  saveType: 'fortitude' | 'will' | 'reflex' | 'all';
  bonus: Bonus;
}
export type EffectGainSave = BaseEffect<EffectType.gainSave, EffectGainSaveArgs>;

export interface EffectGainHPArgs {
  bonus: Bonus;
}
export type EffectGainHP = BaseEffect<EffectType.gainHP, EffectGainHPArgs>;

export interface EffectGainTwoWeaponFightingArgs {}
export type EffectGainTwoWeaponFighting = BaseEffect<
  EffectType.gainTwoWeaponFighting,
  EffectGainTwoWeaponFightingArgs
>;

export interface EffectGainSpeedArgs {
  bonus: Bonus;
}
export type EffectGainSpeed = BaseEffect<EffectType.gainSpeed, EffectGainSpeedArgs>;

export interface EffectClassFeatSourceArgs {
  source?: string;
}
export type EffectClassFeatSource = BaseEffect<
  EffectType.classFeatSource,
  EffectClassFeatSourceArgs
>;

export interface EffectClassFeatPlaceholderArgs {}
export type EffectClassFeatPlaceholder = BaseEffect<
  EffectType.classFeatPlaceholder,
  EffectClassFeatPlaceholderArgs
>;

export interface EffectEnchantUnarmedStrikeArgs {
  damage: string;
}
export type EffectEnchantUnarmedStrike = BaseEffect<
  EffectType.enchantUnarmedStrike,
  EffectEnchantUnarmedStrikeArgs
>;

export interface EffectAddAttackOptionArgs {
  extraAttack?: {
    by: 'maxBab';
    amount: number;
  };
  ignoreTwoWeapon?: boolean;
  damageMultiplier?: number;
  attackBonuses?: NamedBonus[];
  damageBonuses?: Array<{
    applyMultiplier?: AbilityType;
    bonus: NamedBonus;
  }>;
}
export type EffectAddAttackOption = BaseEffect<
  EffectType.addAttackOption,
  EffectAddAttackOptionArgs
>;

export interface EffectMeleeAttackAbilityArgs {
  ability: AbilityType;
}
export type EffectMeleeAttackAbility = BaseEffect<
  EffectType.meleeAttackAbility,
  EffectMeleeAttackAbilityArgs
>;

export interface EffectTwoHandDamageMultiplierArgs {
  multiplier: number;
}
export type EffectTwoHandDamageMultiplier = BaseEffect<
  EffectType.twoHandDamageMultiplier,
  EffectTwoHandDamageMultiplierArgs
>;

export interface EffectGainWeaponBonusArgs {
  attackBonus?: Bonus;
  damageBonus?: Bonus;
}
export type EffectGainWeaponBonus = BaseEffect<
  EffectType.gainWeaponBonus,
  EffectGainWeaponBonusArgs
>;
export type EffectGainWeaponBonusInput = string;

export interface EffectAddTrackerArgs {
  id?: string;
  name?: string;
  max?: number;
  maxFormula?: string;
}
export type EffectAddTracker = BaseEffect<EffectType.addTracker, EffectAddTrackerArgs>;

export interface EffectGainBloodlineArgs {
  sorcerer: boolean;
  bloodrager: boolean;
}
export type EffectGainBloodline = BaseEffect<EffectType.gainBloodline, EffectGainBloodlineArgs>;

export interface EffectGainBloodlineInput {
  bloodline: string;
}

export interface EffectGainDomainArgs {
  inquisition: boolean;
  druid: boolean;
  amount: number;
  spells: boolean;
}
export type EffectGainDomain = BaseEffect<EffectType.gainDomain, EffectGainDomainArgs>;
export interface EffectGainDomainInput {
  domains: string[];
}

export interface EffectSelectFromSubsArgs {}
export type EffectSelectFromSubs = BaseEffect<EffectType.selectFromSubs, EffectSelectFromSubsArgs>;
export type EffectSelectFromSubsInput = string[];

export interface EffectGainCombatStyleArgs {}
export type EffectGainCombatStyle = BaseEffect<
  EffectType.gainCombatStyle,
  EffectGainCombatStyleArgs
>;
export type EffectGainCombatStyleInput = string;

export interface EffectGainGritArgs {
  trackerId: string;
}
export type EffectGainGrit = BaseEffect<EffectType.gainGrit, EffectGainGritArgs>;

export interface EffectGainArmorCheckPenaltyArgs {
  amount: number;
}
export type EffectGainArmorCheckPenalty = BaseEffect<
  EffectType.gainArmorCheckPenalty,
  EffectGainArmorCheckPenaltyArgs
>;

export interface EffectGainArmorMaxDexBonusArgs {
  amount: number;
}
export type EffectGainArmorMaxDexBonus = BaseEffect<
  EffectType.gainArmorMaxDexBonus,
  EffectGainArmorMaxDexBonusArgs
>;

export interface EffectGainFighterWeaponTrainingArgs {}
export type EffectGainFighterWeaponTraining = BaseEffect<
  EffectType.gainFighterWeaponTraining,
  EffectGainFighterWeaponTrainingArgs
>;
export type EffectGainFighterWeaponTrainingInput = string;

export type Effect =
  | EffectRacialAbilityBonus
  | EffectAbilityBonus
  | EffectGainArcaneSchool
  | EffectGainFeat
  | EffectGainSpellCasting
  | EffectGainSchoolSpellDC
  | EffectGainFavoredClassAmount
  | EffectGainProficiency
  | EffectGainSelectedWeaponProficiency
  | EffectGainSkill
  | EffectGainClassSkill
  | EffectGainInitiative
  | EffectGainAC
  | EffectGainCMD
  | EffectGainSave
  | EffectGainHP
  | EffectGainSpeed
  | EffectGainTwoWeaponFighting
  | EffectClassFeatSource
  | EffectClassFeatPlaceholder
  | EffectEnchantUnarmedStrike
  | EffectAddAttackOption
  | EffectMeleeAttackAbility
  | EffectGainWeaponBonus
  | EffectAddTracker
  | EffectGainBloodline
  | EffectGainDomain
  | EffectSelectFromSubs
  | EffectGainCombatStyle
  | EffectGainGrit
  | EffectGainArmorCheckPenalty
  | EffectGainArmorMaxDexBonus
  | EffectGainFighterWeaponTraining;

export type ArgsTypeForEffect<T extends Effect> = T['args'];

export type EffectNeedInput =
  | EffectGainArcaneSchool
  | EffectGainSchoolSpellDC
  | EffectGainSelectedWeaponProficiency
  | EffectGainBloodline
  | EffectGainDomain
  | EffectSelectFromSubs
  | EffectGainCombatStyle
  | EffectGainFighterWeaponTraining
  | EffectGainWeaponBonus;

export const effectTypesNeedInput: Array<EffectType> = [
  EffectType.gainArcaneSchool,
  EffectType.gainSchoolSpellDC,

  EffectType.gainSelectedWeaponProficiency,

  EffectType.gainBloodline,

  EffectType.gainDomain,

  EffectType.selectFromSubs,

  EffectType.gainCombatStyle,

  EffectType.gainFighterWeaponTraining,

  EffectType.gainWeaponBonus,
];

export interface ManualEffect {
  name: string;
  effects: Effect[];
  inputs?: unknown[];
  enabled?: boolean;
}
