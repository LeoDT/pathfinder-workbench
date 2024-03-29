import { computed, makeObservable } from 'mobx';

import { ArmorType, WeaponType } from '../../types/core';
import { EffectGainProficiencyArgs } from '../../types/effectType';
import { collections } from '../collection';
import { Character } from '.';

type Proficiencies = Required<EffectGainProficiencyArgs>;

export class CharacterProficiency {
  character: Character;

  constructor(c: Character) {
    makeObservable(this, {
      all: computed,
    });

    this.character = c;
  }

  get all(): Proficiencies {
    const effects = this.character.effect.getGainProficiencyEffects();
    const p: Proficiencies = {
      weaponWithSpecial: [],
      weaponTraining: [],
      weapon: [],
      armorTraining: [],
      armor: [],
      shieldTraining: [],
      shield: [],
    };

    function extend<T>(src: T[], dest?: T[]): void {
      if (dest) {
        for (const i of dest) {
          src.push(i);
        }
      }
    }

    effects.forEach(({ effect }) => {
      const { args } = effect;

      extend(p.weaponWithSpecial, args.weaponWithSpecial);
      extend(p.weaponTraining, args.weaponTraining);
      extend(p.weapon, args.weapon);
      extend(p.armorTraining, args.armorTraining);
      extend(p.armor, args.armor);
      extend(p.shieldTraining, args.shieldTraining);
      extend(p.shield, args.shield);
    });

    const weapons = this.character.effect.getGainSelectedWeaponProficiencyEffects();

    weapons.forEach(({ input }) => {
      if (typeof input === 'string') {
        p.weapon.push(input);
      }
    });

    return p;
  }

  hasWeapon(w: string | WeaponType): boolean {
    const weaponType = typeof w === 'string' ? collections.weaponType.getById(w) : w;

    if (weaponType.meta.category === 'unarmed attacks') {
      return true;
    }

    if (this.all.weaponWithSpecial.length > 0) {
      return this.all.weaponWithSpecial.some((s) => weaponType.meta.special?.includes(s));
    }

    const { training } = weaponType.meta;

    return this.all.weaponTraining.includes(training) || this.all.weapon.includes(weaponType.id);
  }

  hasArmor(a: string | ArmorType): boolean {
    const armorType = typeof a === 'string' ? collections.armorType.getById(a) : a;

    const { category } = armorType.meta;

    return this.all.armorTraining.includes(category) || this.all.armor.includes(armorType.id);
  }

  hasShield(a: string | ArmorType): boolean {
    const armorType = typeof a === 'string' ? collections.armorType.getById(a) : a;

    if (armorType.id === 'Shield, tower') {
      return this.all.shield.includes(armorType.id);
    }

    return this.all.shieldTraining.includes('normal') || this.all.shield.includes(armorType.id);
  }
}
