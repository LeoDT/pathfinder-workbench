import { Observer } from 'mobx-react-lite';
import { Box, Table, Tbody, Thead, Tr, Td, Th, Text } from '@chakra-ui/react';

import { useCurrentCharacter } from './context';

import { CreateEquipmentToggler } from '../CreateEquipment';
import { showCoin } from '../../utils/coin';
import { showWeight } from '../../utils/misc';

const stickyTHStyles = {
  top: '0',
  backgroundColor: 'white',
};

export default function CharacterDetailStorage(): JSX.Element {
  const character = useCurrentCharacter();

  return (
    <Box position="relative">
      <Box position="absolute" right="0" top="-10">
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
            <Box maxH={200} overflowY="auto">
              <Table position="relative">
                <Thead>
                  <Tr>
                    <Th {...stickyTHStyles} position="sticky">
                      名称
                    </Th>
                    <Th {...stickyTHStyles} position="sticky" isNumeric>
                      花费
                    </Th>
                    <Th {...stickyTHStyles} position="sticky" isNumeric>
                      重量
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {character.equipment.storageWithCostWeight.map(({ e, cost, weight }) => (
                    <Tr key={e.id}>
                      <Td>{e.name}</Td>
                      <Td isNumeric>{showCoin(cost)}</Td>
                      <Td isNumeric>{showWeight(weight)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Text color="gray">空无一物</Text>
          )
        }
      </Observer>
    </Box>
  );
}
