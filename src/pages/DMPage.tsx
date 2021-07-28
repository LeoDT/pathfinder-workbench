import { Observer } from 'mobx-react-lite';
import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

import {
  Button,
  ButtonGroup,
  Container,
  HStack,
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
  useDisclosure,
} from '@chakra-ui/react';

import { ButtonSwitch } from '../components/ButtonSwitch';
import { Character as DMCharacter } from '../components/DM/Character';
import { useStore } from '../store';
import { useIsSmallerScreen } from '../utils/react';

type Rolling = 'perception' | 'will';
const rollingTranslates = {
  perception: '察觉',
  will: '意志',
};

export function DMPage(): JSX.Element {
  const { dm } = useStore();
  const [order, setOrder] = useState('normal');
  const isSmallerScreen = useIsSmallerScreen();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rolling, setRolling] = useState<Rolling | null>(null);

  return (
    <Container pt="2">
      <HStack w="full" wrap="wrap" spacing={[0, 2]}>
        <Button
          mb={[2, 0]}
          mr={[2, 0]}
          onClick={() => {
            dm.addCharacter('无名氏');
          }}
        >
          添加人物
        </Button>
        <Button
          mb={[2, 0]}
          onClick={() => {
            dm.addCharacter('敌人');
          }}
        >
          添加敌人
        </Button>
        <Spacer />
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
        <ButtonSwitch
          options={[
            { text: '创建顺序', value: 'normal' },
            { text: '先攻顺序', value: 'initiative' },
          ]}
          value={order}
          onChange={(v) => setOrder(v)}
        />
      </HStack>

      <Observer>
        {() => (
          <SimpleGrid py="2" spacing="2" columns={isSmallerScreen ? 1 : 3}>
            {(order === 'initiative' ? dm.sortedCharacters : dm.characters).map((c) => (
              <DMCharacter key={c.id} character={c} />
            ))}
          </SimpleGrid>
        )}
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
                    {[...dm.characters]
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
