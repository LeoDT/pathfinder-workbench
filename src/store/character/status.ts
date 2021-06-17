import { computed, makeObservable } from 'mobx';

import { Abilities, NamedBonus } from '../../types/core';
import { EffectGainSaveArgs } from '../../types/effectType';
import { CarryLoad, getCarryLoad } from '../../utils/weight';
import { collections } from '../collection';
import Character from '.';

export default class CharacterStatus {
  character: Character;

  constructor(c: Character) {
    makeObservable(this, {
      hpBonuses: computed,
      hp: computed,

      speedBonuses: computed,
      speed: computed,

      initiativeBonuses: computed,
      initiative: computed,

      fortitudeBonuses: computed,
      fortitude: computed,
      reflexBonuses: computed,
      reflex: computed,
      willBonuses: computed,
      will: computed,

      bab: computed,
      cmbBonuses: computed,
      cmb: computed,
      cmdBonuses: computed,
      cmd: computed,

      acBonuses: computed,
      ac: computed,
      flatFootedBonuses: computed,
      flatFooted: computed,
      touch: computed,
      touchBonuses: computed,

      carryLoad: computed,
    });

    this.character = c;
  }

  get modifier(): Abilities {
    return this.character.abilityModifier;
  }

  get speedBonuses(): NamedBonus[] {
    return [
      { name: '基础', bonus: { amount: this.character.race.speed, type: 'untyped' } },
      ...this.character.effect.getGainSpeedEffects().map((es) => ({
        name: es.source.name,
        bonus: es.effect.args.bonus,
      })),
    ];
  }

  get speed(): number {
    return this.character.aggregateNamedBonusesMaxAmount(this.speedBonuses);
  }

  get hpBonuses(): NamedBonus[] {
    let base = 0;

    this.character.upgradesWithPending.forEach((u, level) => {
      if (u.hp === 0) {
        const clas = collections.class.getById(u.classId);

        base += level === 0 ? clas.hd : clas.hd / 2 + 1;
      } else {
        base += u.hp;
      }

      if (u.favoredClassBonus === 'hp') {
        base += 1;
      }
    });

    const con = this.character.level * this.modifier.con;

    return this.character.makeNamedBonuses([
      { name: '基础', bonus: { amount: base, type: 'untyped' } },
      { name: '体质', bonus: { amount: con, type: 'untyped' } },
      ...this.character.effect.getGainHPEffects().map((es) => ({
        name: es.source.name,
        bonus: es.effect.args.bonus,
      })),
    ]);
  }
  get hp(): number {
    return this.character.aggregateNamedBonusesMaxAmount(this.hpBonuses);
  }

  get initiativeBonuses(): NamedBonus[] {
    return this.character.makeNamedBonuses([
      { name: '敏捷', bonus: { amount: this.modifier.dex, type: 'untyped' } },
      ...this.character.effect.getGainInitiativeEffects().map((es) => ({
        name: es.source.name,
        bonus: es.effect.args.bonus,
      })),
    ]);
  }
  get initiative(): number {
    return this.character.aggregateNamedBonusesMaxAmount(this.initiativeBonuses);
  }

  getSaveBonuses(t: EffectGainSaveArgs['saveType']): NamedBonus[] {
    const args = this.character.effect
      .getGainSaveEffects()
      .filter((es) => es.effect.args.saveType === t || es.effect.args.saveType === 'all');

    return args.map((es) => ({
      name: es.source.name,
      bonus: es.effect.args.bonus,
    }));
  }

  get fortitudeBonuses(): NamedBonus[] {
    let base = 0;

    this.character.classLevelDetail.forEach((cl) => {
      base += cl.fortitude;
    });

    return this.character.makeNamedBonuses([
      { name: '基础', bonus: { amount: base, type: 'untyped' } },
      { name: '体质', bonus: { amount: this.modifier.con, type: 'untyped' } },
      ...this.getSaveBonuses('fortitude'),
    ]);
  }
  get fortitude(): number {
    return this.character.aggregateNamedBonusesMaxAmount(this.fortitudeBonuses);
  }

  get reflexBonuses(): NamedBonus[] {
    let base = 0;

    this.character.classLevelDetail.forEach((cl) => {
      base += cl.reflex;
    });

    return this.character.makeNamedBonuses([
      { name: '基础', bonus: { amount: base, type: 'untyped' } },
      { name: '敏捷', bonus: { amount: this.modifier.dex, type: 'untyped' } },
      ...this.getSaveBonuses('reflex'),
    ]);
  }
  get reflex(): number {
    return this.character.aggregateNamedBonusesMaxAmount(this.reflexBonuses);
  }

  get willBonuses(): NamedBonus[] {
    let base = 0;

    this.character.classLevelDetail.forEach((cl) => {
      base += cl.will;
    });

    return this.character.makeNamedBonuses([
      { name: '基础', bonus: { amount: base, type: 'untyped' } },
      { name: '感知', bonus: { amount: this.modifier.wis, type: 'untyped' } },
      ...this.getSaveBonuses('will'),
    ]);
  }
  get will(): number {
    return this.character.aggregateNamedBonusesMaxAmount(this.willBonuses);
  }

  get bab(): number[] {
    const base: number[] = [];

    this.character.classLevelDetail.forEach((cl) => {
      cl.bab.forEach((v, i) => {
        if (typeof base[i] === 'undefined') {
          base[i] = 0;
        }

        base[i] += v;
      });
    });

    return base;
  }
  get maxBab(): number {
    return Math.max(...this.bab);
  }

  get cmbBonuses(): NamedBonus[] {
    return this.character.makeNamedBonuses([
      { name: 'BAB', bonus: { amount: this.maxBab, type: 'untyped' } },
      { name: '力量', bonus: { amount: this.modifier.str, type: 'untyped' } },
    ]);
  }
  get cmb(): number {
    return this.character.aggregateNamedBonusesMaxAmount(this.cmbBonuses);
  }

  get cmdBonuses(): NamedBonus[] {
    return this.character.makeNamedBonuses([
      { name: '基础', bonus: { amount: 10, type: 'untyped' } },
      { name: 'BAB', bonus: { amount: this.maxBab, type: 'untyped' } },
      { name: '力量', bonus: { amount: this.modifier.str, type: 'untyped' } },
      { name: '敏捷', bonus: { amount: this.modifier.dex, type: 'untyped' } },
      ...this.character.effect.getGainCMDEffects().map((es) => ({
        name: es.source.name,
        bonus: es.effect.args.bonus,
      })),
    ]);
  }
  get cmd(): number {
    return this.character.aggregateNamedBonusesMaxAmount(this.cmdBonuses);
  }

  getBonusesForAC(t: 'ac' | 'flatFooted' | 'touch'): NamedBonus[] {
    const bonuses = this.character.effect.getGainACEffects().map((es) => ({
      name: es.source.name,
      bonus: es.effect.args.bonus,
    }));

    switch (t) {
      case 'flatFooted':
        return bonuses.filter(({ bonus }) => {
          const bt = collections.bonusType.getById(bonus.type);

          return bt.flatFootedAC;
        });
      case 'touch':
        return bonuses.filter(({ bonus }) => {
          const bt = collections.bonusType.getById(bonus.type);

          return bt.touchAC;
        });
    }

    return bonuses;
  }
  get acBonuses(): NamedBonus[] {
    return this.character.makeNamedBonuses([
      { name: '基础', bonus: { amount: 10, type: 'untyped' } },
      { name: '敏捷', bonus: { amount: this.modifier.dex, type: 'untyped' } },
      {
        name: '护甲',
        bonus: { amount: this.character.equipment.armorClassModifier, type: 'untyped' },
      },
      ...this.getBonusesForAC('ac'),
    ]);
  }
  get ac(): number {
    return this.character.aggregateNamedBonusesMaxAmount(this.acBonuses);
  }

  get flatFootedBonuses(): NamedBonus[] {
    return this.character.makeNamedBonuses([
      { name: '基础', bonus: { amount: 10, type: 'untyped' } },
      {
        name: '护甲',
        bonus: { amount: this.character.equipment.armorClassModifier, type: 'untyped' },
      },
      ...this.getBonusesForAC('flatFooted'),
    ]);
  }
  get flatFooted(): number {
    return this.character.aggregateNamedBonusesMaxAmount(this.flatFootedBonuses);
  }

  get touchBonuses(): NamedBonus[] {
    return this.character.makeNamedBonuses([
      { name: '基础', bonus: { amount: 10, type: 'untyped' } },
      { name: '敏捷', bonus: { amount: this.modifier.dex, type: 'untyped' } },
      ...this.getBonusesForAC('touch'),
    ]);
  }
  get touch(): number {
    return this.character.aggregateNamedBonusesMaxAmount(this.touchBonuses);
  }

  get carryLoad(): CarryLoad {
    const weight = this.character.equipment.storageWithCostWeight.reduce(
      (acc, { weight }) => acc + weight,
      0
    );

    return getCarryLoad(this.character.ability.str, weight);
  }
}
