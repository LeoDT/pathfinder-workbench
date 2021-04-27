import { ClassFeat, Feat, RacialTrait } from '../types/core';
import { EffectGainArcaneSchoolInput, EffectGainFeatArgs } from '../types/effectType';
import { featTypeTranslates } from './feat';

export function translateGainFeatEffectArgs(e: EffectGainFeatArgs): string {
  if (e.forceFeat) {
    return `固定专长`;
  }

  if (e.featType) {
    return `${featTypeTranslates[e.featType]}专长`;
  }

  return '奖励专长';
}

export function makeEffectInputKey(source: ClassFeat | RacialTrait | Feat, suffix = ''): string {
  return `${source._type}:${source.id}${suffix ? `:${suffix}` : ''}`;
}

export function validateGainArcaneSchoolEffectInput(i: unknown): EffectGainArcaneSchoolInput {
  return i as EffectGainArcaneSchoolInput;
}
