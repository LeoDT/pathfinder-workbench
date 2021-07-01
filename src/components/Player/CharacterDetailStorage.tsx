import { Observer } from 'mobx-react-lite';

import { Box, Tag, TagCloseButton, TagLabel, Text, Wrap, WrapItem } from '@chakra-ui/react';

import { EQUIPMENT_COLOR_SCHEME } from '../../constant';
import { useStore } from '../../store';
import { showEquipment } from '../../utils/equipment';
import { CreateEquipmentToggler } from '../CreateEquipment';
import { useCurrentCharacter } from './context';

export function CharacterDetailStorage(): JSX.Element {
  const character = useCurrentCharacter();
  const { ui } = useStore();

  return (
    <Box position="relative">
      <Box position="absolute" right="0" top="-9">
        <CreateEquipmentToggler
          buttonProps={{ size: 'sm' }}
          characterSize={character.race.size}
          onCreate={(e) => {
            character.equipment.storage.push(e);
          }}
        />
      </Box>

      <Observer>
        {() =>
          character.equipment.storageWithCostWeight.length ? (
            <Box>
              <Wrap maxH={200} spacing="2">
                {character.equipment.storageWithCostWeight.map(({ e }) => (
                  <WrapItem key={e.id}>
                    <Tag
                      variant="outline"
                      colorScheme={EQUIPMENT_COLOR_SCHEME[e.equipmentType]}
                      onClick={() => {
                        ui.showQuickViewer(e.type);
                      }}
                    >
                      <TagLabel _hover={{ opacity: 0.8 }} cursor="pointer">
                        {showEquipment(e)}
                      </TagLabel>
                      <TagCloseButton
                        onClick={(ev) => {
                          ev.stopPropagation();

                          if (confirm('确定移除物品吗?')) {
                            character.equipment.removeFromStorage(e);
                          }
                        }}
                      />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          ) : (
            <Text color="gray">空无一物</Text>
          )
        }
      </Observer>
    </Box>
  );
}
