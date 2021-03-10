import { Observer } from 'mobx-react-lite';
import {
  Button,
  ButtonGroup,
  IconButton,
  HStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverFooter,
  Text,
  Input,
  Spacer,
  Portal,
} from '@chakra-ui/react';
import { FaPlus, FaMinus, FaUndo } from 'react-icons/fa';

import { useStore } from '../../store';
import { DMCharacter, Tracker as TrackerType } from '../../store/dm';

interface Props {
  character: DMCharacter;
}

export function Tracker({ tracker }: { tracker: TrackerType }): JSX.Element {
  return (
    <Observer>
      {() => (
        <HStack mb="2">
          <Input
            variant="unstyled"
            value={tracker.name}
            onChange={(e) => {
              tracker.name = e.target.value;
            }}
          />
          <Spacer />
          <HStack>
            <Text>{tracker.remain}</Text>
            <Text>/</Text>
            <Input
              value={tracker.max}
              px="0"
              width="2em"
              textAlign="center"
              onChange={(e) => {
                tracker.max = e.target.value;
              }}
              size="sm"
              fontSize="1em"
            />
          </HStack>
          <ButtonGroup isAttached>
            <IconButton
              icon={<FaMinus />}
              aria-label="decrease"
              size="sm"
              onClick={() => {
                tracker.remain = Math.max(0, tracker.remain - 1);
              }}
              disabled={tracker.remain <= 0}
            />
            <IconButton
              icon={<FaPlus />}
              aria-label="increase"
              size="sm"
              onClick={() => {
                tracker.remain = Math.min(parseInt(tracker.max), tracker.remain + 1);
              }}
              disabled={tracker.remain >= parseInt(tracker.max)}
            />
            <IconButton
              icon={<FaUndo />}
              aria-label="recover"
              size="sm"
              onClick={() => {
                tracker.remain = parseInt(tracker.max);
              }}
              disabled={tracker.remain >= parseInt(tracker.max)}
            />
          </ButtonGroup>
        </HStack>
      )}
    </Observer>
  );
}

export default function CharacterTracker({ character }: Props): JSX.Element {
  const { dm } = useStore();

  return (
    <Popover placement="bottom-start" isLazy>
      <PopoverTrigger>
        <Button size="sm">
          Trackers{character.trackers.length ? `(${character.trackers.length})` : ''}
        </Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent boxShadow="md">
          <Observer>
            {() => (
              <PopoverBody>
                {character.trackers.length === 0 ? (
                  <Text fontSize="lg">暂无Tracker</Text>
                ) : (
                  character.trackers.map((t) => <Tracker key={t.id} tracker={t} />)
                )}
              </PopoverBody>
            )}
          </Observer>

          <PopoverFooter d="flex" justifyContent="flex-end">
            <Button size="sm" onClick={() => dm.recoverTracker(character)} mr="2">
              全部恢复
            </Button>
            <Button size="sm" onClick={() => dm.addTracker(character)}>
              添加Tracker
            </Button>
          </PopoverFooter>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}
