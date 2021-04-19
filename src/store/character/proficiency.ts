import { makeObservable, computed } from 'mobx';

import { collections } from '../collection';

import Character from '.';
import { EffectGainProficiencyArgs } from '../../types/effectType';
import { WeaponType, ArmorType } from '../../types/core';

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

      extend(p.weaponTraining, args.weaponTraining);
      extend(p.weapon, args.weapon);
      extend(p.armorTraining, args.armorTraining);
      extend(p.armor, args.armor);
      extend(p.shieldTraining, args.shieldTraining);
      extend(p.shield, args.shield);
    });

    return p;
  }

  hasWeapon(w: string | WeaponType): boolean {
    const weaponType = typeof w === 'string' ? collections.weaponType.getById(w) : w;

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
