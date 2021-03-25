import { AbilityType, FeatType, SpellCastingType } from './core';

export enum EffectType {
  gainFeat = 'gainFeat',
  abilityBonus = 'abilityBonus',
  gainArcaneSchool = 'gainArcaneSchool',
  gainSpellCasting = 'gainSpellCasting',
}

export interface EffectGainFeat {
  type: EffectType.gainFeat;
  featType?: FeatType;
}

export interface EffectAbilityBonus {
  type: EffectType.abilityBonus;
  abilityType?: AbilityType;
}

export interface EffectGainArcaneSchool {
  type: EffectType.gainArcaneSchool;
  standardForbidden: number;
}

export interface EffectGainSpellCasting {
  type: EffectType.gainSpellCasting;
  castingType: SpellCastingType;
  abilityType: AbilityType;
}

export type Effect =
  | EffectGainFeat
  | EffectAbilityBonus
  | EffectGainArcaneSchool
  | EffectGainSpellCasting;

export type EffectGainClassSpeciality = EffectGainArcaneSchool;
