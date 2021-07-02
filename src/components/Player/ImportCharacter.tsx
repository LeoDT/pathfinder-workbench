import { useCallback, useEffect, useRef, useState } from 'react';
import shortid from 'shortid';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';

import { useStore } from '../../store';
import { Character } from '../../store/character';
import { readFileAsString } from '../../utils/misc';

export function ImportCharacter(): JSX.Element {
  const store = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const loadJSON = useCallback((s) => {
    try {
      const c = Character.parse(s, shortid());
      setError(null);
      setCharacter(c);
    } catch (e) {
      setError(e);
      setCharacter(null);
    }
  }, []);

  useEffect(() => {
    if (file) {
      readFileAsString(file).then((s) => {
        loadJSON(s);
      });
    }
  }, [file]);

  useEffect(() => {
    if (text) {
      loadJSON(text);
    }
  }, [text]);

  useEffect(() => {
    setError(null);
    setFile(null);
    setText('');
    setCharacter(null);
  }, [isOpen]);

  return (
    <>
      <Button onClick={onOpen}>导入角色</Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>导入角色</ModalHeader>
          <ModalBody>
            <Tabs>
              <TabList>
                <Tab>文件</Tab>
                <Tab>粘贴</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <HStack>
                    <Box pos="relative">
                      <Button onClick={() => inputRef.current?.click()}>选择文件</Button>
                      <Input
                        type="file"
                        visibility="hidden"
                        ref={inputRef}
                        accept="application/json"
                        pos="absolute"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setFile(file);

                          if (inputRef.current) {
                            inputRef.current.value = '';
                          }
                        }}
                      />
                    </Box>
                    {file ? <Text>{file.name}</Text> : null}
                  </HStack>
                </TabPanel>
                <TabPanel>
                  <Textarea onChange={(e) => setText(e.target.value)} />
                </TabPanel>
              </TabPanels>
            </Tabs>

            {error ? (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle mr={2}>导入错误</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            ) : null}

            {character ? (
              <Text fontSize="md">
                {character.name} {character.race.name} {character.levelDetailForShow.join('/')}
              </Text>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              isDisabled={!character}
              onClick={() => {
                if (character) {
                  store.characters.push(character);
                  onClose();
                }
              }}
            >
              导入
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
