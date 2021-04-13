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

export type FavoredClassBonus = 'hp' | 'skill' | 'custom';

export interface CharacterUpgrade {
  classId: string;
  favoredClassBonus: FavoredClassBonus;
  skills: Map<string, number>;
  abilities: Partial<Abilities>;
  feats: Array<string>; //feat id
  spells: Array<string>;

  hp: number;

  levelFeat: boolean;
  levelAbility: boolean;

  classSpeciality: ClassSpeciality | null;
}
