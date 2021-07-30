import { keyBy } from 'lodash-es';

import { Domain } from '../../types/domain';
import { Collection, CollectionOptions } from './base';

export class DomainCollection extends Collection<Domain> {
  dataWithoutInquisition: Domain[];
  dataDruid: Domain[];
  subDomainIndex: Record<string, Domain>;

  constructor(
    domainData: Array<Domain>,
    inquisitionData: Array<Domain>,
    options?: CollectionOptions
  ) {
    super(
      'domain',
      [...domainData, ...inquisitionData.map((i) => ({ ...i, inquisition: true }))],
      options
    );

    for (const i of this.data) {
      for (const p of i.powers) {
        p._type = 'classFeat';
      }

      if (i.subDomains) {
        for (const sub of i.subDomains) {
          sub._type = 'domain';

          for (const p of sub.powers) {
            p._type = 'classFeat';
          }
        }
      }
    }

    this.dataWithoutInquisition = this.data.filter((d) => !d.inquisition);
    this.dataDruid = this.data.filter((d) => d.druid);
    this.subDomainIndex = keyBy(
      this.data
        .filter((d) => d.subDomains)
        .map((d) => d.subDomains as Domain[])
        .flat(),
      'id'
    );
  }

  getById(id: string): Domain {
    const item = this.idIndex[id] || this.subDomainIndex[id];

    if (!item) {
      throw Error(`can not find domain or subDomain with id ${id}`);
    }

    return item;
  }

  getByIds(ids: string[]): Domain[] {
    return ids.map((id) => this.getById(id));
  }
}
