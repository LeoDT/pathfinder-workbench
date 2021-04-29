import { makeObservable, computed } from 'mobx';
import { Abilities, NamedBonus } from '../../types/core';

import { collections } from '../collection';
import Character from '.';
import { aggregateNamedBonusesAmount } from '../../utils/bonus';
import { EffectGainSaveArgs } from '../../types/effectType';

export default class CharacterStatus {
  character: Character;

  constructor(c: Character) {
    makeObservable(this, {
      hpBonuses: computed,
      hp: computed,

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
    });

    this.character = c;
  }

  get modifier(): Abilities {
    return this.character.abilityModifier;
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

    return [
      { name: '基础', bonus: { amount: base, type: 'untyped' } },
      { name: '体质', bonus: { amount: con, type: 'untyped' } },
    ];
  }
  get hp(): number {
    return aggregateNamedBonusesAmount(this.hpBonuses);
  }

  get initiativeBonuses(): NamedBonus[] {
    return [
      { name: '敏捷', bonus: { amount: this.modifier.dex, type: 'untyped' } },
      ...this.character.effect.getGainInitiativeEffects().map((es) => ({
        name: es.source.name,
        bonus: es.effect.args.bonus,
      })),
    ];
  }
  get initiative(): number {
    return aggregateNamedBonusesAmount(this.initiativeBonuses);
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

    return [
      { name: '基础', bonus: { amount: base, type: 'untyped' } },
      { name: '体质', bonus: { amount: this.modifier.con, type: 'untyped' } },
      ...this.getSaveBonuses('fortitude'),
    ];
  }
  get fortitude(): number {
    return aggregateNamedBonusesAmount(this.fortitudeBonuses);
  }

  get reflexBonuses(): NamedBonus[] {
    let base = 0;

    this.character.classLevelDetail.forEach((cl) => {
      base += cl.reflex;
    });

    return [
      { name: '基础', bonus: { amount: base, type: 'untyped' } },
      { name: '敏捷', bonus: { amount: this.modifier.dex, type: 'untyped' } },
      ...this.getSaveBonuses('reflex'),
    ];
  }
  get reflex(): number {
    return aggregateNamedBonusesAmount(this.reflexBonuses);
  }

  get willBonuses(): NamedBonus[] {
    let base = 0;

    this.character.classLevelDetail.forEach((cl) => {
      base += cl.will;
    });

    return [
      { name: '基础', bonus: { amount: base, type: 'untyped' } },
      { name: '感知', bonus: { amount: this.modifier.wis, type: 'untyped' } },
      ...this.getSaveBonuses('will'),
    ];
  }
  get will(): number {
    return aggregateNamedBonusesAmount(this.willBonuses);
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
    return [
      { name: 'BAB', bonus: { amount: this.maxBab, type: 'untyped' } },
      { name: '力量', bonus: { amount: this.modifier.str, type: 'untyped' } },
    ];
  }
  get cmb(): number {
    return aggregateNamedBonusesAmount(this.cmbBonuses);
  }

  get cmdBonuses(): NamedBonus[] {
    return [
      { name: '基础', bonus: { amount: 10, type: 'untyped' } },
      { name: 'BAB', bonus: { amount: this.maxBab, type: 'untyped' } },
      { name: '力量', bonus: { amount: this.modifier.str, type: 'untyped' } },
      { name: '敏捷', bonus: { amount: this.modifier.dex, type: 'untyped' } },
    ];
  }
  get cmd(): number {
    return aggregateNamedBonusesAmount(this.cmdBonuses);
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
    return [
      { name: '基础', bonus: { amount: 10, type: 'untyped' } },
      { name: '敏捷', bonus: { amount: this.modifier.dex, type: 'untyped' } },
      {
        name: '护甲',
        bonus: { amount: this.character.equipment.armorClassModifier, type: 'untyped' },
      },
      ...this.getBonusesForAC('ac'),
    ];
  }
  get ac(): number {
    return aggregateNamedBonusesAmount(this.acBonuses);
  }

  get flatFootedBonuses(): NamedBonus[] {
    return [
      { name: '基础', bonus: { amount: 10, type: 'untyped' } },
      {
        name: '护甲',
        bonus: { amount: this.character.equipment.armorClassModifier, type: 'untyped' },
      },
      ...this.getBonusesForAC('flatFooted'),
    ];
  }
  get flatFooted(): number {
    return aggregateNamedBonusesAmount(this.flatFootedBonuses);
  }

  get touchBonuses(): NamedBonus[] {
    return [
      { name: '基础', bonus: { amount: 10, type: 'untyped' } },
      { name: '敏捷', bonus: { amount: this.modifier.dex, type: 'untyped' } },
      ...this.getBonusesForAC('touch'),
    ];
  }
  get touch(): number {
    return aggregateNamedBonusesAmount(this.touchBonuses);
  }
}