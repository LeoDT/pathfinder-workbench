import { Button, Menu, MenuButton, MenuItem, MenuList, Icon } from '@chakra-ui/react';
import { FaCheck } from 'react-icons/fa';

import { Collection } from '../store/collection';

interface Props {
  collection: Collection;
  onChange: (v: string) => void;
  value: string | null;
  placeholder?: string;
}

export default function CollectionEntitySelect({
  collection,
  onChange,
  value,
  placeholder = 'Select',
}: Props): JSX.Element {
  return (
    <Menu placement="bottom-start">
      <MenuButton as={Button}>
        {(value ? collection.getById(value)?.name : '') || placeholder}
      </MenuButton>
      <MenuList>
        {collection.data.map((e) => (
          <MenuItem
            key={e.id}
            onClick={() => {
              onChange(e.id);
            }}
            icon={e.id === value ? <Icon as={FaCheck} /> : undefined}
          >
            {e.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
