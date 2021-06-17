import { ClassFeat, Entity } from './core';

export interface ArcaneSchoolStandardFocused extends ArcaneSchoolStandard {
  replace: Array<string>;
}

export interface ArcaneSchoolStandard extends Entity {
  _type: 'arcaneSchool';
  type: 'standard';
  desc: string;
  noConflict?: boolean;
  noSchoolSlot?: boolean;
  powers: Array<ClassFeat>;
  focused: Array<ArcaneSchoolStandardFocused>;
}

export interface ArcaneSchoolElemental extends Entity {
  _type: 'arcaneSchool';
  type: 'elemental';
  desc: string;
  conflict: Array<string>;
  powers: Array<ClassFeat>;
}

export type ArcaneSchool = ArcaneSchoolStandard | ArcaneSchoolElemental;
