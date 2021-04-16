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
      proficiencies: computed,
    });

    this.character = c;
  }

  get proficiencies(): Proficiencies {
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

    return (
      this.proficiencies.weaponTraining.includes(training) ||
      this.proficiencies.weapon.includes(weaponType.id)
    );
  }

  hasArmor(a: string | ArmorType): boolean {
    const armorType = typeof a === 'string' ? collections.armorType.getById(a) : a;

    const { category } = armorType.meta;

    return (
      this.proficiencies.armorTraining.includes(category) ||
      this.proficiencies.armor.includes(armorType.id)
    );
  }

  hasShield(a: string | ArmorType): boolean {
    const armorType = typeof a === 'string' ? collections.armorType.getById(a) : a;

    if (armorType.id === 'Shield, tower') {
      return this.proficiencies.shield.includes(armorType.id);
    }

    return (
      this.proficiencies.shieldTraining.includes('normal') ||
      this.proficiencies.shield.includes(armorType.id)
    );
  }
}
