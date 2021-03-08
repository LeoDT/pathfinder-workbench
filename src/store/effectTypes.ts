import { AbilityType, FeatType } from './types';

export enum EffectType {
  gainFeat = 'gainFeat',
  abilityBonus = 'abilityBonus',
}

export interface EffectGainFeat {
  type: EffectType.gainFeat;
  featType?: FeatType;
}

export interface EffectAbilityBonus {
  type: EffectType.abilityBonus;
  abilityType?: AbilityType;
}

export type Effect = EffectGainFeat | EffectAbilityBonus;
