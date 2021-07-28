import { Observer } from 'mobx-react-lite';

import { Box, HStack, Text } from '@chakra-ui/react';

import { showModifier, showModifiers } from '../../utils/modifier';
import { Block, HBlockItem, HBlockItemForBonus } from './CharacterBlock';
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
                  <HStack spacing="0" justifyContent="stretch" w="full">
                    <HBlockItemForBonus label="加值" bonuses={a.attackBonuses}>
                      {showModifiers(a.attackModifier)}
                    </HBlockItemForBonus>
                    <HBlockItemForBonus label="伤害" bonuses={a.damageBonuses}>
                      {a.option.damage}
                      {a.damageModifier !== 0 ? showModifier(a.damageModifier) : ''}
                    </HBlockItemForBonus>
                    <Box flexBasis={1 / 3} flexGrow={1}>
                      <HBlockItem label="重击" borderRight="0">
                        {a.option.critical}
                      </HBlockItem>
                    </Box>
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
