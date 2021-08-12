import { computed, makeObservable } from 'mobx';

import { AbilityType, NamedBonus, Weapon, WeaponType } from '../../types/core';
import { abilityTranslates } from '../../utils/ability';
import { validateGainFighterWeaponTrainingEffectInput } from '../../utils/effect';
import { getWeaponDamageModifier, getWeaponModifier, showEquipment } from '../../utils/equipment';
import { collections } from '../collection';
import { Character } from '.';

export interface AttackOption {
  name: string;
  ability: AbilityType;
  damage: string;
  critical?: string;
  damageAbility?: AbilityType;
  damageMultiplier?: number;
  attackBonuses: NamedBonus[];
  damageBonuses: NamedBonus[];
}

export interface Attack {
  option: AttackOption;
  attackBonuses: NamedBonus[];
  attackModifier: number[];
  damageBonuses: NamedBonus[];
  damageModifier: number;
}

export interface GetAttackOptionOptions {
  name?: string;
  isOffHand: boolean;
  ignoreTwoWeapon: boolean;
  damageMultiplier?: number;
  maxBab: number;
}
const defaultGetAttackOptionOptions: GetAttackOptionOptions = {
  isOffHand: false,
  ignoreTwoWeapon: false,
  maxBab: 1,
};

export class CharacterAttack {
  character: Character;

  constructor(c: Character) {
    makeObservable(this, {
      unarmedWeaponType: computed,
      isTwoWeaponFighter: computed,
      mainHandAttackOption: computed,
      offHandAttackOption: computed,
      fighterWeaponTrainingGroups: computed,

      attackOptionsFromWeapons: computed,
      attackOptionsFromEffects: computed,
      attackOptions: computed,
      attacks: computed,
    });

    this.character = c;
  }

  get unarmedWeaponType(): WeaponType {
    const unarmedWeaponType = collections.weaponType.getUnarmedWeaponType();
    const es = this.character.effect.getEnchantUnarmedStrikeEffects()[0];

    if (es) {
      const { damage } = es.effect.args;

      return {
        ...unarmedWeaponType,
        meta: {
          ...unarmedWeaponType.meta,
          damage,
        },
      };
    }

    return unarmedWeaponType;
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
  get fighterWeaponTrainingGroups(): string[] {
    return this.character.effect
      .getGainFighterWeaponTrainingEffects()
      .map(({ input }) => validateGainFighterWeaponTrainingEffectInput(input));
  }

  getFighterWeaponTrainingBonus(weaponType: WeaponType): NamedBonus | null {
    if (weaponType.meta.fighterWeaponTrainingGroup) {
      const amounts = weaponType.meta.fighterWeaponTrainingGroup
        .map((g) => this.fighterWeaponTrainingGroups.indexOf(g))
        .map((i) => (i !== -1 ? this.fighterWeaponTrainingGroups.length - i : 0));
      const amount = Math.max(...amounts);

      return {
        name: '武器训练',
        bonus: {
          amount,
          type: 'untyped',
        },
      };
    }

    return null;
  }

  getAttackOptionForWeapon(
    weapon?: Weapon,
    partialOptions?: Partial<GetAttackOptionOptions>
  ): AttackOption {
    const options: GetAttackOptionOptions = Object.assign(
      {},
      defaultGetAttackOptionOptions,
      partialOptions
    );
    const c = this.character;
    const weaponType = weapon?.type || this.unarmedWeaponType;
    const attackBonuses: NamedBonus[] = [];
    const damageBonuses: NamedBonus[] = [];

    let ability = AbilityType.str;
    let damageAbility: AbilityType | undefined = AbilityType.str;

    if (weaponType.meta.category === 'ranged') {
      ability = AbilityType.dex;
      damageAbility = undefined;
    }

    const meleeAttackAbilityEffects = this.character.effect.getMeleeAttackAbilityEffects();
    if (meleeAttackAbilityEffects.length > 0) {
      const { effect } = meleeAttackAbilityEffects[0];

      ability = effect.args.ability;
    }

    let bab = this.character.status.bab;
    if (options.maxBab > 1) {
      bab = [...Array(options.maxBab - 1).fill(Math.max(...bab)), ...bab];
    }

    attackBonuses.push({
      name: 'BAB',
      bonus: { amount: bab, type: 'untyped' },
    });
    attackBonuses.push({
      name: abilityTranslates[ability],
      bonus: { amount: this.character.abilityModifier[ability], type: 'untyped' },
    });

    const fighterWeaponTrainingBonus = this.getFighterWeaponTrainingBonus(weaponType);
    if (fighterWeaponTrainingBonus) {
      attackBonuses.push(fighterWeaponTrainingBonus);
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

    if (c.equipment.isTwoWeapon && !options.ignoreTwoWeapon) {
      attackBonuses.push({
        name: '双武器',
        bonus: { type: 'untyped', amount: options.isOffHand ? -10 : -6 },
      });

      if (this.isTwoWeaponFighter) {
        attackBonuses.push({
          name: '双武器格斗',
          bonus: { type: 'untyped', amount: options.isOffHand ? 6 : 2 },
        });
      }
      if (this.isOffHandHoldingLightWeapon) {
        attackBonuses.push({ name: '副手轻武器', bonus: { type: 'untyped', amount: 2 } });
      }
    }

    if (!options.isOffHand) {
      const { offHand } = c.equipment;
      if (
        offHand &&
        offHand.type._type === 'armorType' &&
        offHand.type.meta.category === 'shield'
      ) {
        if (!c.proficiency.hasShield(offHand.type.id)) {
          attackBonuses.push({
            name: '非擅长盾牌',
            bonus: { type: 'untyped', amount: offHand.type.meta.penalty },
          });
        }
      }
    }

    let twoHandDamageMultiplier = 1.5;
    const damageMultiplierEffects = this.character.effect.getTwoHandDamageMultiplierEffects();
    if (damageMultiplierEffects.length > 0) {
      twoHandDamageMultiplier = Math.max(
        ...damageMultiplierEffects.map((es) => es.effect.args.multiplier)
      );
    }

    const damageMultiplier =
      c.equipment.isHoldingTwoHand && damageAbility === AbilityType.str
        ? options.damageMultiplier ?? twoHandDamageMultiplier
        : 1;

    if (damageAbility) {
      const name = abilityTranslates[damageAbility];
      damageBonuses.unshift({
        name:
          damageMultiplier && damageMultiplier > 1 ? `${name}(${damageMultiplier * 100}%)` : name,
        bonus: {
          amount: Math.floor(
            this.character.abilityModifier[damageAbility] * (damageMultiplier || 1)
          ),
          type: 'untyped',
        },
      });
    }

    let name = weapon ? showEquipment(weapon) : weaponType.name;
    if (options.name) {
      name = options.name;
    }

    return {
      name,
      ability,
      attackBonuses,
      damage: collections.weaponType.getDamageForSize(weaponType, c.race.size),
      critical: weaponType.meta.critical,
      damageAbility,
      damageMultiplier,
      damageBonuses,
    };
  }

  get mainHandAttackOption(): AttackOption {
    return this.getAttackOptionForWeapon(this.character.equipment.mainHand);
  }

  get offHandAttackOption(): AttackOption | null {
    const weapon = this.character.equipment.offHand;

    if (!weapon || weapon.equipmentType !== 'weapon' || this.character.equipment.isHoldingTwoHand) {
      return null;
    }

    return this.getAttackOptionForWeapon(weapon, {
      isOffHand: true,
    });
  }

  get attackOptionsFromWeapons(): AttackOption[] {
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

  get attackOptionsFromEffects(): AttackOption[] {
    const es = this.character.effect.getAddAttackOptionEffects();

    return es
      .map(({ effect, source }) => {
        const { args } = effect;

        const option = this.getAttackOptionForWeapon(this.character.equipment.mainHand, {
          name: source.name,
          maxBab: (args.extraAttack?.amount || 0) + 1,
          damageMultiplier: args.damageMultiplier,
          ignoreTwoWeapon: args.ignoreTwoWeapon || false,
        });

        if (args.attackBonuses) {
          option.attackBonuses = [...option.attackBonuses, ...args.attackBonuses];
        }

        if (args.damageBonuses) {
          const bonuses = args.damageBonuses.map(({ applyMultiplier, bonus: b }) => {
            if (
              applyMultiplier === option.damageAbility &&
              option.damageMultiplier &&
              option.damageMultiplier > 1
            ) {
              const m = option.damageMultiplier;
              let amountFormula;

              if (b.bonus.amountFormula) {
                amountFormula = Array.isArray(b.bonus.amountFormula)
                  ? b.bonus.amountFormula.map((af) => `FLOOR((${af}) * ${m})`)
                  : `FLOOR((${b.bonus.amountFormula}) * ${m})`;
              }

              return {
                ...b,
                bonus: {
                  ...b.bonus,
                  amount: Array.isArray(b.bonus.amount)
                    ? b.bonus.amount.map((a) => Math.floor(a * m))
                    : Math.floor(b.bonus.amount * m),
                  amountFormula,
                },
              };
            }

            return b;
          });

          option.damageBonuses = [...option.damageBonuses, ...bonuses];
        }

        return option;
      })
      .filter((o): o is AttackOption => Boolean(o));
  }

  get attackOptions(): AttackOption[] {
    return this.attackOptionsFromWeapons.concat(this.attackOptionsFromEffects);
  }

  mapAttackOptionToAttack(o: AttackOption): Attack {
    const attackBonuses: NamedBonus[] = this.character.makeNamedBonuses(o.attackBonuses);
    const damageBonuses: NamedBonus[] = this.character.makeNamedBonuses(o.damageBonuses);

    return {
      option: o,
      attackBonuses,
      attackModifier: this.character.aggregateNamedBonusesAmount(attackBonuses),
      damageBonuses,
      damageModifier: this.character.aggregateNamedBonusesMaxAmount(damageBonuses),
    };
  }
  get attacks(): Attack[] {
    return this.attackOptions.map((o) => this.mapAttackOptionToAttack(o));
  }
}
