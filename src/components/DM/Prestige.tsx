import { range } from 'lodash-es';
import { autorun } from 'mobx';
import { Observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Icon,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
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
  Textarea,
  Th,
  Thead,
  Tr,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';

import { useStore } from '../../store';
import { Prestige as PrestigeStore, prestigeTemplates } from '../../store/dm/prestige';
import { Select } from '../Select';

const PRESTIGE_COLORS = ['green.600', 'blue.600', 'pink.600', 'red.600'];

export function Prestige(): JSX.Element {
  const { dm } = useStore();
  const [currentId, setCurrentId] = useState<string | null>(() => dm.prestiges[0]?.id ?? null);
  const [current, setCurrent] = useState<PrestigeStore | null>(() => dm.prestiges[0] ?? null);
  const [markdown, setMarkdown] = useState<string>('');

  useEffect(() => {
    const dispose = autorun(() => {
      const hit = dm.prestiges.find((p) => p.id === currentId);

      setCurrent(hit ?? null);

      if (hit) {
        setMarkdown(
          [
            `### ${hit.name}`,
            '',
            `||${dm.allPlayers.map((c) => c.name).join('|')}|`,
            `|${range(dm.allPlayers.length + 1)
              .map(() => '---')
              .join('|')}|`,
            ...hit.factions.map(
              (f) =>
                `|${[
                  f.name,
                  ...dm.allPlayers.map((c) => hit.showPrestige(hit.getPrestige(f, c))),
                ].join('|')}|`
            ),
          ].join('\n')
        );
      }
    });

    return () => dispose();
  }, [currentId]);

  return (
    <>
      <Observer>
        {() => (
          <HStack mb="2">
            <Text>当前声望组</Text>
            <Select
              placeholder="无"
              options={dm.prestiges.map((p) => ({ value: p.id, text: p.name }))}
              value={currentId}
              onChange={(v) => setCurrentId(v)}
              buttonProps={{
                isDisabled: dm.prestiges.length === 0,
              }}
            />
            <Menu>
              <MenuButton as={IconButton} aria-label="添加声望组" icon={<FaPlus />} />
              <MenuList>
                <MenuItem
                  onClick={() => {
                    setCurrentId(dm.createPrestige('新默认声望组').id);
                  }}
                >
                  默认
                </MenuItem>
                {prestigeTemplates.map((pt) => (
                  <MenuItem
                    key={pt.name}
                    onClick={() => {
                      setCurrentId(dm.createPrestige(pt.name, pt).id);
                    }}
                  >
                    {pt.name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <IconButton
              aria-label="删除声望组"
              colorScheme="red"
              icon={<FaTrash />}
              isDisabled={!current}
              onClick={() => {
                if (current && confirm(`确认删除${current.name}? 删除后无法恢复.`)) {
                  dm.removePrestige(current);
                  setCurrentId(dm.prestiges[0]?.id ?? null);
                }
              }}
            />
          </HStack>
        )}
      </Observer>

      {current ? (
        <Tabs isLazy>
          <TabList>
            <Tab>声望</Tab>
            <Tab>配置</Tab>
            <Tab>Markdown</Tab>
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
                          {dm.allPlayers.map(({ id, name }) => (
                            <Th key={id} textAlign="center">
                              {name}
                            </Th>
                          ))}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {current.factions.map((f) => (
                          <Tr key={f.id}>
                            <Td>{f.name}</Td>
                            {dm.allPlayers.map((c) => {
                              const pId = `${f.id}:${c.id}`;
                              const p = current.prestiges.get(pId) || 0;
                              const [pl] = current.getPrestigeLevel(p);

                              let textColor = 'black';
                              if (pl) {
                                const index = current.levels.indexOf(pl);

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
                                      onClick={() => current.increasePresitge(f, c)}
                                    />
                                    <Text color={textColor}>{current.showPrestige(p)}</Text>
                                    <IconButton
                                      aria-label="减少声望"
                                      icon={<Icon as={FaMinus} />}
                                      size="xs"
                                      onClick={() => current.decreasePresitge(f, c)}
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
                  <Box w="50%">
                    <Box mb="2">
                      <FormControl mb="2">
                        <FormLabel>名称</FormLabel>
                        <Input
                          value={current.name}
                          onChange={(e) => {
                            current.name = e.target.value;
                          }}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>等级图标(emoji, 逗号隔开)</FormLabel>
                        <Input
                          value={current.indicators}
                          onChange={(e) => {
                            current.indicators = e.target.value;
                          }}
                        />
                      </FormControl>
                    </Box>
                    <HStack>
                      <Heading as="h4" fontSize="lg">
                        友好等级
                      </Heading>
                      <Button size="sm" onClick={() => current.addPrestigeLevel('新友好等级')}>
                        添加友好等级
                      </Button>
                    </HStack>
                    <Box pt="2">
                      {current.levels.map((l) => (
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
                            onClick={() => current.removePrestigeLevel(l)}
                          />
                        </HStack>
                      ))}
                    </Box>

                    <HStack>
                      <Heading as="h4" fontSize="lg">
                        派别
                      </Heading>
                      <Button size="sm" onClick={() => current.addPrestigeFaction('新派别')}>
                        添加派别
                      </Button>
                    </HStack>
                    <Box pt="2">
                      {current.factions.map((f) => (
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
                            onClick={() => current.removePrestigeFaction(f)}
                          />
                        </HStack>
                      ))}
                    </Box>
                  </Box>
                )}
              </Observer>
            </TabPanel>
            <TabPanel>
              <Textarea
                value={markdown}
                rows={10}
                isReadOnly
                onClick={(e) => {
                  (e.target as HTMLTextAreaElement).select();
                }}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : null}
    </>
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
