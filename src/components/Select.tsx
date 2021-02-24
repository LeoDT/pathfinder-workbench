import { Button, Menu, MenuButton, MenuItem, MenuList, Icon } from '@chakra-ui/react';
import { FaCheck } from 'react-icons/fa';

interface Props<T = string> {
  options: Array<{ text: string; value: T; key?: string }>;
  onChange: (v: T) => void;
  value: T | null;
  placeholder?: string;
}

export default function Select<T>({
  options,
  value,
  onChange,
  placeholder = 'Select',
}: Props<T>): JSX.Element {
  return (
    <Menu placement="bottom-start">
      <MenuButton as={Button}>
        {(value ? options.find(({ value: v }) => v === value)?.text : '') || placeholder}
      </MenuButton>
      <MenuList>
        {options.map((o, i) => (
          <MenuItem
            key={o.key ?? i}
            onClick={() => {
              onChange(o.value);
            }}
            icon={o.value === value ? <Icon as={FaCheck} /> : undefined}
          >
            {o.text}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
