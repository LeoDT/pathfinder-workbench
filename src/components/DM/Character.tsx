import { Observer } from 'mobx-react-lite';
import { FaCopy, FaEye, FaEyeSlash, FaTrashAlt } from 'react-icons/fa';

import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Icon,
  IconButton,
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
import { DMCharacter } from '../../store/dm/types';
import { CharacterTracker } from './CharacterTracker';

interface Props {
  character: DMCharacter;
}

const characterTypeTranslates = {
  player: 'PC',
  npc: 'NPC',
  enemy: '敌人',
};
const characterTypeColor = {
  player: 'blue.400',
  npc: 'green.400',
  enemy: 'red.400',
};

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
          opacity={parseInt(c.hp) <= 0 || c.disabled ? 0.6 : 1}
        >
          <HStack
            borderBottom="1px"
            borderBottomColor="gray.200"
            borderTopWidth="6px"
            borderTopColor={characterTypeColor[c.type]}
            borderTopRadius="md"
            alignItems="flex-end"
            p="2"
            pt="0"
            w="100%"
          >
            <Box flexBasis="50%">
              <Text fontSize="xx-small" color="gray.400">
                {characterTypeTranslates[c.type]}姓名
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
            <Box p="2">
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
              <IconButton
                aria-label="复制人物"
                icon={<Icon as={FaCopy} />}
                size="sm"
                onClick={() => {
                  dm.copyCharacter(c);
                }}
              />
              {c.disabled ? (
                <IconButton
                  aria-label="显示人物"
                  icon={<Icon as={FaEye} />}
                  size="sm"
                  onClick={() => {
                    dm.enableCharacter(c);
                  }}
                />
              ) : (
                <IconButton
                  aria-label="隐藏人物"
                  icon={<Icon as={FaEyeSlash} />}
                  size="sm"
                  onClick={() => {
                    dm.disableCharacter(c);
                  }}
                />
              )}
              <IconButton
                aria-label="删除人物"
                icon={<Icon as={FaTrashAlt} />}
                colorScheme="red"
                size="sm"
                onClick={() => {
                  if (confirm('确定移除此人物?')) {
                    dm.removeCharacter(c);
                  }
                }}
              />
            </ButtonGroup>
          </HStack>
        </VStack>
      )}
    </Observer>
  );
}
