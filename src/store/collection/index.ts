/* eslint-disable @typescript-eslint/no-explicit-any */

// cra typescript supported is messed up, it will override tsconfig with its webpack loader config.
// so something are done for big json file here
// for vscode: add tsconfig.json for this dir to disable "resolveJsonModule",
// for vscode: json.d.ts for this folder, to declare json as any
// for cra: add `as any` for all the json imports

import { Race, Feat, Class, Skill } from '../../types/core';
import { ArcaneSchool } from '../../types/arcaneSchool';

import SKILL_DATA from '../../data/skills.json';
import RACE_DATA from '../../data/races.json';
import CLASS_DATA from '../../data/classes.json';
import SPELL_DATA from '../../data/spells.json';
import FEAT_DATA from '../../data/feats.json';
import ARCANE_SCHOOL_DATA from '../../data/arcane-schools.json';

import { Collection } from './base';
export * from './base';
import SpellCollection from './spell';

export const collections = {
  skill: new Collection<Skill>('skill', SKILL_DATA as any, {
    searchFields: ['id', 'name'],
  }),
  race: new Collection<Race>('race', RACE_DATA as any, {
    searchFields: ['id', 'name'],
  }),
  spell: new SpellCollection('spell', SPELL_DATA as any, {
    searchFields: ['id', 'name'],
  }),
  feat: new Collection<Feat>('feat', FEAT_DATA as any, {
    searchFields: ['id', 'name'],
  }),
  class: new Collection<Class>('class', CLASS_DATA as any, {
    searchFields: ['id', 'name'],
  }),
  arcaneSchool: new Collection<ArcaneSchool>('arcaneSchool', ARCANE_SCHOOL_DATA as any, {
    searchFields: ['id', 'name'],
  }),
};
