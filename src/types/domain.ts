import { ClassFeat, Entity } from './core';

export interface Domain extends Entity {
  _type: 'domain';
  desc?: string;
  powers: ClassFeat[];
  spells?: string[];
  subDomains?: Domain[];
  druid?: boolean;
  inquisition?: boolean;
}
