import { Observer } from 'mobx-react-lite';
import { FaMinus, FaPlus, FaUndo } from 'react-icons/fa';

import { ButtonGroup, HStack, IconButton, Input, Spacer, Text } from '@chakra-ui/react';

import { useCurrentCharacter } from './context';

export function CharacterDetailTrackers(): JSX.Element {
  const character = useCurrentCharacter();

  return (
    <Observer>
      {() => {
        return (
          <>
            {character.tracker.trackers.map((tracker) => (
              <HStack mb="2" key={tracker.id}>
                {tracker.readonly ? (
                  <Text>{tracker.name}</Text>
                ) : (
                  <Input
                    variant="unstyled"
                    value={tracker.name}
                    onChange={(e) => {
                      tracker.name = e.target.value;
                    }}
                  />
                )}
                <Spacer />
                <HStack>
                  <Text>{tracker.current}</Text>
                  <Text>/</Text>
                  {tracker.readonly ? (
                    <Text>{tracker.max}</Text>
                  ) : (
                    <Input
                      value={tracker.max}
                      px="0"
                      width="2em"
                      textAlign="center"
                      onChange={(e) => {
                        tracker.max = parseInt(e.target.value);
                      }}
                      size="sm"
                      fontSize="1em"
                    />
                  )}
                </HStack>
                <ButtonGroup isAttached>
                  <IconButton
                    icon={<FaMinus />}
                    aria-label="decrease"
                    size="sm"
                    onClick={() => {
                      character.tracker.decreaseTracker(tracker);
                    }}
                    disabled={tracker.current <= 0}
                  />
                  <IconButton
                    icon={<FaPlus />}
                    aria-label="increase"
                    size="sm"
                    onClick={() => {
                      character.tracker.increaseTracker(tracker);
                    }}
                    disabled={tracker.current >= tracker.max}
                  />
                  <IconButton
                    icon={<FaUndo />}
                    aria-label="recover"
                    size="sm"
                    onClick={() => {
                      character.tracker.restoreTracker(tracker);
                    }}
                    disabled={tracker.current >= tracker.max}
                  />
                </ButtonGroup>
              </HStack>
            ))}
          </>
        );
      }}
    </Observer>
  );
}
