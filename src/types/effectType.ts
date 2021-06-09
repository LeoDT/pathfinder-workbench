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
  gainArcaneSchool = 'gainArcaneSchool',
  gainArcaneSchoolPrepareSlot = 'gainArcaneSchoolPrepareSlot',
  gainSpellCasting = 'gainSpellCasting',
  gainFavoredClassAmount = 'gainFavoredClassAmount',
  gainProficiency = 'gainProficiency',
  gainSelectedWeaponProficiency = 'gainSelectedWeaponProficiency',
  gainSkill = 'gainSkill',
  gainInitiative = 'gainInitiative',
  gainAC = 'gainAC',
  gainCMD = 'gainCMD',
  gainSave = 'gainSave',
  gainHP = 'gainHP',
  gainTwoWeaponFighting = 'gainTwoWeaponFighting',
  gainSpeed = 'gainSpeed',

  enchantUnarmedStrike = 'enchantUnarmedStrike',
  addAttackOption = 'addAttackOption',
  meleeAttackAbility = 'meleeAttackAbility',
  addTracker = 'addTracker',
}

export interface BaseEffect<TYPE extends EffectType, ARGS> {
  type: TYPE;
  when?: string;
  args: ARGS;
  growArgs?: Array<{ level: number; args: ARGS }>;
  original?: Effect;
}

export interface EffectGainFeatArgs {
  ignorePrerequisites?: boolean;
  featType?: FeatType;
  feats?: string[]; // override above
  forceFeat?: string; // override above
}
export type EffectGainFeat = BaseEffect<EffectType.gainFeat, EffectGainFeatArgs | null>;

export interface EffectAbilityBonusArgs {
  abilityType?: AbilityType;
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

export interface EffectGainArcaneSchoolPrepareSlotArgs {
  amount?: number;
  school: string;
}
export type EffectGainArcaneSchoolPrepareSlot = BaseEffect<
  EffectType.gainArcaneSchoolPrepareSlot,
  EffectGainArcaneSchoolPrepareSlotArgs
>;

export interface EffectGainSpellCastingArgs {
  castingType: SpellCastingType;
  abilityType: AbilityType;
}
export type EffectGainSpellCasting = BaseEffect<
  EffectType.gainSpellCasting,
  EffectGainSpellCastingArgs
>;

export interface EffectGainFavoredClassAmountArgs {
  amount: number;
}
export type EffectGainFavoredClassAmount = BaseEffect<
  EffectType.gainFavoredClassAmount,
  EffectGainFavoredClassAmountArgs
>;

export interface EffectGainProficiencyArgs {
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

export type EffectGainTwoWeaponFighting = BaseEffect<EffectType.gainTwoWeaponFighting, void>;

export interface EffectGainSpeedArgs {
  bonus: Bonus;
}
export type EffectGainSpeed = BaseEffect<EffectType.gainSpeed, EffectGainSpeedArgs>;

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
  attackBonuses?: NamedBonus[];
  damageBonuses?: Array<{
    applyMultiplier: AbilityType;
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

export interface EffectAddTrackerArgs {
  id?: string;
  name?: string;
  max?: number;
  maxFormula?: string;
}
export type EffectAddTracker = BaseEffect<EffectType.addTracker, EffectAddTrackerArgs>;

export type Effect =
  | EffectAbilityBonus
  | EffectGainArcaneSchool
  | EffectGainFeat
  | EffectGainSpellCasting
  | EffectGainFavoredClassAmount
  | EffectGainProficiency
  | EffectGainSelectedWeaponProficiency
  | EffectGainSkill
  | EffectGainInitiative
  | EffectGainAC
  | EffectGainCMD
  | EffectGainSave
  | EffectGainHP
  | EffectGainTwoWeaponFighting
  | EffectEnchantUnarmedStrike
  | EffectAddAttackOption
  | EffectMeleeAttackAbility;

export type ArgsTypeForEffect<T extends Effect> = T['args'];

export type EffectNeadInput = EffectGainArcaneSchool | EffectGainSelectedWeaponProficiency;
export const effectTypesNeedInput: Array<EffectType> = [
  EffectType.gainArcaneSchool,
  EffectType.gainSelectedWeaponProficiency,
];
