import { ClassFeat, Feat, RacialTrait } from '../types/core';
import {
  EffectGainArcaneSchoolInput,
  EffectGainBloodlineInput,
  EffectGainCombatStyleInput,
  EffectGainDomainInput,
  EffectGainFeatArgs,
  EffectGainFighterWeaponTrainingInput,
  EffectGainSchoolSpellDCInput,
  EffectSelectFromSubsInput,
  ManualEffect,
} from '../types/effectType';
import { featTypeTranslates } from './feat';
import { validate } from './schemaValidator';

export function translateGainFeatEffectArgs(e: EffectGainFeatArgs): string {
  if (e.forceFeat) {
    return `固定专长`;
  }

  if (e.featTypes) {
    return `${e.featTypes.map((t) => featTypeTranslates[t]).join(',')}专长`;
  }

  return '奖励专长';
}

export function validateManualEffects(e: unknown): ManualEffect[] | null {
  if (!e) {
    return null;
  }

  if (Array.isArray(e)) {
    const valid = e.every((i) => validate('ManualEffect', i)[0]);

    return valid ? (e as ManualEffect[]) : null;
  }

  return null;
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

export function validateGainDomainEffectInput(i: unknown): EffectGainDomainInput {
  return i as EffectGainDomainInput;
}

export function validateSelectFromSubsEffectInput(i: unknown): EffectSelectFromSubsInput {
  return i ? (i as EffectSelectFromSubsInput) : [];
}

export function validateGainSchoolSpellDCEffectInput(i: unknown): EffectGainSchoolSpellDCInput {
  return i as EffectGainSchoolSpellDCInput;
}

export function validateGainCombatStyleEffectInput(i: unknown): EffectGainCombatStyleInput {
  return i as EffectGainCombatStyleInput;
}

export function validateGainFighterWeaponTrainingEffectInput(
  i: unknown
): EffectGainFighterWeaponTrainingInput {
  return i as EffectGainFighterWeaponTrainingInput;
}
