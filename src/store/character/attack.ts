import { computed, makeObservable } from 'mobx';

import { AbilityType } from '../../types/core';
import { getWeaponModifier, getWeaponDamageModifier, showEquipment } from '../../utils/equipment';
import { collections } from '../collection';
import Character from '.';

interface AttackOption {
  name: string;
  ability: AbilityType;
  damage: string;
  critical?: string;
  damageAbility?: AbilityType;
  damageMultiplier?: number;
  attackModifier?: number;
  damageModifier?: number;
}

interface Attack {
  option: AttackOption;
  attackModifier: number;
  damageModifier: number;
}

export class CharacterAttack {
  character: Character;

  constructor(c: Character) {
    makeObservable(this, {
      isTwoWeaponFighter: computed,
      mainHandAttackOption: computed,
      offHandAttackOption: computed,
      attackOptions: computed,
      attacks: computed,
    });

    this.character = c;
  }

  get isTwoWeaponFighter(): boolean {
    return this.character.effect.getGainTwoWeaponFightingEffects().length > 0;
  }
  get isOffHandHoldingLightWeapon(): boolean {
    const holding = this.character.equipment.offHand;

    if (!holding) return false;

    return holding.type._type === 'weaponType' && holding.type.meta.category === 'light';
  }
  get isOffHandHoldingShield(): boolean {
    const holding = this.character.equipment.offHand;

    if (!holding) return false;

    return holding.type._type === 'armorType' && holding.type.meta.category === 'shield';
  }

  get mainHandAttackOption(): AttackOption {
    const c = this.character;
    const weapon = c.equipment.mainHand;
    const unarmedWeaponType = collections.weaponType.getUnarmedWeaponType();
    const weaponType = weapon?.type || unarmedWeaponType;

    let ability = AbilityType.str;
    let damageAbility: AbilityType | undefined = AbilityType.str;
    switch (weaponType.meta.category) {
      case 'ranged':
        ability = AbilityType.dex;
        damageAbility = undefined;
    }

    let attackModifier = weapon ? getWeaponModifier(weapon) : 0;

    if (!c.proficiency.hasWeapon(weaponType)) {
      attackModifier -= 4;
    }

    if (c.equipment.isTwoWeapon) {
      let mod = -6;

      if (this.isTwoWeaponFighter) {
        mod += 2;
      }
      if (this.isOffHandHoldingLightWeapon) {
        mod += 2;
      }

      attackModifier += mod;
    }

    const { offHand } = c.equipment;
    if (offHand && offHand.type._type === 'armorType' && offHand.type.meta.category === 'shield') {
      if (!c.proficiency.hasShield(offHand.type.id)) {
        attackModifier += offHand.type.meta.penalty;
      }
    }

    return {
      name: weapon ? showEquipment(weapon) : weaponType.name,
      ability,
      damage: collections.weaponType.getDamageForSize(weaponType, c.race.size),
      critical: weaponType.meta.critical,
      damageAbility,
      damageMultiplier: c.equipment.isHoldingTwoHand ? 1.5 : 1,
      attackModifier,
      damageModifier: weapon ? getWeaponDamageModifier(weapon) : 0,
    };
  }

  get offHandAttackOption(): AttackOption | null {
    const weapon = this.character.equipment.offHand;

    if (!weapon || weapon.equipmentType !== 'weapon') {
      return null;
    }

    const weaponType = weapon.type;

    let ability = AbilityType.str;
    let damageAbility: AbilityType | undefined = AbilityType.str;
    switch (weaponType.meta.category) {
      case 'ranged':
        ability = AbilityType.dex;
        damageAbility = undefined;
    }

    let attackModifier = getWeaponModifier(weapon);

    if (!this.character.proficiency.hasWeapon(weaponType)) {
      attackModifier -= 4;
    }

    if (this.character.equipment.isTwoWeapon) {
      let mod = -10;

      if (this.isTwoWeaponFighter) {
        mod += 6;
      }
      if (this.isOffHandHoldingLightWeapon) {
        mod += 2;
      }

      attackModifier += mod;
    }

    return {
      name: showEquipment(weapon),
      ability,
      damage: collections.weaponType.getDamageForSize(weaponType, this.character.race.size),
      critical: weaponType.meta.critical,
      damageAbility,
      attackModifier,
      damageModifier: getWeaponDamageModifier(weapon),
    };
  }

  get attackOptions(): AttackOption[] {
    let options = [this.mainHandAttackOption, this.offHandAttackOption];
    if (
      !this.character.equipment.mainHand &&
      this.character.equipment.offHand &&
      this.offHandAttackOption
    ) {
      options = [this.offHandAttackOption];
    }

    return options.filter((o): o is AttackOption => Boolean(o));
  }

  get attacks(): Attack[] {
    return this.attackOptions.map((o) => {
      const modifier = this.character.abilityModifier[o.ability];
      let attackModifier = this.character.status.maxBab + modifier;
      let damageModifier = o.damageAbility
        ? this.character.abilityModifier[o.damageAbility] * (o.damageMultiplier || 1)
        : 0;

      if (o.attackModifier) {
        attackModifier += o.attackModifier;
      }

      if (o.damageModifier) {
        damageModifier += o.damageModifier;
      }

      return {
        option: o,
        attackModifier,
        damageModifier,
      };
    });
  }
}
