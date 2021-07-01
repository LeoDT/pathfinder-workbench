import { useMemo } from 'react';

import { Collection } from '../store/collection';
import { Select, Props as SelectProps } from './Select';

interface Props extends Omit<SelectProps, 'options'> {
  collection: Collection;
}

export function CollectionEntitySelect({ collection, ...props }: Props): JSX.Element {
  const options = useMemo(
    () => collection.data.map((i) => ({ value: i.id, text: i.name })),
    [collection]
  );

  return <Select options={options} {...props} />;
}
