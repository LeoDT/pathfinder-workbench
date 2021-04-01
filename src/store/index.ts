import Fuse from 'fuse.js';
import { observable, IObservableArray, autorun, observe } from 'mobx';
import { set, entries, del } from 'idb-keyval';

import { createContextNoNullCheck } from '../utils/react';

import { Entity } from '../types/core';
import DMStore from './dm';
import UIStore from './ui';
import { collections, Collection, CollectionEntityType } from './collection';
import Character from './character';

const quickSearchCollections = [
  collections.spell,
  collections.feat,
  collections.weaponType,
  collections.armorType,
];

export class Store {
  dm: DMStore;
  ui: UIStore;

  collections: typeof collections; // for components

  characters: IObservableArray<Character>;

  constructor() {
    this.dm = new DMStore();

    this.ui = new UIStore();
    this.collections = collections;

    this.characters = observable.array([], { deep: false });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).store = this;
  }

  async init(): Promise<void> {
    await this.restore();
    this.persist();
  }

  quickSearch(
    key: string,
    limitEach = 20
  ): Array<[CollectionEntityType, Fuse.FuseResult<Entity>[]]> {
    return (quickSearchCollections as Array<Collection<Entity>>).map((c) => [
      c.type,
      c.fuse.search(key, { limit: limitEach }),
    ]);
  }

  persist(): void {
    autorun(() => {
      this.characters.forEach((c) => {
        set(`character:${c.id}`, Character.stringify(c));
      });

      set('dm:characters', JSON.stringify(this.dm.characters));
    });

    observe(this.characters, (change) => {
      if (change.type === 'splice') {
        change.removed.forEach((i) => {
          del(`character:${i.id}`);
        });
      }
    });
  }

  async restore(): Promise<void> {
    const persisted = await entries();

    persisted.forEach(([k, v]) => {
      if (typeof k === 'string') {
        if (k.startsWith('character')) {
          this.characters.push(Character.parse(v));
        }

        if (k === 'dm:characters') {
          this.dm.characters.replace(DMStore.parseCharacters(v));
        }
      }
    });
  }
}

export const [useStore, StoreContext] = createContextNoNullCheck<Store>();
