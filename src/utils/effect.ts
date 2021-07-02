import { ClassFeat, Feat, RacialTrait } from '../types/core';
import {
  EffectGainArcaneSchoolInput,
  EffectGainBloodlineInput,
  EffectGainFeatArgs,
  EffectSelectFromSubsInput,
  ManualEffect,
} from '../types/effectType';
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

export function validateManualEffects(e: unknown): ManualEffect[] | null {
  if (!e) {
    return null;
  }

  return e as ManualEffect[];
}
export function makeManualEffectSource(name: string, id?: string): ClassFeat {
  return {
    _type: 'classFeat',
    name,
    id: id ?? name,
    desc: '手动效果',
  };
}

export function makeEffectInputKey(source: ClassFeat | RacialTrait | Feat, suffix = ''): string {
  return `${source._type}:${source.id}${suffix ? `:${suffix}` : ''}`;
}

export function validateStringInput(i: unknown): string {
  return i as string;
}

export const validateGainSkillEffectInput = validateStringInput;

export function validateGainArcaneSchoolEffectInput(i: unknown): EffectGainArcaneSchoolInput {
  return i as EffectGainArcaneSchoolInput;
}

export function validateGainBloodlineEffectInput(i: unknown): EffectGainBloodlineInput {
  return i as EffectGainBloodlineInput;
}

export function validateSelectFromSubsEffectInput(i: unknown): EffectSelectFromSubsInput {
  return i ? (i as EffectSelectFromSubsInput) : [];
}
