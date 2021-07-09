import { ClassFeat, Entity } from './core';

export interface Domain extends Entity {
  _type: 'domain';
  powers: ClassFeat[];
  spells?: string[];
  subDomains?: Domain[];
  druid?: boolean;
  inquisition?: boolean;
}
