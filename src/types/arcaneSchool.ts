import { Entity, SpecialFeat } from './core';
import { Effect } from './effectType';

export interface ArcaneSchoolStandardFocused extends ArcaneSchoolStandard {
  replace: Array<string>;
}

export interface ArcaneSchoolStandard extends Entity {
  _type: 'arcaneSchool';
  type: 'standard';
  desc: string;
  noConflict?: boolean;
  powers: Array<SpecialFeat>;
  focused: Array<ArcaneSchoolStandardFocused>;
  effects?: Effect[];
}

export interface ArcaneSchoolElemental extends Entity {
  _type: 'arcaneSchool';
  type: 'elemental';
  desc: string;
  conflict: Array<string>;
  powers: Array<SpecialFeat>;
  effects?: Effect[];
}

export type ArcaneSchool = ArcaneSchoolStandard | ArcaneSchoolElemental;
