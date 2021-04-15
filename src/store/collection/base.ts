import Fuse from 'fuse.js';
import { merge } from 'lodash-es';

import { Entity, EntityType } from '../../types/core';

export interface CollectionOptions {
  searchFields: Array<string>;
}

const defaultOptions: CollectionOptions = {
  searchFields: ['id', 'name'],
};

export class Collection<T extends Entity = Entity> {
  options: CollectionOptions;
  type: EntityType;
  data: Array<T>;

  fuse: Fuse<T>;
  idIndex: Record<string, T>;

  constructor(type: EntityType, data: Array<T>, options?: CollectionOptions) {
    this.options = merge({}, options, defaultOptions);
    this.type = type;
    this.data = data;

    this.fuse = new Fuse(data, {
      includeScore: true,
      threshold: 0.2,
      keys: this.options.searchFields,
    });

    this.idIndex = {};

    for (const i of data) {
      this.idIndex[i.id] = i;
      i._type = type;
    }
  }

  getById(id: string): T {
    const e = this.idIndex[id];

    if (e) {
      return e;
    }

    throw Error(`can not find ${this.type} with id ${id}`);
  }

  getByIds(ids: string[]): T[] {
    return ids.map((i) => this.getById(i));
  }
}
