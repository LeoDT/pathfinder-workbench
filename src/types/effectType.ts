import { AbilityType, FeatType } from './core';

export enum EffectType {
  gainFeat = 'gainFeat',
  abilityBonus = 'abilityBonus',
  gainArcaneSchool = 'gainArcaneSchool',
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

export type Effect = EffectGainFeat | EffectAbilityBonus | EffectGainArcaneSchool;

export type EffectGainClassSpeciality = EffectGainArcaneSchool;
