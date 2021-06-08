import { Race } from '../../types/core';
import { Collection, CollectionOptions } from './base';

export class RaceCollection extends Collection<Race> {
  constructor(data: Array<Race>, options?: CollectionOptions) {
    super('race', data, options);

    for (const i of this.data) {
      for (const t of i.racialTrait) {
        t._type = 'racialTrait';
      }
      for (const t of i.alternateRacialTrait) {
        t._type = 'racialTrait';
      }
    }
  }
}
