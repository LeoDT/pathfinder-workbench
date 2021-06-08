import { useMemo } from 'react';

import Select, { Props as SelectProps } from './Select';

import { Collection } from '../store/collection';

interface Props extends Omit<SelectProps, 'options'> {
  collection: Collection;
}

export function CollectionEntitySelect({ collection, ...props }: Props): JSX.Element {
  const options = useMemo(() => collection.data.map((i) => ({ value: i.id, text: i.name })), [
    collection,
  ]);

  return <Select options={options} {...props} />;
}
