import { memo } from 'react';

import { Text, TextProps, VStack } from '@chakra-ui/react';

interface Props {
  number: string | number;
  text: string;
  numberProps?: TextProps;
}

export function RawStatNumber({ number, text, numberProps }: Props): JSX.Element {
  return (
    <VStack spacing="0">
      <Text
        fontSize="lg"
        textAlign="center"
        lineHeight="1"
        fontFamily="'Courier Prime', monospace"
        fontWeight="bold"
        letterSpacing={-2}
        {...numberProps}
      >
        {number}
      </Text>
      <Text fontSize="xs" color="gray.500" lineHeight="1">
        {text}
      </Text>
    </VStack>
  );
}

export const StatNumber = memo(RawStatNumber);
