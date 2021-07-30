/* eslint-disable @typescript-eslint/no-explicit-any */

// cra typescript supported is messed up, it will override tsconfig with its webpack loader config.
// so something are done for big json file here
// for vscode: add tsconfig.json for this dir to disable "resolveJsonModule",
// for vscode: json.d.ts for this folder, to declare json as any
// for cra: add `as any` for all the json imports

import ARCANE_SCHOOL_DATA from '../../data/arcane-schools.json';
import ARCHETYPES_DATA from '../../data/archetypes.json';
import ARMOR_TYPES_DATA from '../../data/armor-types.json';
import BONUS_TYPES_DATA from '../../data/bonus-types.json';
import CLASS_DATA from '../../data/classes.json';
import CONSOLIDATED_SKILL_DATA from '../../data/consolidated-skills.json';
import CORE_SKILL_DATA from '../../data/core-skills.json';
import DOMAIN_DATA from '../../data/domains.json';
import FEAT_DATA from '../../data/feats.json';
import INQUISITION_DATA from '../../data/inquisitions.json';
import MAGIC_ITEM_TYPES_DATA from '../../data/magic-item-types.json';
import RACE_DATA from '../../data/races.json';
import COMBAT_STYLE_DATA from '../../data/ranger-combat-styles.json';
import SORCERER_BLOODLINES_DATA from '../../data/sorcerer-bloodlines.json';
import SPELL_DATA from '../../data/spells.json';
import WEAPON_TYPES_DATA from '../../data/weapon-types.json';
import { CombatStyle } from '../../types/combatStyle';
import { ArmorType, BonusType, MagicItemType, Skill } from '../../types/core';
import { ArcaneSchoolCollection } from './arcaneSchool';
import { ArchetypeCollection } from './archetype';
import { Collection } from './base';
import { BloodlineCollection } from './bloodline';
import { ClassCollection } from './class';
import { DomainCollection } from './domain';
import { FeatCollection } from './feat';
import { RaceCollection } from './race';
import { SpellCollection } from './spell';
import { WeaponTypeCollection } from './weaponType';

export * from './base';

export const collections = {
  arcaneSchool: new ArcaneSchoolCollection(ARCANE_SCHOOL_DATA as any),
  archetype: new ArchetypeCollection(ARCHETYPES_DATA as any),
  armorType: new Collection<ArmorType>('armorType', ARMOR_TYPES_DATA as any),
  bonusType: new Collection<BonusType>('bonusType', BONUS_TYPES_DATA as any),
  class: new ClassCollection(CLASS_DATA as any),
  rangerCombatStyles: new Collection<CombatStyle>('combatStyle', COMBAT_STYLE_DATA as any),
  consolidatedSkill: new Collection<Skill>('skill', CONSOLIDATED_SKILL_DATA as any),
  coreSkill: new Collection<Skill>('skill', CORE_SKILL_DATA as any),
  domain: new DomainCollection(DOMAIN_DATA as any, INQUISITION_DATA as any),
  feat: new FeatCollection(FEAT_DATA as any),
  magicItemType: new Collection<MagicItemType>('magicItemType', MAGIC_ITEM_TYPES_DATA as any),
  race: new RaceCollection(RACE_DATA as any),
  sorcererBloodline: new BloodlineCollection(SORCERER_BLOODLINES_DATA as any),
  spell: new SpellCollection(SPELL_DATA as any),
  weaponType: new WeaponTypeCollection(WEAPON_TYPES_DATA as any),
};

(window as any).collections = collections;
