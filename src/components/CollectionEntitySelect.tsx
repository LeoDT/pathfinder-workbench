import { Button, Menu, MenuButton, MenuItem, MenuList, Icon, Text, HStack } from '@chakra-ui/react';
import { FaCheck, FaChevronDown } from 'react-icons/fa';

import { Collection } from '../store/collection';

interface Props {
  collection: Collection;
  onChange: (v: string) => void;
  value: string | null;
  placeholder?: string;
  withArrow?: boolean;
}

export default function CollectionEntitySelect({
  collection,
  onChange,
  value,
  placeholder = 'Select',
  withArrow = true,
}: Props): JSX.Element {
  return (
    <Menu placement="bottom-start">
      <MenuButton as={Button}>
        <HStack>
          <Text>{(value ? collection.getById(value).name : '') || placeholder}</Text>
          {withArrow ? <Icon as={FaChevronDown} display="inine-block" /> : null}
        </HStack>
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
