import { Observer } from 'mobx-react-lite';
import { FaRegTrashAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import {
  Box,
  Button,
  Divider,
  HStack,
  Heading,
  Icon,
  LinkBox,
  LinkOverlay,
  Spacer,
  Text,
} from '@chakra-ui/react';

import { useStore } from '../../store';
import Bread, { useBreadcrumb } from './Bread';

export default function CharacterList(): JSX.Element {
  const store = useStore();

  useBreadcrumb('角色列表', '/player/list');

  return (
    <Box>
      <Bread />

      <Divider my="4" />

      <Button as={Link} to="/player/create" colorScheme="teal" mb="4">
        新建角色
      </Button>

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
                  <Icon
                    as={FaRegTrashAlt}
                    color="red.500"
                    _hover={{ color: 'red.600' }}
                    width="4"
                    height="4"
                    cursor="pointer"
                    onClick={() => {
                      if (confirm('角色删除无法恢复, 确认删除吗?')) {
                        store.removeCharacter(c);
                      }
                    }}
                  />
                </HStack>
              </Box>
            ))}
          </>
        )}
      </Observer>
    </Box>
  );
}
