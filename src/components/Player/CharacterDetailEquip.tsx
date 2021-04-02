import { Observer } from 'mobx-react-lite';
import { Box, HStack, Text } from '@chakra-ui/react';

import { useCurrentCharacter } from './context';

import { Block, HBlockItem } from './CharacterBlock';
import Select from '../Select';
import { showModifier } from '../../utils/modifier';

export default function CharacterDetailEquip(): JSX.Element {
  const character = useCurrentCharacter();
  const equip = character.equipment;

  return (
    <Box>
      <Observer>
        {() => (
          <>
            <HStack mb="2">
              <Select
                options={equip.handOptions}
                value={equip.mainHand || null}
                onChange={(v) => {
                  equip.hold(v, 'main');
                }}
                withArrow={false}
                buttonProps={{ children: '主手', size: 'sm', colorScheme: 'orange' }}
              />
              {equip.mainHand ? <Text>{equip.mainHand.name}</Text> : <Text>赤手空拳</Text>}
            </HStack>
            <Block>
              <HStack spacing="0">
                <HBlockItem label="攻击" flexBasis={1 / 3} flexGrow={1}>
                  {showModifier(equip.mainHandAttack)}
                </HBlockItem>
                <HBlockItem label="伤害" flexBasis={1 / 3} flexGrow={1}>
                  {equip.mainHand?.type.meta.damage}
                  {showModifier(equip.mainHandDamageModifier)}
                </HBlockItem>
                <HBlockItem label="暴击" flexBasis={1 / 3} flexGrow={1}>
                  {equip.mainHand?.type.meta.critical}
                </HBlockItem>
              </HStack>
            </Block>
          </>
        )}
      </Observer>
    </Box>
  );
}
