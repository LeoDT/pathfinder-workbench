import { AbilityType, FeatType, SpellCastingType } from './core';
import { Condition } from './condition';

export enum EffectType {
  gainFeat = 'gainFeat',
  abilityBonus = 'abilityBonus',
  gainArcaneSchool = 'gainArcaneSchool',
  gainSpellCasting = 'gainSpellCasting',
  gainFavoredClassAmount = 'gainFavoredClassAmount',
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

export type Effect =
  | EffectGainFeat
  | EffectAbilityBonus
  | EffectGainArcaneSchool
  | EffectGainSpellCasting
  | EffectGainFavoredClassAmount;

export type EffectGainClassSpeciality = EffectGainArcaneSchool;

export type ArgsTypeForEffect<T extends Effect> = T['args'];
