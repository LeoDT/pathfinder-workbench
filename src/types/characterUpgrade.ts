import { Abilities } from './core';

export enum ClassSpecialityType {
  arcaneSchool = 'arcaneSchool',
}

export interface ClassSpecialityArcaneSchool {
  type: ClassSpecialityType.arcaneSchool;
  school: string;
  focused?: string;
  forbiddenSchool: Array<string>;
}

export type ClassSpeciality = ClassSpecialityArcaneSchool;

export interface CharacterUpgrade {
  classId: string;
  skills: Map<string, number>;
  abilities: Partial<Abilities>;
  feats: Array<string>; //feat id
  spells: Map<number, string>; //spell level & spell id

  levelFeat: boolean;
  levelAbility: boolean;

  classSpeciality?: ClassSpeciality;
}
