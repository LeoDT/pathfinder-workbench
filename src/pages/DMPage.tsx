import { Observer } from 'mobx-react-lite';
import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

import {
  Box,
  Button,
  ButtonGroup,
  Container,
  HStack,
  Heading,
  IconButton,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  Portal,
  SimpleGrid,
  Spacer,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';

import { Battle } from '../components/Battle';
import { Character as DMCharacter } from '../components/DM/Character';
import { PrestigeModal } from '../components/DM/Prestige';
import { useStore } from '../store';
import { useIsSmallerScreen } from '../utils/react';

type Rolling = 'perception' | 'will';
const rollingTranslates = {
  perception: '察觉',
  will: '意志',
};

export function DMPage(): JSX.Element {
  const { dm } = useStore();
  const isSmallerScreen = useIsSmallerScreen();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rolling, setRolling] = useState<Rolling | null>(null);
  const { isOpen: isBattleViewOpen, onToggle: onBattleViewToggle } = useDisclosure();

  return (
    <Container pt="2">
      <HStack w="full" wrap="wrap" spacing={[0, 2]}>
        <Button
          mb={[2, 0]}
          mr={[2, 0]}
          onClick={() => {
            dm.addCharacter('player', '无名氏');
          }}
        >
          添加PC
        </Button>
        <Button
          mb={[2, 0]}
          onClick={() => {
            dm.addCharacter('npc', 'NPC');
          }}
        >
          添加NPC
        </Button>
        <Button
          mb={[2, 0]}
          onClick={() => {
            dm.addCharacter('enemy', '敌人');
          }}
        >
          添加敌人
        </Button>
        <Spacer />
        <PrestigeModal />
        <ButtonGroup isAttached mb={[2, 0]}>
          <Button onClick={() => dm.rollAllInitiative()}>全员投先攻</Button>
          <Menu placement="bottom-end" isLazy>
            <MenuButton as={IconButton} icon={<FaChevronDown />} aria-label="More Action" />
            <Portal>
              <MenuList>
                <MenuItem
                  onClick={() => {
                    dm.rollAllPerception();
                    setRolling('perception');
                    onOpen();
                  }}
                >
                  全员投察觉
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    dm.rollAllWillSave();
                    setRolling('will');
                    onOpen();
                  }}
                >
                  全员投意志
                </MenuItem>
                <MenuItem onClick={() => dm.healAll()}>全员恢复</MenuItem>
                <MenuItem onClick={() => dm.recoverAllTracker()}>全员恢复Tracker</MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        </ButtonGroup>
        <Observer>
          {() => (
            <Button
              colorScheme={dm.inBattle ? 'red' : 'teal'}
              onClick={() => (dm.inBattle ? dm.endBattle() : dm.startBattle())}
            >
              {dm.inBattle ? '结束战斗' : '开始战斗'}
            </Button>
          )}
        </Observer>
        <Button onClick={onBattleViewToggle}>战场</Button>
      </HStack>

      {isBattleViewOpen ? (
        <Box mt="2">
          <Battle />
        </Box>
      ) : null}

      <Observer>
        {() => (
          <SimpleGrid mt="2" spacing="2" columns={isSmallerScreen ? 1 : 3}>
            {(dm.inBattle ? dm.battleSortedCharacters : dm.enabledCharacters).map((c, i) => (
              <Box key={c.id} position="relative">
                {dm.inBattle ? (
                  <Box className="order-tools" position="absolute" top="8px" right="4px">
                    {dm.changingOrder ? (
                      dm.changingOrder === c ? (
                        <Button size="xs" onClick={() => (dm.changingOrder = null)}>
                          取消
                        </Button>
                      ) : (
                        <VStack>
                          <Button size="xs" onClick={() => dm.endChangeBattleOrder(i)}>
                            之前
                          </Button>
                          <Button size="xs" onClick={() => dm.endChangeBattleOrder(i + 1)}>
                            之后
                          </Button>
                        </VStack>
                      )
                    ) : (
                      <Button size="xs" onClick={() => dm.startChangeBattleOrder(c)}>
                        延后
                      </Button>
                    )}
                  </Box>
                ) : null}

                <DMCharacter character={c} />
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Observer>

      <Observer>
        {() =>
          dm.disabledCharacters.length > 0 ? (
            <>
              <Heading as="h3" fontSize="xl" mt="4">
                隐藏的人物
              </Heading>
              <SimpleGrid py="2" spacing="2" columns={isSmallerScreen ? 1 : 3}>
                {dm.disabledCharacters.map((c) => (
                  <DMCharacter key={c.id} character={c} />
                ))}
              </SimpleGrid>
            </>
          ) : null
        }
      </Observer>

      {rolling ? (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>投{rollingTranslates[rolling]}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Observer>
                {() => (
                  <OrderedList fontSize="lg">
                    {[...dm.enabledCharacters]
                      .sort((a, b) => {
                        let aa = 0;
                        let bb = 0;
                        switch (rolling) {
                          case 'perception':
                            aa = dm.getFinalPerception(a);
                            bb = dm.getFinalPerception(b);
                            break;
                          case 'will':
                            aa = dm.getFinalWillSave(a);
                            bb = dm.getFinalWillSave(b);
                            break;
                        }

                        return bb - aa;
                      })
                      .map((c) => {
                        let value = 0;
                        let o = '0';
                        let r = 0;

                        switch (rolling) {
                          case 'perception':
                            value = dm.getFinalPerception(c);
                            o = c.perception;
                            r = c.rolledPerception;
                            break;
                          case 'will':
                            value = dm.getFinalWillSave(c);
                            o = c.willSave;
                            r = c.rolledWillSave;
                            break;
                        }

                        return (
                          <ListItem key={c.id}>
                            <Text>
                              {c.name}: {value}({o} + {r})
                            </Text>
                          </ListItem>
                        );
                      })}
                  </OrderedList>
                )}
              </Observer>
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={() => {
                  switch (rolling) {
                    case 'perception':
                      dm.rollAllPerception();
                      break;
                    case 'will':
                      dm.rollAllWillSave();
                  }
                }}
              >
                重投
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : null}
    </Container>
  );
}
