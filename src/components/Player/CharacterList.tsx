import {
  Box,
  LinkBox,
  Heading,
  Button,
  Divider,
  LinkOverlay,
  Text,
  HStack,
} from '@chakra-ui/react';
import { Observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';

import { useStore } from '../../store';

import Bread from './Bread';

export default function CharacterList(): JSX.Element {
  const store = useStore();

  return (
    <Box>
      <Bread items={[{ text: '角色列表', link: '/player/list' }]} />

      <Divider my="4" />

      <Button as={Link} to="/player/create" colorScheme="teal" mb="4">
        新建角色
      </Button>

      <Observer>
        {() => (
          <>
            {store.characters.map((c) => (
              <LinkBox
                key={c.id}
                border="1px"
                borderColor="gray.200"
                boxShadow="sm"
                borderRadius="md"
                p="4"
                transition="box-shadow .15s ease-in-out"
                _hover={{
                  boxShadow: 'md',
                }}
              >
                <LinkOverlay as={Link} to={`/player/${c.id}/basic`}>
                  <HStack>
                    <Heading as="h3" fontSize="xl">
                      {c.name}
                    </Heading>
                    <Text fontSize="md">
                      {c.race.name}{' '}
                      {Object.keys(c.levelDetail)
                        .map((cId) => {
                          const clas = store.collections.class.getById(cId);
                          const level = c.levelDetail[cId];

                          return `${level}级${clas.name}`;
                        })
                        .join('/')}
                    </Text>
                  </HStack>
                </LinkOverlay>
              </LinkBox>
            ))}
          </>
        )}
      </Observer>
    </Box>
  );
}
