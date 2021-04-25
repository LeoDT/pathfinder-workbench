import { Box, Text, HStack } from '@chakra-ui/react';
import { Observer } from 'mobx-react-lite';

import { showModifier } from '../../utils/modifier';
import { HBlockItem, Block } from './CharacterBlock';
import { useCurrentCharacter } from './context';

export function CharacterDetailAttackOptions(): JSX.Element {
  const character = useCurrentCharacter();

  return (
    <Observer>
      {() => (
        <>
          {character.attack.attacks.map((a, i) => {
            return (
              <Box key={i} _notLast={{ mb: '2' }}>
                <Text mb="1">{a.option.name}</Text>
                <Block>
                  <HStack>
                    <HBlockItem label="加值" flexBasis={1 / 3} flexGrow={1}>
                      {showModifier(a.attackModifier)}
                    </HBlockItem>
                    <HBlockItem label="伤害" flexBasis={1 / 3} flexGrow={1}>
                      {a.option.damage}
                      {a.damageModifier !== 0 ? showModifier(a.damageModifier) : ''}
                    </HBlockItem>
                    <HBlockItem label="重击" flexBasis={1 / 3} flexGrow={1}>
                      {a.option.critical}
                    </HBlockItem>
                  </HStack>
                </Block>
              </Box>
            );
          })}
        </>
      )}
    </Observer>
  );
}
