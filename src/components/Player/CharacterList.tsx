import { Observer } from 'mobx-react-lite';
import { FaDownload, FaRegTrashAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import {
  Box,
  Button,
  Divider,
  HStack,
  Heading,
  Icon,
  IconButton,
  LinkBox,
  LinkOverlay,
  Spacer,
  Text,
} from '@chakra-ui/react';

import { useStore } from '../../store';
import { Character } from '../../store/character';
import { download, stringToBlobUrl } from '../../utils/misc';
import { Bread, useBreadcrumb } from './Bread';
import { CharacterAsMarkdownModal } from './CharacterAsMarkdown';
import { ImportCharacter } from './ImportCharacter';

export function CharacterList(): JSX.Element {
  const store = useStore();

  useBreadcrumb('角色列表', '/player/list');

  return (
    <Box>
      <Bread />

      <Divider my="4" />

      <HStack mb="4">
        <Button as={Link} to="/player/create" colorScheme="teal">
          新建角色
        </Button>
        <ImportCharacter />
      </HStack>

      <Observer>
        {() => (
          <>
            {store.characters.map((c) => (
              <Box
                key={c.id}
                border="1px"
                borderColor="gray.200"
                boxShadow="sm"
                borderRadius="md"
                p="4"
                mb="4"
                transition="box-shadow .15s ease-in-out"
                _hover={{
                  boxShadow: 'md',
                }}
              >
                <HStack>
                  <LinkBox>
                    <LinkOverlay as={Link} to={`/player/character/${c.id}`}>
                      <HStack>
                        <Heading as="h3" fontSize="xl" color="teal">
                          {c.name}
                        </Heading>
                        <Text fontSize="md">
                          {c.race.name} {c.levelDetailForShow.join('/')}
                        </Text>
                      </HStack>
                    </LinkOverlay>
                  </LinkBox>
                  <Spacer />
                  <IconButton
                    aria-label="删除角色"
                    size="sm"
                    colorScheme="red"
                    icon={<Icon as={FaRegTrashAlt} />}
                    onClick={() => {
                      if (confirm('角色删除无法恢复, 确认删除吗?')) {
                        store.removeCharacter(c);
                      }
                    }}
                  />
                  <IconButton
                    aria-label="备份角色"
                    size="sm"
                    icon={<Icon as={FaDownload} />}
                    onClick={() => {
                      const exported = Character.stringify(c, 4);

                      download(stringToBlobUrl(exported), `${c.name}.json`);
                    }}
                  />
                  <CharacterAsMarkdownModal character={c} />
                </HStack>
              </Box>
            ))}
          </>
        )}
      </Observer>
    </Box>
  );
}
