import { Observer } from 'mobx-react-lite';
import { Box, HStack, Text } from '@chakra-ui/react';

import { useCurrentCharacter } from './context';

import { Block, HBlockItem } from './CharacterBlock';
import Select from '../Select';
import { showModifier } from '../../utils/modifier';
import { EQUIPMENT_COLOR_SCHEME } from '../../constant';

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
                buttonProps={{
                  children: '主手',
                  size: 'sm',
                  colorScheme: EQUIPMENT_COLOR_SCHEME.weapon,
                }}
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
      <Observer>
        {() => (
          <>
            <HStack my="2">
              <Select
                options={equip.handOptions}
                value={equip.offHand || null}
                onChange={(v) => {
                  equip.hold(v, 'off');
                }}
                withArrow={false}
                buttonProps={{
                  children: '副手',
                  size: 'sm',
                  colorScheme: EQUIPMENT_COLOR_SCHEME.weapon,
                  isDisabled: equip.isHoldingTwoHand,
                }}
              />
              {equip.offHand ? <Text>{equip.offHand.name}</Text> : <Text>赤手空拳</Text>}
            </HStack>
            {(() => {
              if (equip.isHoldingTwoHand) return null;
              if (!equip.offHand) return null;

              switch (equip.offHand.equipmentType) {
                case 'weapon':
                  return (
                    <Block>
                      <HStack spacing="0">
                        <HBlockItem label="攻击" flexBasis={1 / 3} flexGrow={1}>
                          {showModifier(equip.offHandAttack)}
                        </HBlockItem>
                        <HBlockItem label="伤害" flexBasis={1 / 3} flexGrow={1}>
                          {equip.offHand?.type.meta.damage}
                          {showModifier(equip.offHandDamageModifier)}
                        </HBlockItem>
                        <HBlockItem label="暴击" flexBasis={1 / 3} flexGrow={1}>
                          {equip.offHand?.type.meta.critical}
                        </HBlockItem>
                      </HStack>
                    </Block>
                  );
                case 'armor':
                  return (
                    <Block>
                      <HStack spacing="0">
                        <HBlockItem label="AC" flexBasis={1 / 3} flexGrow={1}>
                          {showModifier(equip.offHand.type.meta.ac)}
                        </HBlockItem>
                        <HBlockItem label="检定减值" flexBasis={1 / 3} flexGrow={1}>
                          {equip.offHand.type.meta.penalty}
                        </HBlockItem>
                        <HBlockItem label="奥术失败" flexBasis={1 / 3} flexGrow={1}>
                          {equip.offHand.type.meta.arcaneFailureChance}
                        </HBlockItem>
                      </HStack>
                    </Block>
                  );
              }
            })()}
          </>
        )}
      </Observer>
      <Observer>
        {() => (
          <>
            <HStack my="2">
              <Select
                options={equip.armorOptions}
                value={equip.armor || null}
                onChange={(v) => {
                  equip.wear(v);
                }}
                withArrow={false}
                buttonProps={{
                  children: '护甲',
                  size: 'sm',
                  colorScheme: EQUIPMENT_COLOR_SCHEME.armor,
                }}
              />
              {equip.armor ? <Text>{equip.armor.name}</Text> : <Text>赤身裸体</Text>}
            </HStack>
            {equip.armor ? (
              <Block>
                <HStack spacing="0">
                  <HBlockItem label="AC" flexBasis={1 / 3} flexGrow={1}>
                    {showModifier(equip.armor.type.meta.ac)}
                  </HBlockItem>
                  <HBlockItem label="检定减值" flexBasis={1 / 3} flexGrow={1}>
                    {equip.armor.type.meta.penalty}
                  </HBlockItem>
                  <HBlockItem label="奥术失败" flexBasis={1 / 3} flexGrow={1}>
                    {equip.armor.type.meta.arcaneFailureChance}
                  </HBlockItem>
                </HStack>
              </Block>
            ) : null}
          </>
        )}
      </Observer>
    </Box>
  );
}
