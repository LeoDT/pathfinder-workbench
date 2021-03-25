import Fuse from 'fuse.js';
import { keyBy } from 'lodash';

import { Entity } from '../../types/core';

export type CollectionEntityType =
  | 'skill'
  | 'race'
  | 'class'
  | 'spell'
  | 'feat'
  | 'weapon'
  | 'arcaneSchool';

export interface CollectionOptions {
  searchFields: Array<string>;
}

export class Collection<T extends Entity = Entity> {
  type: CollectionEntityType;
  data: Array<T>;

  fuse: Fuse<T>;
  idIndex: Record<string, T>;

  constructor(type: CollectionEntityType, data: Array<T>, options: CollectionOptions) {
    this.type = type;
    this.data = data;

    this.fuse = new Fuse(data, {
      includeScore: true,
      threshold: 0.2,

      keys: options.searchFields,
    });

    this.idIndex = keyBy(this.data, 'id');
  }

  getById(id: string): T {
    const e = this.idIndex[id];

    if (e) {
      return e;
    }

    throw Error(`can not find ${this.type} with id ${id}`);
  }
}
