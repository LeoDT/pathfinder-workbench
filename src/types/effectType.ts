import { AbilityType, ArmorCategory, FeatType, SpellCastingType, WeaponTraining } from './core';
import { Condition } from './condition';

export enum EffectType {
  gainFeat = 'gainFeat',
  abilityBonus = 'abilityBonus',
  gainArcaneSchool = 'gainArcaneSchool',
  gainSpellCasting = 'gainSpellCasting',
  gainFavoredClassAmount = 'gainFavoredClassAmount',
  gainProficiency = 'gainProficiency',
  gainSelectedWeaponProficiency = 'gainSelectedWeaponProficiency',
  gainSkill = 'gainSkill',
}

export interface BaseEffect<TYPE extends EffectType, ARGS> {
  type: TYPE;
  when?: Condition;
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
  rank: number;
}
export type EffectGainSkill = BaseEffect<EffectType.gainSkill, EffectGainSkillArgs>;

export type Effect =
  | EffectAbilityBonus
  | EffectGainArcaneSchool
  | EffectGainFeat
  | EffectGainSpellCasting
  | EffectGainFavoredClassAmount
  | EffectGainProficiency
  | EffectGainSelectedWeaponProficiency
  | EffectGainSkill;

export type EffectGainClassSpeciality = EffectGainArcaneSchool;

export type ArgsTypeForEffect<T extends Effect> = T['args'];

export type EffectNeadInput = EffectGainSelectedWeaponProficiency;
export const effectTypesNeedInput: Array<EffectType> = [EffectType.gainSelectedWeaponProficiency];
