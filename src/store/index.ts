import Fuse from 'fuse.js';

import SPELL_DATA from '../data/spells.json';
import { createContextNoNullCheck } from '../utils/react';

import { EntityTypes, Spell } from './types';
import { Collection, CollectionType } from './collection';

export class Store {
  collections: Array<Collection>;

  constructor() {
    this.collections = [
      new Collection<Spell>('spell', SPELL_DATA, {
        searchFields: ['id', 'name'],
      }),
    ];
  }

  quickSearch(key: string, limitEach = 20): Record<CollectionType, Fuse.FuseResult<EntityTypes>[]> {
    const result: Record<CollectionType, Fuse.FuseResult<EntityTypes>[]> = {
      spell: [],
      weapon: [],
    };

    this.collections.forEach((c) => {
      result[c.type] = c.fuse.search(key, { limit: limitEach });
    });

    return result;
  }
}

export const [useStore, StoreContext] = createContextNoNullCheck<Store>();
