import { useCallback, useEffect, useState } from 'react';

import { Button, ButtonGroup, Input, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react';

import { useStore } from '../../store';
import { DiceNotation, parse, stringify } from '../../utils/dice';

const HISTORY_PERSIST_KEY = 'diceRollHistory';

interface Props {
  onRoll: (v: string) => void;
}

export function DiceNotationInput({ onRoll }: Props): JSX.Element {
  const store = useStore();
  const [error, setError] = useState<Error | null>(null);
  const [dice, setDice] = useState<string>('d20');
  const [rollHistory, setRollHistory] = useState<string[]>([]);
  const addDice = useCallback(
    (d: DiceNotation) => {
      setError(null);

      try {
        setDice(stringify(parse(`${dice} + ${d}`), true));
      } catch (e) {
        setError(e);
      }
    },
    [dice]
  );

  useEffect(() => {
    store.restoreMisc(HISTORY_PERSIST_KEY).then((h) => {
      try {
        const history = JSON.parse(h);

        if (history) {
          setRollHistory(history);
          setDice(history[0] || 'd20');
        }
      } catch (e) {
        console.warn('restore roll history failed');
      }
    });
  }, []);

  return (
    <VStack alignItems="flex-start">
      <Input
        variant="outline"
        value={dice}
        onChange={(e) => {
          setError(null);

          setDice(e.target.value);
        }}
        isInvalid={Boolean(error)}
        spellCheck="false"
        autoComplete="false"
      />

      {error ? <Text color="red">输入有误</Text> : null}

      <ButtonGroup isAttached size="sm">
        <Button onClick={() => addDice('d4')}>d4</Button>
        <Button onClick={() => addDice('d6')}>d6</Button>
        <Button onClick={() => addDice('d8')}>d8</Button>
        <Button onClick={() => addDice('d10')}>d10</Button>
        <Button onClick={() => addDice('d12')}>d12</Button>
        <Button onClick={() => addDice('d20')}>d20</Button>
      </ButtonGroup>

      {rollHistory.length > 0 ? (
        <Wrap>
          {rollHistory.map((h) => (
            <WrapItem
              key={h}
              color="blue.500"
              textDecoration="underline"
              cursor="pointer"
              onClick={() => setDice(h)}
            >
              {h}
            </WrapItem>
          ))}
        </Wrap>
      ) : null}

      <Button
        colorScheme="teal"
        alignSelf="flex-end"
        mt="2"
        onClick={() => {
          try {
            parse(dice);
          } catch (e) {
            setError(e);
          }

          store.persistMisc(
            HISTORY_PERSIST_KEY,
            JSON.stringify(Array.from(new Set([dice, ...rollHistory])).slice(0, 6))
          );

          onRoll(dice);
        }}
      >
        投!
      </Button>
    </VStack>
  );
}
