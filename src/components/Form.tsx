import { HStack, Text, Spacer, StackProps, VStack } from '@chakra-ui/react';

type Props = StackProps;

export function Form({ children }: Props): JSX.Element {
  return <VStack w="full">{children}</VStack>;
}

interface FormControlProps extends StackProps {
  label: React.ReactNode;
}

export function FormControl({ label, children, ...props }: FormControlProps): JSX.Element {
  return (
    <HStack w="full" pb="2" borderBottom="1px" borderColor="gray.200" {...props}>
      {typeof label === 'string' ? (
        <Text fontSize="lg" whiteSpace="nowrap">
          {label}
        </Text>
      ) : (
        label
      )}
      <Spacer />
      {children}
    </HStack>
  );
}
