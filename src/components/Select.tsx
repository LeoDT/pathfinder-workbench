import { without, tail } from 'lodash-es';
import { useMemo } from 'react';
import { FaCheck, FaChevronDown } from 'react-icons/fa';

import {
  BoxProps,
  Button,
  ButtonProps,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';

import { SelectOptions } from '../types/misc';

export interface Props<T = string> {
  options: SelectOptions<T>;
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
    <Menu placement="bottom-start" isLazy>
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
            isDisabled={o.disabled}
          >
            {o.text}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}

export interface MultipleProps<T = string> extends Omit<Props<T>, 'onChange' | 'value'> {
  onChange: (v: T[]) => void;
  value: T[];
  min?: number;
  max?: number;
}

export function MultipleSelect<T>({
  options,
  value,
  onChange,
  placeholder = 'Select',
  buttonProps,
  withArrow = true,
  menuListProps,
  min = 1,
  max,
}: MultipleProps<T>): JSX.Element {
  const values = useMemo(
    () => value.map((v) => options.find((o) => o.value === v)?.text).join(', '),
    [options, value]
  );

  return (
    <Menu placement="bottom-start" isLazy closeOnSelect={false}>
      <MenuButton as={Button} {...buttonProps}>
        <HStack>
          <Text>{buttonProps?.children || (value !== null ? values : '') || placeholder}</Text>
          {withArrow ? <Icon as={FaChevronDown} display="inine-block" /> : null}
        </HStack>
      </MenuButton>
      <MenuList backgroundColor="white" {...menuListProps}>
        {options.map((o, i) => {
          const checked = Boolean(value.includes(o.value));
          return (
            <MenuItem
              key={o.key ?? i}
              onClick={() => {
                if (checked) {
                  const v = without(value, o.value);

                  if (v.length >= min) {
                    onChange(v);
                  }
                } else {
                  const v = [...value, o.value];

                  if (max && v.length > max) {
                    onChange([...tail(value), o.value]);
                  } else {
                    onChange([...value, o.value]);
                  }
                }
              }}
              icon={checked ? <Icon as={FaCheck} /> : undefined}
              isDisabled={o.disabled || (value.length === min && checked)}
            >
              {o.text}
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}
