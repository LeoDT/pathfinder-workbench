import { Observer } from 'mobx-react-lite';

import { Box, Tag, Text, Wrap, WrapItem } from '@chakra-ui/react';

import { EQUIPMENT_COLOR_SCHEME } from '../../constant';
import { useStore } from '../../store';
import { showEquipment } from '../../utils/equipment';
import { CreateEquipmentToggler } from '../CreateEquipment';
import { useCurrentCharacter } from './context';

export default function CharacterDetailStorage(): JSX.Element {
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
                      _hover={{ opacity: 0.8 }}
                      variant="outline"
                      colorScheme={EQUIPMENT_COLOR_SCHEME[e.equipmentType]}
                      cursor="pointer"
                      onClick={() => {
                        ui.showQuickViewer(e.type);
                      }}
                    >
                      {showEquipment(e)}
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
