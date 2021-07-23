import { omit } from 'lodash-es';
import { autorun } from 'mobx';
import { Observer } from 'mobx-react-lite';
import { useCallback, useState } from 'react';
import { useEffect } from 'react';
import { FaWifi } from 'react-icons/fa';

import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

import { useStore } from '../store';
import { NetworkStore } from '../store/network';

export function Network(): JSX.Element {
  const store = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [server, setServer] = useState('ws://localhost:9456');
  const [network, setNetwork] = useState<NetworkStore | null>(null);
  const connect = useCallback((server: string) => {
    const n = new NetworkStore(server);

    setNetwork(n);
    n.connect();
  }, []);

  useEffect(() => {
    if (network) {
      const dispose = autorun(() => {
        network.receivedCharacters.forEach((rc) => {
          const inDM = store.dm.characters.find((c) => c.syncId === rc.id);

          if (inDM) {
            Object.assign(inDM, omit(rc, 'id'));
          } else {
            store.dm.addCharacter(rc.name, {
              syncId: rc.id,
              ...omit(rc, 'id', 'name'),
            });
          }
        });
      });

      return () => dispose();
    }
  }, [network]);

  return (
    <>
      <Observer>
        {() => (
          <IconButton
            size="sm"
            aria-label="网络功能"
            icon={<Icon as={FaWifi} />}
            onClick={() => onOpen()}
            colorScheme={network?.connect ? 'green' : 'gray'}
          />
        )}
      </Observer>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>
            <Flex>
              <Box>网络功能</Box>
              <Observer>
                {() => (
                  <Box ml="auto">
                    {network?.connected ? (
                      <Badge colorScheme="green" textTransform="none">
                        已连接: {network.signalingServer}, {network.peers.size + 1} 人在线
                      </Badge>
                    ) : (
                      <Badge colorScheme="gray">未连接</Badge>
                    )}
                  </Box>
                )}
              </Observer>
            </Flex>
          </ModalHeader>
          <ModalBody>
            <InputGroup>
              <Input
                placeholder="ws://192.168.x.x:9456"
                value={server}
                onChange={(e) => setServer(e.target.value)}
              />
              <InputRightElement w="16">
                <Button
                  onClick={() => {
                    connect(server);
                  }}
                  size="sm"
                  colorScheme="teal"
                >
                  连接
                </Button>
              </InputRightElement>
            </InputGroup>

            <Observer>
              {() => {
                if (!network) return null;

                return (
                  <Box mt="2">
                    <Flex alignItems="center">
                      <Text>选择需要共享的角色</Text>
                      <Button
                        onClick={() => network.broadcastSharedCharacters()}
                        size="sm"
                        ml="auto"
                      >
                        重新发送
                      </Button>
                    </Flex>

                    {store.characters.map((c) => (
                      <HStack key={c.id} my="2">
                        <Switch
                          isChecked={network.sharingCharacters.includes(c)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              network.sharingCharacters.push(c);
                            } else {
                              network.sharingCharacters.remove(c);
                            }
                          }}
                        />
                        <Heading as="h4" fontSize="lg" color="teal">
                          {c.name}
                        </Heading>
                        <Text fontSize="sm" ml="2">
                          {c.race.name} {c.levelDetailForShow.join('/')}
                        </Text>
                      </HStack>
                    ))}
                  </Box>
                );
              }}
            </Observer>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => onClose()}>关闭</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
