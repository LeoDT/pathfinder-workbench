import { WeaponType } from '../../types/core';

import WEAPON_SIZE_DATA from '../../data/weapon-size.json';

import { Collection, CollectionOptions } from './base';

export type WeaponSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge';

export default class WeaponTypeCollection extends Collection<WeaponType> {
  static sizeDamage = WEAPON_SIZE_DATA as Array<Record<WeaponSize, string>>;

  constructor(data: Array<WeaponType>, options?: CollectionOptions) {
    super('weaponType', data, options);
  }

  getDamageForSize(w: WeaponType, size: WeaponSize): string {
    const { damage } = w.meta;

    if (!damage) {
      return '0';
    }

    const damages = WeaponTypeCollection.sizeDamage.find((s) => s.medium === damage);

    if (damages && damages[size]) {
      return damages[size];
    }

    throw new Error(`invalid weapon size: ${size}`);
  }
}
