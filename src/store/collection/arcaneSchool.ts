import { ArcaneSchool } from '../../types/arcaneSchool';
import { ClassFeat } from '../../types/core';
import { Collection, CollectionOptions } from './base';

export class ArcaneSchoolCollection extends Collection<ArcaneSchool> {
  constructor(data: Array<ArcaneSchool>, options?: CollectionOptions) {
    super('arcaneSchool', data, options);

    for (const i of this.data) {
      for (const p of i.powers) {
        p._type = 'classFeat';
      }

      switch (i.type) {
        case 'standard':
          if (i.focused) {
            for (const focus of i.focused) {
              focus._type = 'arcaneSchool';

              for (const p of focus.powers) {
                p._type = 'classFeat';
              }
            }
          }
      }
    }
  }

  getArcaneSchoolPowers(school: string, focused?: string): ClassFeat[] {
    const s = this.getById(school);

    let powers = s.powers;
    switch (s.type) {
      case 'standard':
        if (focused && s.focused) {
          const f = s.focused.find((f) => f.id === focused);

          if (f) {
            powers = [...s.powers.filter((p) => !f.replace.includes(p.id)), ...f.powers];
          }
        }
    }

    return powers;
  }
}
