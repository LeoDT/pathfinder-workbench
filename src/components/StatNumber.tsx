import { VStack, Text } from '@chakra-ui/react';

interface Props {
  number: string | number;
  text: string;
}

export default function StatNumber({ number, text }: Props): JSX.Element {
  return (
    <VStack spacing="0">
      <Text fontSize="large" textAlign="center" lineHeight="1">
        {number}
      </Text>
      <Text fontSize="xs" color="gray.500" lineHeight="1">
        {text}
      </Text>
    </VStack>
  );
}
