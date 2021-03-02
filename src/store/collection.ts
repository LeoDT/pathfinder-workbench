import Fuse from 'fuse.js';

import { Entity, Race, Spell, Feat, Class, Skill } from './types';

import SKILL_DATA from '../data/skills.json';
import RACE_DATA from '../data/races.json';
import CLASS_DATA from '../data/classes.json';
import SPELL_DATA from '../data/spells.json';
import FEAT_DATA from '../data/feats.json';

export type CollectionEntityType = 'skill' | 'race' | 'class' | 'spell' | 'feat' | 'weapon';

export interface CollectionOptions {
  searchFields: Array<string>;
}

export class Collection<T extends Entity = Entity> {
  type: CollectionEntityType;
  data: Array<T>;

  fuse: Fuse<T>;

  constructor(type: CollectionEntityType, data: Array<T>, options: CollectionOptions) {
    this.type = type;
    this.data = data;

    this.fuse = new Fuse(data, {
      includeScore: true,
      threshold: 0.2,

      keys: options.searchFields,
    });
  }

  getById(id: string): T | null {
    return this.data.find((s) => s.id === id) || null;
  }
}

export const collections = {
  skill: new Collection<Skill>('skill', SKILL_DATA as Array<Skill>, {
    searchFields: ['id', 'name'],
  }),
  race: new Collection<Race>('race', RACE_DATA, {
    searchFields: ['id', 'name'],
  }),
  spell: new Collection<Spell>('spell', SPELL_DATA, {
    searchFields: ['id', 'name'],
  }),
  feat: new Collection<Feat>('feat', FEAT_DATA, {
    searchFields: ['id', 'name'],
  }),
  class: new Collection<Class>('class', CLASS_DATA, {
    searchFields: ['id', 'name'],
  }),
};
