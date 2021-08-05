import { Observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';

import {
  Box,
  Button,
  HStack,
  Heading,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';

import { useStore } from '../../store';

const PRESTIGE_COLORS = ['green.600', 'blue.600', 'pink.600', 'red.600'];

export function Prestige(): JSX.Element {
  const { dm } = useStore();

  return (
    <Tabs isLazy>
      <TabList>
        <Tab>声望</Tab>
        <Tab>配置</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Observer>
            {() => (
              <>
                <Table>
                  <Thead>
                    <Tr>
                      <Th />
                      {dm.prestiges.characters.map(({ id, name }) => (
                        <Th key={id} textAlign="center">
                          {name}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {dm.prestiges.factions.map((f) => (
                      <Tr key={f.id}>
                        <Td>{f.name}</Td>
                        {dm.prestiges.characters.map((c) => {
                          const pId = `${f.id}:${c.id}`;
                          const p = dm.prestiges.prestige.get(pId) || 0;
                          const [pl] = dm.getPrestigeLevel(p);

                          let textColor = 'black';
                          if (pl) {
                            const index = dm.prestiges.levels.indexOf(pl);

                            if (index >= 0) {
                              textColor =
                                PRESTIGE_COLORS[Math.min(index, PRESTIGE_COLORS.length - 1)];
                            }
                          }

                          return (
                            <Td key={c.id} textAlign="center">
                              <VStack alignItems="center">
                                <IconButton
                                  aria-label="增加声望"
                                  icon={<Icon as={FaPlus} />}
                                  size="xs"
                                  onClick={() => dm.increasePresitge(f, c)}
                                />
                                <Text color={textColor}>{dm.showPrestige(p)}</Text>
                                <IconButton
                                  aria-label="减少声望"
                                  icon={<Icon as={FaMinus} />}
                                  size="xs"
                                  onClick={() => dm.decreasePresitge(f, c)}
                                />
                              </VStack>
                            </Td>
                          );
                        })}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </>
            )}
          </Observer>
        </TabPanel>
        <TabPanel>
          <Observer>
            {() => (
              <>
                <HStack>
                  <Heading as="h4" fontSize="lg">
                    友好等级
                  </Heading>
                  <Button size="sm" onClick={() => dm.addPrestigeLevel('新友好等级')}>
                    添加友好等级
                  </Button>
                </HStack>
                <Box py="2" width="50%">
                  {dm.prestiges.levels.map((l) => (
                    <HStack key={l.id} mb="2">
                      <Input
                        value={l.name}
                        onChange={(e) => {
                          l.name = e.target.value;
                        }}
                      />
                      <NumberInput
                        min={1}
                        value={l.max}
                        onChange={(v) => {
                          l.max = parseInt(v);
                        }}
                      >
                        <NumberInputField />
                      </NumberInput>
                      <IconButton
                        aria-label="删除友好等级"
                        colorScheme="red"
                        icon={<Icon as={FaTrash} />}
                        onClick={() => dm.removePrestigeLevel(l)}
                      />
                    </HStack>
                  ))}
                </Box>

                <HStack>
                  <Heading as="h4" fontSize="lg">
                    人物
                  </Heading>
                  <Button size="sm" onClick={() => dm.addPrestigeCharacter('新人物')}>
                    添加人物
                  </Button>
                </HStack>
                <Box py="2" width="50%">
                  {dm.prestiges.characters.map((c) => (
                    <HStack key={c.id} mb="2">
                      <Input
                        value={c.name}
                        onChange={(e) => {
                          c.name = e.target.value;
                        }}
                      />
                      <IconButton
                        aria-label="删除人物"
                        colorScheme="red"
                        icon={<Icon as={FaTrash} />}
                        onClick={() => dm.removePrestigeCharacter(c)}
                      />
                    </HStack>
                  ))}
                </Box>
                <HStack>
                  <Heading as="h4" fontSize="lg">
                    派别
                  </Heading>
                  <Button size="sm" onClick={() => dm.addPrestigeFaction('新派别')}>
                    添加派别
                  </Button>
                </HStack>
                <Box py="2" width="50%">
                  {dm.prestiges.factions.map((f) => (
                    <HStack key={f.id} mb="2">
                      <Input
                        value={f.name}
                        onChange={(e) => {
                          f.name = e.target.value;
                        }}
                      />
                      <IconButton
                        aria-label="删除派别"
                        colorScheme="red"
                        icon={<Icon as={FaTrash} />}
                        onClick={() => dm.removePrestigeFaction(f)}
                      />
                    </HStack>
                  ))}
                </Box>
              </>
            )}
          </Observer>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export function PrestigeModal(): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={() => onOpen()}>声望</Button>

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Prestige />
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => onClose()}>OK</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
