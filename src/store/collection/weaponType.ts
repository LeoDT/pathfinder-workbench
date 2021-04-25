import { WeaponType, WeaponSize } from '../../types/core';

import WEAPON_SIZE_DATA from '../../data/weapon-size.json';

import { Collection, CollectionOptions } from './base';

export default class WeaponTypeCollection extends Collection<WeaponType> {
  static sizeDamage = WEAPON_SIZE_DATA as Array<Record<WeaponSize, string>>;

  unarmedStrike: WeaponType;

  constructor(data: Array<WeaponType>, options?: CollectionOptions) {
    super('weaponType', data, options);

    this.unarmedStrike = this.getById('Unarmed strike');
  }

  getUnarmedWeaponType(): WeaponType {
    return this.getById('Unarmed strike');
  }

  getDamageForSize(w: WeaponType, size: WeaponSize): string {
    const { damage } = w.meta;

    if (!damage) {
      return '0';
    }

    const damages = WeaponTypeCollection.sizeDamage.find((s) => {
      const d = damage.indexOf('/') !== -1 ? damage.split('/')[0] : damage;

      return d === s.medium;
    });

    if (damages && damages[size]) {
      return damages[size];
    }

    throw new Error(`invalid weapon size: ${size}`);
  }
}
