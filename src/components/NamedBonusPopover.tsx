import { ReactNode } from 'react';

import {
  Box,
  HStack,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverProps,
  PopoverTrigger,
  Text,
  Portal,
} from '@chakra-ui/react';

import { NamedBonus } from '../types/core';

interface Props extends PopoverProps {
  bonuses: NamedBonus[];
  children: ReactNode;
}

export function NamedBonusPopover({ bonuses, children, ...props }: Props): JSX.Element {
  return (
    <Popover isLazy {...props}>
      <PopoverTrigger>
        <Box cursor="pointer" w="full">
          {children}
        </Box>
      </PopoverTrigger>
      <Portal>
        <PopoverContent width="48">
          <PopoverBody>
            {bonuses.map(({ name, bonus }, i) => (
              <HStack
                key={i}
                justifyContent="space-between"
                textDecoration={bonus.ignored ? 'line-through' : ''}
              >
                <Text>{name}</Text>
                <Text>{Array.isArray(bonus.amount) ? bonus.amount.join('/') : bonus.amount}</Text>
              </HStack>
            ))}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}
