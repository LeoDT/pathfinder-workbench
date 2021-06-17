import { Bloodline } from '../../types/bloodline';
import { Collection, CollectionOptions } from './base';

export class BloodlineCollection extends Collection<Bloodline> {
  constructor(data: Array<Bloodline>, options?: CollectionOptions) {
    super('bloodline', data, options);

    for (const i of this.data) {
      for (const p of i.powers) {
        p._type = 'classFeat';
      }
    }
  }
}
