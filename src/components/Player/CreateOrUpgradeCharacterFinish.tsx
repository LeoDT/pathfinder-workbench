import { useEffect } from 'react';
import { useHistory } from 'react-router';

import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';

import { useStore } from '../../store';
import { CreateCharacterStore, InvalidReason } from '../../store/createCharacter';
import { useHistoryUnblock } from './context';

interface Props {
  createOrUpgrade: CreateCharacterStore;
}

const validateTranslates: Record<InvalidReason, string> = {
  abilityBonus: '未选择足够能力奖励',
  abilityPoints: '有未使用的能力点数',
  skillPoints: '有未使用的技能点数',
  feat: '未选择足够专长',
  spell: '未选择足够法术',
  favoredClass: '未选择足够天赋职业',
};

export function CreateOrUpgradeCharacterFinish({ createOrUpgrade }: Props): JSX.Element {
  const store = useStore();
  const history = useHistory();
  const validateResults = createOrUpgrade.validate();
  const invalid = validateResults.length > 0;
  const unblock = useHistoryUnblock();

  useEffect(() => {
    return () => {
      createOrUpgrade.dispose();
    };
  }, []);

  return (
    <VStack alignItems="flex-start" maxW="sm">
      <Heading as="h4" fontSize="lg">
        角色{invalid ? '未' : '已'}完成
      </Heading>
      {validateResults.map((r) => (
        <Box key={r} borderBottom="1px" borderColor="gray.300" p="2" w="full">
          <Text color="orange.500">{validateTranslates[r]}</Text>
        </Box>
      ))}
      {invalid ? null : <Text>新角色没有问题!</Text>}
      <Button
        colorScheme="teal"
        disabled={invalid}
        isFullWidth
        size="lg"
        onClick={() => {
          if (!invalid) {
            createOrUpgrade.dispose();
            createOrUpgrade.character.finishUpgrade();

            if (!store.characters.includes(createOrUpgrade.character)) {
              store.characters.push(createOrUpgrade.character);
            }

            if (unblock && unblock.current) {
              unblock.current();
            }
            history.push(`/player/character/${createOrUpgrade.character.id}`);
          }
        }}
      >
        完成
      </Button>
    </VStack>
  );
}
