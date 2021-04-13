import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Icon,
  HStack,
  Text,
  BoxProps,
  ButtonProps,
} from '@chakra-ui/react';
import { FaCheck, FaChevronDown } from 'react-icons/fa';

interface Props<T = string> {
  options: Array<{ text: string; value: T; key?: string }>;
  onChange: (v: T) => void;
  value: T | null;
  placeholder?: string;
  buttonProps?: ButtonProps;
  withArrow?: boolean;
  menuListProps?: BoxProps;
}

export default function Select<T>({
  options,
  value,
  onChange,
  placeholder = 'Select',
  buttonProps,
  withArrow = true,
  menuListProps,
}: Props<T>): JSX.Element {
  return (
    <Menu placement="bottom-start">
      <MenuButton as={Button} {...buttonProps}>
        <HStack>
          <Text>
            {buttonProps?.children ||
              (value !== null ? options.find(({ value: v }) => v === value)?.text : '') ||
              placeholder}
          </Text>
          {withArrow ? <Icon as={FaChevronDown} display="inine-block" /> : null}
        </HStack>
      </MenuButton>
      <MenuList backgroundColor="white" {...menuListProps}>
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
