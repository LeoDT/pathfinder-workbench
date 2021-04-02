/* eslint-disable @typescript-eslint/no-explicit-any */

// cra typescript supported is messed up, it will override tsconfig with its webpack loader config.
// so something are done for big json file here
// for vscode: add tsconfig.json for this dir to disable "resolveJsonModule",
// for vscode: json.d.ts for this folder, to declare json as any
// for cra: add `as any` for all the json imports

import { Race, Feat, Class, Skill, ArmorType } from '../../types/core';
import { ArcaneSchool } from '../../types/arcaneSchool';

import SKILL_DATA from '../../data/skills.json';
import RACE_DATA from '../../data/races.json';
import CLASS_DATA from '../../data/classes.json';
import SPELL_DATA from '../../data/spells.json';
import FEAT_DATA from '../../data/feats.json';
import WEAPON_TYPES_DATA from '../../data/weapon-types.json';
import ARMOR_TYPES_DATA from '../../data/armor-types.json';
import ARCANE_SCHOOL_DATA from '../../data/arcane-schools.json';

import { Collection } from './base';
export * from './base';
import SpellCollection from './spell';
import WeaponTypeCollection from './weaponType';

export const collections = {
  skill: new Collection<Skill>('skill', SKILL_DATA as any),
  race: new Collection<Race>('race', RACE_DATA as any),
  spell: new SpellCollection(SPELL_DATA as any),
  feat: new Collection<Feat>('feat', FEAT_DATA as any),
  class: new Collection<Class>('class', CLASS_DATA as any),
  weaponType: new WeaponTypeCollection(WEAPON_TYPES_DATA as any),
  armorType: new Collection<ArmorType>('armorType', ARMOR_TYPES_DATA as any),
  arcaneSchool: new Collection<ArcaneSchool>('arcaneSchool', ARCANE_SCHOOL_DATA as any),
};
