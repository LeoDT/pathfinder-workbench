import { Button, ButtonGroup } from '@chakra-ui/react';

interface Props<T> {
  options: Array<{ text: string; value: T; key?: string }>;
  value: T;
  onChange: (v: T) => void;
}

export default function ButtonSwitch<T = string>({
  options,
  value,
  onChange,
}: Props<T>): JSX.Element {
  return (
    <ButtonGroup isAttached>
      {options.map(({ text, value: v, key }, i) => (
        <Button
          key={key ?? i}
          onClick={() => onChange(v)}
          colorScheme={value === v ? 'teal' : 'gray'}
        >
          {text}
        </Button>
      ))}
    </ButtonGroup>
  );
}
