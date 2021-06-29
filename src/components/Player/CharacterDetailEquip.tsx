import { Observer } from 'mobx-react-lite';
import { FaTrash } from 'react-icons/fa';

import { Badge, Box, HStack, Icon, IconButton, SimpleGrid, Text } from '@chakra-ui/react';

import { EQUIPMENT_COLOR_SCHEME } from '../../constant';
import { MagicItem } from '../../types/core';
import { showEquipment } from '../../utils/equipment';
import { magicItemSlotTranslates } from '../../utils/magicItemType';
import { EntityPickerPopover } from '../EntityPicker';
import Select from '../Select';
import { useCurrentCharacter } from './context';

export default function CharacterDetailEquip(): JSX.Element {
  const character = useCurrentCharacter();
  const equip = character.equipment;

  return (
    <Box>
      <Observer>
        {() => (
          <>
            <SimpleGrid columns={2} spacing="2">
              <HStack>
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
                {equip.mainHand ? (
                  <Text>{showEquipment(equip.mainHand)}</Text>
                ) : (
                  <Text>赤手空拳</Text>
                )}
                {equip.mainHand ? (
                  <IconButton
                    size="sm"
                    icon={<Icon as={FaTrash} />}
                    aria-label="脱下"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => equip.unhold('main')}
                  />
                ) : null}
              </HStack>
              <HStack>
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
                    isDisabled: equip.isHoldingTwoHandWeapon,
                  }}
                />
                {equip.offHand ? (
                  <Text>{showEquipment(equip.offHand)}</Text>
                ) : (
                  <Text>赤手空拳</Text>
                )}
                {equip.offHand ? (
                  <IconButton
                    size="sm"
                    icon={<Icon as={FaTrash} />}
                    aria-label="脱下"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => equip.unhold('off')}
                  />
                ) : null}
              </HStack>
              <HStack>
                <Select
                  options={equip.armorOptions}
                  value={equip.armor || null}
                  onChange={(v) => {
                    equip.wearArmor(v);
                  }}
                  withArrow={false}
                  buttonProps={{
                    children: '护甲',
                    size: 'sm',
                    colorScheme: EQUIPMENT_COLOR_SCHEME.armor,
                  }}
                />
                {equip.armor ? <Text>{showEquipment(equip.armor)}</Text> : <Text>赤身裸体</Text>}
                {equip.armor ? (
                  <IconButton
                    size="sm"
                    icon={<Icon as={FaTrash} />}
                    aria-label="脱下"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => equip.unwearArmor()}
                  />
                ) : null}
              </HStack>
              <HStack>
                <Select
                  options={equip.bucklerOptions}
                  value={equip.buckler || null}
                  onChange={(v) => {
                    equip.hold(v);
                  }}
                  withArrow={false}
                  buttonProps={{
                    children: '小圆盾',
                    size: 'sm',
                    colorScheme: EQUIPMENT_COLOR_SCHEME.armor,
                  }}
                />
                {equip.buckler ? <Text>{showEquipment(equip.buckler)}</Text> : <Text>无</Text>}
                {equip.buckler ? (
                  <IconButton
                    size="sm"
                    icon={<Icon as={FaTrash} />}
                    aria-label="脱下"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => equip.unwearArmor()}
                  />
                ) : null}
              </HStack>
              <HStack>
                <EntityPickerPopover
                  text="奇物"
                  togglerBtnProps={{ colorScheme: EQUIPMENT_COLOR_SCHEME.magicItem, size: 'sm' }}
                  entities={equip.storage.filter(
                    (e): e is MagicItem => e.equipmentType === 'magicItem'
                  )}
                  items={equip.wondrousIds}
                  onPick={(id) => {
                    const e = equip.getStorageById(id) as MagicItem;

                    if (e) equip.wearWondrous(e);
                  }}
                  onUnpick={(id) => {
                    const e = equip.getStorageById(id) as MagicItem;

                    if (e) equip.unwearWondrous(e);
                  }}
                  labelRenderer={(e) => (
                    <HStack>
                      <Badge>{magicItemSlotTranslates[e.type.meta.slot]}</Badge>
                      <Text>{e.name}</Text>
                    </HStack>
                  )}
                  listAll
                  quickViewer={false}
                />
                {equip.wondrous.length ? <Text>{equip.wondrous.length}个</Text> : <Text>无</Text>}
              </HStack>
            </SimpleGrid>
          </>
        )}
      </Observer>
    </Box>
  );
}
