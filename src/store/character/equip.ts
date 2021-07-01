import { keyBy, omit, pick } from 'lodash-es';
import { IObservableArray, action, computed, makeObservable, observable } from 'mobx';

import { Armor, Equipment, MagicItem, Weapon } from '../../types/core';
import { SelectOptions } from '../../types/misc';
import { Coin, coinAdd, makeCoin } from '../../utils/coin';
import { equipmentCostWeight, getArmorPenalty, showEquipment } from '../../utils/equipment';
import { collections } from '../collection';
import { Character } from '.';

export type Hand = 'main' | 'off';

interface RawCharacterEquip {
  storage?: Array<Equipment>;
  mainHandId?: string;
  offHandId?: string;
  bucklerId?: string;
  armorId?: string;
  wondrousIds?: string[];
}

export class CharacterEquip {
  character: Character;

  storage: IObservableArray<Equipment>;

  mainHandId?: string;
  offHandId?: string;
  bucklerId?: string;
  armorId?: string;

  wondrousIds?: string[];

  constructor(c: Character, raw?: RawCharacterEquip) {
    makeObservable(this, {
      storageWithCostWeight: computed,
      storageCostWeight: computed,

      handOptions: computed,
      bucklerOptions: computed,
      armorOptions: computed,
      wondrousOptions: computed,

      mainHandId: observable,
      mainHand: computed,
      offHandId: observable,
      offHand: computed,

      isHoldingTwoHandWeapon: computed,
      isHoldingTwoHand: computed,
      isTwoWeapon: computed,

      bucklerId: observable,
      buckler: computed,

      armorId: observable,
      armor: computed,

      wondrousIds: observable,
      wondrous: computed,

      armorClassModifier: computed,
      armorPenalty: computed,

      hold: action,
      unhold: action,
      unholdBuckler: action,
      wearArmor: action,
      unwearArmor: action,
      wearWondrous: action,
      unwearWondrous: action,
    });

    this.character = c;
    this.storage = observable.array(raw?.storage || [], { deep: false });

    this.mainHandId = raw?.mainHandId;
    this.offHandId = raw?.offHandId;
    this.bucklerId = raw?.bucklerId;
    this.armorId = raw?.armorId;
    this.wondrousIds = raw?.wondrousIds;
  }

  get storageWithCostWeight(): Array<{ e: Equipment; cost: Coin; weight: number }> {
    return this.storage.map((e) => ({ e, ...equipmentCostWeight(e) }));
  }
  get storageIndex(): Record<string, Equipment> {
    return keyBy(this.storage, 'id');
  }
  get storageCostWeight(): { cost: Coin; weight: number } {
    return this.storage.reduce(
      (acc, e) => {
        const costWeight = equipmentCostWeight(e);

        return {
          cost: coinAdd(acc.cost, costWeight.cost),
          weight: acc.weight + costWeight.weight,
        };
      },
      { cost: makeCoin(0), weight: 0 }
    );
  }

  get handOptions(): SelectOptions<Weapon | Armor> {
    return this.storage
      .filter(
        (e): e is Weapon | Armor =>
          e.equipmentType === 'weapon' ||
          (e.equipmentType === 'armor' &&
            e.type._type === 'armorType' &&
            e.type.meta.category === 'shield' &&
            !e.type.meta.buckler)
      )
      .map((e) => ({
        text: showEquipment(e),
        value: e,
      }));
  }
  get bucklerOptions(): SelectOptions<Armor> {
    return this.storage
      .filter((e): e is Armor =>
        Boolean(e.equipmentType === 'armor' && e.type._type === 'armorType' && e.type.meta.buckler)
      )
      .map((e) => ({
        text: showEquipment(e),
        value: e,
      }));
  }
  get armorOptions(): SelectOptions<Armor> {
    return this.storage
      .filter((e): e is Armor =>
        Boolean(
          e.equipmentType === 'armor' &&
            e.type._type === 'armorType' &&
            e.type.meta.category !== 'shield'
        )
      )
      .map((e) => ({
        text: showEquipment(e),
        value: e,
      }));
  }
  get wondrousOptions(): SelectOptions<MagicItem> {
    return this.storage
      .filter((e): e is MagicItem => Boolean(e.equipmentType === 'magicItem'))
      .map((e) => ({
        text: showEquipment(e),
        value: e,
      }));
  }

  getStorageById(id: string): Equipment | undefined {
    return this.storageIndex[id];
  }
  removeFromStorage(e: Equipment): void {
    if (this.mainHand === e) this.unhold('main');
    if (this.offHand === e) this.unhold('off');
    if (this.armor === e) this.unwearArmor();
    if (this.buckler === e) this.unholdBuckler();
    if (e.equipmentType === 'magicItem' && this.wondrous.includes(e)) this.unwearWondrous(e);

    this.storage.remove(e);
  }

  get mainHand(): Weapon | undefined {
    return this.mainHandId ? (this.storageIndex[this.mainHandId] as Weapon) : undefined;
  }
  get offHand(): Weapon | Armor | undefined {
    return this.offHandId ? (this.storageIndex[this.offHandId] as Armor | Weapon) : undefined;
  }
  get buckler(): Armor | undefined {
    return this.bucklerId ? (this.storageIndex[this.bucklerId] as Armor) : undefined;
  }
  get armor(): Armor | undefined {
    return this.armorId ? (this.storageIndex[this.armorId] as Armor) : undefined;
  }
  get wondrous(): MagicItem[] {
    return (
      this.wondrousIds
        ?.map((wId) => this.storageIndex[wId])
        .filter((w): w is MagicItem => Boolean(w)) ?? []
    );
  }

  get armorClassModifier(): number {
    let mod = 0;

    if (this.armor) {
      mod += this.armor.type.meta.ac;
    }

    if (this.offHand?.type.meta.category === 'shield') {
      mod += this.offHand?.type.meta.ac;
    }

    if (this.buckler) {
      mod += this.buckler?.type.meta.ac;
    }

    return mod;
  }

  get armorPenalty(): number {
    let mod = 0;

    if (this.armor) {
      mod += getArmorPenalty(this.armor);
    }

    if (this.offHand?.equipmentType === 'armor') {
      mod = Math.max(getArmorPenalty(this.offHand), mod);
    }

    if (this.buckler) {
      mod = Math.max(getArmorPenalty(this.buckler), mod);
    }

    return mod;
  }

  get isHoldingTwoHandWeapon(): boolean {
    return Boolean(
      this.mainHand &&
        (this.mainHand.type.meta.category === 'two-handed' || this.mainHand.type.meta.bothHand)
    );
  }
  get isHoldingTwoHand(): boolean {
    return Boolean(this.mainHand && this.offHand && this.mainHand === this.offHand);
  }
  get isTwoWeapon(): boolean {
    return Boolean(
      this.mainHand !== this.offHand && this.mainHand && this.offHand?.equipmentType === 'weapon'
    );
  }
  get isOffHandHoldingShield(): boolean {
    return Boolean(this.offHand && this.offHand.type.meta.category === 'shield');
  }

  hold(e: Equipment, hand?: Hand): void {
    switch (e.equipmentType) {
      case 'weapon': {
        if (e.equipmentType === 'weapon' && e.type.meta.bothHand) {
          this.mainHandId = e.id;
          this.offHandId = e.id;

          break;
        }

        if (hand === 'main') {
          if (this.isHoldingTwoHand) {
            this.offHandId = undefined;
          }

          this.mainHandId = e.id;
        }

        if (hand === 'off') {
          this.offHandId = e.id;
        }

        break;
      }

      case 'armor': {
        if (e.type.meta.category !== 'shield') {
          throw new Error('can not hold armor');
        }

        if (e.type.meta.buckler) {
          this.bucklerId = e.id;
        } else {
          this.offHandId = e.id;
        }

        break;
      }
    }
  }

  unhold(hand: Hand): void {
    if (this.mainHand && this.mainHand.type.meta.bothHand) {
      this.mainHandId = undefined;
      this.offHandId = undefined;

      return;
    }

    switch (hand) {
      case 'main':
        this.mainHandId = undefined;
        break;
      case 'off':
        this.offHandId = undefined;
        break;
    }
  }

  unholdBuckler(): void {
    this.bucklerId = undefined;
  }

  wearArmor(a: Armor): void {
    this.armorId = a.id;
  }
  unwearArmor(): void {
    this.armorId = undefined;
  }

  wearWondrous(w: Equipment): void {
    if (w.equipmentType === 'magicItem') {
      const { slot } = w.type.meta;

      if (slot === 'ring') {
        const all = this.wondrous.filter((w) => w.type.meta.slot === slot);
        const filterOut = all.length > 1 ? all[0] : undefined;

        this.wondrousIds = [...this.wondrous.filter((w) => w !== filterOut), w].map((w) => w.id);
      } else {
        this.wondrousIds = [...this.wondrous.filter((w) => w.type.meta.slot !== slot), w].map(
          (w) => w.id
        );
      }
    }
  }
  unwearWondrous(w: Equipment): void {
    this.wondrousIds = this.wondrousIds?.filter((wId) => w.id !== wId) || [];
  }

  static stringify(e: CharacterEquip): string {
    return JSON.stringify({
      mainHandId: e.mainHandId,
      offHandId: e.offHandId,
      bucklerId: e.bucklerId,
      armorId: e.armorId,
      wondrousIds: e.wondrousIds,
      storage: e.storage.map((e) => ({
        ...pick(e, ['equipmentType', 'id', 'size', 'name', 'masterwork', 'enchantment', 'spiked']),
        typeId: e.type.id,
      })),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static parse(s: string | any, c: Character): CharacterEquip {
    const json = typeof s === 'string' ? JSON.parse(s) : s;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storage = json.storage?.map((e: any) => {
      let type = null;

      switch (e.equipmentType) {
        case 'weapon':
          type = collections.weaponType.getById(e.typeId);
          break;
        case 'armor':
          type = collections.armorType.getById(e.typeId);
          break;
        case 'magicItem':
          type = collections.magicItemType.getById(e.typeId);
          break;
        case 'spellItem':
          type = collections.spell.getById(e.typeId);
          break;
      }

      return {
        ...omit(e, ['typeId']),
        _type: 'common',
        type,
      };
    });

    return new CharacterEquip(c, {
      ...json,
      storage,
    });
  }
}
