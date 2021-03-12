import { Entity, SpecialFeat } from './core';

export interface ArcaneSchoolStandardFocused extends ArcaneSchoolStandard {
  replace: Array<string>;
}

export interface ArcaneSchoolStandard extends Entity {
  type: 'standard';
  desc: string;
  noConflict?: boolean;
  powers: Array<SpecialFeat>;
  focused: Array<ArcaneSchoolStandardFocused>;
}

export interface ArcaneSchoolElemental extends Entity {
  type: 'elemental';
  desc: string;
  conflict: Array<string>;
  powers: Array<SpecialFeat>;
}

export type ArcaneSchool = ArcaneSchoolStandard | ArcaneSchoolElemental;
