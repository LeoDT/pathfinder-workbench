import React, { ReactNode } from 'react';

import {
  Box,
  BoxProps,
  HStack,
  Heading,
  HeadingProps,
  Spacer,
  StackProps,
  Text,
} from '@chakra-ui/react';

import { NamedBonus } from '../../types/core';
import { NamedBonusPopover } from '../NamedBonusPopover';

export function Block(props: BoxProps): JSX.Element {
  return <Box border="1px" borderColor="gray.200" borderRadius="md" {...props} />;
}

export function BlockHeading(props: HeadingProps): JSX.Element {
  return <Heading as="h4" fontSize="xl" mb="4" {...props} />;
}

interface BlockItemProps extends StackProps {
  label: React.ReactNode;
  children: React.ReactNode;
}

export function VBlockItem({ label, children, ...props }: BlockItemProps): JSX.Element {
  return (
    <HStack
      p="2"
      borderBottom="1px"
      borderColor="gray.200"
      w="full"
      _last={{ borderBottom: '0' }}
      role="group"
      {...props}
    >
      <Text
        color="gray.500"
        _groupHover={{ color: 'gray.700' }}
        transition="color .15s ease-in-out"
        whiteSpace="nowrap"
      >
        {label}
      </Text>
      <Spacer />
      <Box whiteSpace="nowrap">{children}</Box>
    </HStack>
  );
}

export function HBlockItem({ label, children, ...props }: BlockItemProps): JSX.Element {
  return (
    <HStack p="2" borderRight="1px" borderColor="gray.200" role="group" {...props}>
      <Text
        color="gray.500"
        _groupHover={{ color: 'gray.700' }}
        transition="color .15s ease-in-out"
        whiteSpace="nowrap"
      >
        {label}
      </Text>
      <Spacer />
      <Box>{children}</Box>
    </HStack>
  );
}

export function HBlockItemForBonus({
  bonuses,
  children,
  label,
}: {
  bonuses: NamedBonus[];
  children: ReactNode;
  label: ReactNode;
}): JSX.Element {
  return (
    <Box
      flexBasis={1 / 3}
      flexGrow={1}
      borderRight="1px"
      borderColor="gray.200"
      _last={{
        borderRight: 'none',
      }}
    >
      <NamedBonusPopover bonuses={bonuses}>
        <HBlockItem label={label} borderRight="none">
          {children}
        </HBlockItem>
      </NamedBonusPopover>
    </Box>
  );
}

export function VBlockItemForBonus({
  bonuses,
  children,
  label,
}: {
  bonuses: NamedBonus[];
  children: ReactNode;
  label: ReactNode;
}): JSX.Element {
  return (
    <Box
      flexBasis={1 / 3}
      flexGrow={1}
      borderBottom="1px"
      borderColor="gray.200"
      _last={{
        borderBottom: 'none',
      }}
    >
      <NamedBonusPopover bonuses={bonuses}>
        <VBlockItem label={label} borderBottom="none">
          {children}
        </VBlockItem>
      </NamedBonusPopover>
    </Box>
  );
}
