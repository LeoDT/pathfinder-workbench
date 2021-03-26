import { memo } from 'react';
import { VStack, Text, TextProps } from '@chakra-ui/react';

interface Props {
  number: string | number;
  text: string;
  numberProps?: TextProps;
}

export function StatNumber({ number, text, numberProps }: Props): JSX.Element {
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

export default memo(StatNumber);
