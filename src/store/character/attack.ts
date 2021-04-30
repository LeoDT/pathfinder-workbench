import { computed, makeObservable } from 'mobx';

import { AbilityType, NamedBonus } from '../../types/core';
import { abilityTranslates } from '../../utils/ability';
import { getWeaponDamageModifier, getWeaponModifier, showEquipment } from '../../utils/equipment';
import { collections } from '../collection';
import Character from '.';

interface AttackOption {
  name: string;
  ability: AbilityType;
  damage: string;
  critical?: string;
  damageAbility?: AbilityType;
  damageMultiplier?: number;
  attackBonuses: NamedBonus[];
  attackModifier: number;
  damageBonuses: NamedBonus[];
  damageModifier: number;
}

interface Attack {
  option: AttackOption;
  attackBonuses: NamedBonus[];
  attackModifier: number;
  damageBonuses: NamedBonus[];
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
    const attackBonuses: NamedBonus[] = [];
    const damageBonuses: NamedBonus[] = [];

    let ability = AbilityType.str;
    let damageAbility: AbilityType | undefined = AbilityType.str;
    switch (weaponType.meta.category) {
      case 'ranged':
        ability = AbilityType.dex;
        damageAbility = undefined;
    }

    attackBonuses.push({
      name: '武器品质',
      bonus: { type: 'untyped', amount: weapon ? getWeaponModifier(weapon) : 0 },
    });
    damageBonuses.push({
      name: '武器品质',
      bonus: {
        type: 'untyped',
        amount: weapon ? getWeaponDamageModifier(weapon) : 0,
      },
    });

    if (!c.proficiency.hasWeapon(weaponType)) {
      attackBonuses.push({ name: '非擅长武器', bonus: { type: 'untyped', amount: -4 } });
    }

    if (c.equipment.isTwoWeapon) {
      attackBonuses.push({ name: '双武器', bonus: { type: 'untyped', amount: -6 } });

      if (this.isTwoWeaponFighter) {
        attackBonuses.push({ name: '双武器格斗', bonus: { type: 'untyped', amount: 2 } });
      }
      if (this.isOffHandHoldingLightWeapon) {
        attackBonuses.push({ name: '副手轻武器', bonus: { type: 'untyped', amount: 2 } });
      }
    }

    const { offHand } = c.equipment;
    if (offHand && offHand.type._type === 'armorType' && offHand.type.meta.category === 'shield') {
      if (!c.proficiency.hasShield(offHand.type.id)) {
        attackBonuses.push({
          name: '非擅长盾牌',
          bonus: { type: 'untyped', amount: offHand.type.meta.penalty },
        });
      }
    }

    return {
      name: weapon ? showEquipment(weapon) : weaponType.name,
      ability,
      attackBonuses,
      damage: collections.weaponType.getDamageForSize(weaponType, c.race.size),
      critical: weaponType.meta.critical,
      damageAbility,
      damageMultiplier: c.equipment.isHoldingTwoHand ? 1.5 : 1,
      attackModifier: this.character.aggregateNamedBonusesAmount(attackBonuses),
      damageBonuses,
      damageModifier: this.character.aggregateNamedBonusesAmount(damageBonuses),
    };
  }

  get offHandAttackOption(): AttackOption | null {
    const weapon = this.character.equipment.offHand;
    const attackBonuses: NamedBonus[] = [];
    const damageBonuses: NamedBonus[] = [];

    if (!weapon || weapon.equipmentType !== 'weapon' || this.character.equipment.isHoldingTwoHand) {
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

    attackBonuses.push({
      name: '武器品质',
      bonus: { type: 'untyped', amount: getWeaponModifier(weapon) },
    });
    damageBonuses.push({
      name: '武器品质',
      bonus: {
        type: 'untyped',
        amount: getWeaponDamageModifier(weapon),
      },
    });

    if (!this.character.proficiency.hasWeapon(weaponType)) {
      attackBonuses.push({ name: '非擅长武器', bonus: { type: 'untyped', amount: -4 } });
    }

    if (this.character.equipment.isTwoWeapon) {
      attackBonuses.push({ name: '双武器', bonus: { type: 'untyped', amount: -10 } });

      if (this.isTwoWeaponFighter) {
        attackBonuses.push({ name: '双武器格斗', bonus: { type: 'untyped', amount: 6 } });
      }
      if (this.isOffHandHoldingLightWeapon) {
        attackBonuses.push({ name: '副手轻武器', bonus: { type: 'untyped', amount: 2 } });
      }
    }

    return {
      name: showEquipment(weapon),
      ability,
      damage: collections.weaponType.getDamageForSize(weaponType, this.character.race.size),
      critical: weaponType.meta.critical,
      damageAbility,
      attackBonuses,
      attackModifier: this.character.aggregateNamedBonusesAmount(attackBonuses),
      damageBonuses,
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
      const attackBonuses: NamedBonus[] = this.character.makeNamedBonuses([
        { name: 'BAB', bonus: { amount: this.character.status.maxBab, type: 'untyped' } },
        {
          name: abilityTranslates[o.ability],
          bonus: { amount: this.character.abilityModifier[o.ability], type: 'untyped' },
        },
        ...o.attackBonuses,
      ]);
      let damageBonuses: NamedBonus[] = [...o.damageBonuses];

      if (o.damageAbility) {
        const name = abilityTranslates[o.ability];
        damageBonuses.unshift({
          name:
            o.damageMultiplier && o.damageMultiplier > 1
              ? `${name}(${o.damageMultiplier * 100}%)`
              : name,
          bonus: {
            amount: this.character.abilityModifier[o.damageAbility] * (o.damageMultiplier || 1),
            type: 'untyped',
          },
        });
      }
      damageBonuses = this.character.makeNamedBonuses(damageBonuses);

      return {
        option: o,
        attackBonuses,
        attackModifier: this.character.aggregateNamedBonusesAmount(attackBonuses),
        damageBonuses,
        damageModifier: this.character.aggregateNamedBonusesAmount(damageBonuses),
      };
    });
  }
}
