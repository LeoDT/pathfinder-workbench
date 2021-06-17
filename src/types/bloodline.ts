import { ClassFeat, Entity } from './core';

export interface Bloodline extends Entity {
  _type: 'bloodline';
  desc: string;
  skills: string[];
  spells: string[];
  feats: string[];
  powers: ClassFeat[];
  arcana?: ClassFeat;
}
