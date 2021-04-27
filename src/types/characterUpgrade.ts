import { Abilities } from './core';

export type FavoredClassBonus = 'hp' | 'skill' | 'custom';

export interface CharacterUpgrade {
  classId: string;
  favoredClassBonus: FavoredClassBonus;
  skills: Map<string, number>;
  abilities: Partial<Abilities>;
  feats: Array<string>; //feat id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  effectInputs: Map<string, any>; // Map<`${source}:${id}`, effectInputArgs>
  spells: Array<string>;

  hp: number;

  levelFeat: boolean;
  levelAbility: boolean;
}
