import { Observer } from 'mobx-react-lite';
import { Box, Wrap, WrapItem, Tag, Text } from '@chakra-ui/react';

import { useCurrentCharacter } from './context';

import { CreateEquipmentToggler } from '../CreateEquipment';
import { EQUIPMENT_COLOR_SCHEME } from '../../constant';
import { showEquipment } from '../../utils/equipment';

export default function CharacterDetailStorage(): JSX.Element {
  const character = useCurrentCharacter();

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
                      cursor="default"
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
