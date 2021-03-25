import { VStack, Box, Text, Button, Heading } from '@chakra-ui/react';
import { useHistory } from 'react-router';

import { useStore } from '../../store';
import { useCreateCharacterStore, InvalidReason } from '../../store/createCharacter';

const validateTranslates: Record<InvalidReason, string> = {
  abilityPoints: '有未使用的能力点数',
  classSpeciality: '未选择职业特性',
  skillPoints: '有未使用的技能点数',
  feat: '未选择足够专长',
  spell: '未选择足够法术',
};

export default function CreateCharacterFeat(): JSX.Element {
  const store = useStore();
  const create = useCreateCharacterStore();
  const history = useHistory();
  const validateResults = create.validate();
  const invalid = validateResults.length > 0;

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
            create.character.finishUpgrade();
            store.characters.push(create.character);
            history.push('/player');
          }
        }}
      >
        完成
      </Button>
    </VStack>
  );
}
