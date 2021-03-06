import { Observer } from 'mobx-react-lite';
import { FaCopy, FaTrashAlt } from 'react-icons/fa';

import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Icon,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
  VStack,
} from '@chakra-ui/react';

import { useStore } from '../../store';
import { DMCharacter } from '../../store/dm';
import { stringToColor } from '../../utils/misc';
import { CharacterTracker } from './CharacterTracker';

interface Props {
  character: DMCharacter;
}

export function Character({ character: c }: Props): JSX.Element {
  const { dm } = useStore();

  return (
    <Observer>
      {() => (
        <VStack
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          spacing={0}
          opacity={parseInt(c.hp) <= 0 ? 0.6 : 1}
        >
          <HStack
            borderBottom="1px"
            borderBottomColor="gray.200"
            borderTopWidth="6px"
            borderTopColor={stringToColor(c.name)}
            borderTopRadius="md"
            alignItems="flex-end"
            p="2"
            pt="0"
            w="100%"
          >
            <Box flexBasis="50%">
              <Text fontSize="xx-small" color="gray.400">
                姓名
              </Text>
              <Input
                value={c.name}
                onChange={(e) => {
                  c.name = e.target.value;
                }}
                variant="unstyled"
                fontSize="lg"
                fontWeight="bold"
              />
            </Box>
            <Box pt="1">
              <Text fontSize="xs">
                先攻: {parseInt(c.initiative) + c.rolledInitiative}({c.initiative} +{' '}
                {c.rolledInitiative})
              </Text>
              <Text fontSize="xs">
                察觉: {parseInt(c.perception) + c.rolledPerception}({c.perception} +{' '}
                {c.rolledPerception})
              </Text>
              <Text fontSize="xs">
                意志: {parseInt(c.willSave) + c.rolledWillSave}({c.willSave} + {c.rolledWillSave})
              </Text>
            </Box>
          </HStack>

          <HStack spacing={0} borderBottom="1px" borderColor="gray.200">
            <Box p="2" borderRight="1px" borderColor="gray.200">
              <Text fontSize="xx-small" color="gray.400">
                HP
              </Text>
              <Input
                value={c.hp}
                onChange={(e) => {
                  c.hp = e.target.value;
                }}
                variant="unstyled"
                type="number"
              />
            </Box>
            <Box p="2" borderRight="1px" borderColor="gray.200">
              <Text fontSize="xx-small" color="gray.400">
                Max HP
              </Text>
              <Input
                value={c.maxHP}
                onChange={(e) => {
                  c.maxHP = e.target.value;
                }}
                variant="unstyled"
                type="number"
              />
            </Box>
          </HStack>
          <HStack spacing={0} borderBottom="1px" borderColor="gray.200">
            <Box p="2" borderRight="1px" borderColor="gray.200">
              <Text fontSize="xx-small" color="gray.400">
                先攻加值
              </Text>
              <Input
                value={c.initiative}
                onChange={(e) => {
                  c.initiative = e.target.value;
                }}
                variant="unstyled"
                type="number"
              />
            </Box>
            <Box p="2" borderRight="1px" borderColor="gray.200">
              <Text fontSize="xx-small" color="gray.400">
                察觉加值
              </Text>
              <Input
                value={c.perception}
                onChange={(e) => {
                  c.perception = e.target.value;
                }}
                variant="unstyled"
                type="number"
              />
            </Box>
            <Box p="2">
              <Text fontSize="xx-small" color="gray.400">
                意志豁免
              </Text>
              <Input
                value={c.willSave}
                onChange={(e) => {
                  c.willSave = e.target.value;
                }}
                variant="unstyled"
                type="number"
              />
            </Box>
          </HStack>
          <HStack p="2" justify="flex-start" align="center" w="full">
            <CharacterTracker character={c} />
            <Menu isLazy>
              <MenuButton as={Button} size="sm">
                投
              </MenuButton>
              <Portal>
                <MenuList>
                  <MenuItem onClick={() => dm.rollInitiative(c)}>先攻</MenuItem>
                  <MenuItem onClick={() => dm.rollPerception(c)}>察觉</MenuItem>
                  <MenuItem onClick={() => dm.rollWillSave(c)}>意志</MenuItem>
                </MenuList>
              </Portal>
            </Menu>

            <Button size="sm" onClick={() => dm.heal(c)}>
              恢复
            </Button>

            <ButtonGroup isAttached style={{ marginLeft: 'auto' }}>
              <Button
                size="sm"
                onClick={() => {
                  dm.copyCharacter(c);
                }}
              >
                <Icon as={FaCopy} />
              </Button>
              <Button
                colorScheme="red"
                size="sm"
                onClick={() => {
                  if (confirm('确定移除此人物?')) {
                    dm.removeCharacter(c);
                  }
                }}
              >
                <Icon as={FaTrashAlt} />
              </Button>
            </ButtonGroup>
          </HStack>
        </VStack>
      )}
    </Observer>
  );
}
