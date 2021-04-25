import {
  Box,
  BoxProps,
  HStack,
  Text,
  StackProps,
  Spacer,
  Heading,
  HeadingProps,
} from '@chakra-ui/react';

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
      >
        {label}
      </Text>
      <Spacer />
      <Box>{children}</Box>
    </HStack>
  );
}

export function HBlockItem({ label, children, ...props }: BlockItemProps): JSX.Element {
  return (
    <HStack
      p="2"
      borderRight="1px"
      borderColor="gray.200"
      _last={{ borderRight: '0' }}
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
      <Box>{children}</Box>
    </HStack>
  );
}
