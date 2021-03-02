import { Observer } from 'mobx-react-lite';
import { VStack, HStack, Input, Box, Text, Button } from '@chakra-ui/react';

import { useStore } from '../../store';
import { DMCharacter } from '../../store/dm';
import { stringToColor } from '../../utils/misc';

interface Props {
  character: DMCharacter;
}

export default function Character({ character: c }: Props): JSX.Element {
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
            p="2"
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
            <Box>
              <Text fontSize="sm">
                先攻: {parseInt(c.initiative) + c.rolledInitiative}({c.initiative} +{' '}
                {c.rolledInitiative})
              </Text>
              <Text fontSize="sm">
                察觉: {parseInt(c.perception) + c.rolledPerception}({c.perception} +{' '}
                {c.rolledPerception})
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
            <Box p="2">
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
          </HStack>
          <HStack p="2" justify="flex-start" align="center" w="full">
            <Button size="xs" onClick={() => dm.rollInitiative(c)}>
              投先攻
            </Button>
            <Button size="xs" onClick={() => dm.rollPerception(c)}>
              投察觉
            </Button>
            <Button size="xs" onClick={() => dm.heal(c)}>
              恢复
            </Button>
            <Button
              colorScheme="red"
              size="xs"
              onClick={() => {
                if (confirm('确定移除此人物?')) {
                  dm.removeCharacter(c);
                }
              }}
            >
              删除
            </Button>
          </HStack>
        </VStack>
      )}
    </Observer>
  );
}
