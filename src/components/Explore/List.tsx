import { useEffect, useState } from 'react';
import { Redirect, Link as RouterLink, Switch, useRouteMatch } from 'react-router-dom';

import { Box, Grid, GridItem, Link } from '@chakra-ui/react';

import { Collection } from '../../store/collection';
import { Class as ClassType } from '../../types/core';
import { Class } from '../Class';

export interface Props {
  collection: Collection;
}

export function List({ collection }: Props): JSX.Element {
  const match = useRouteMatch<{ id: string }>(`/explore/${collection.type}/:id`);
  const [current, setCurrent] = useState(() =>
    match?.params.id ? collection.getById(match?.params.id) : null
  );

  useEffect(() => {
    if (match?.params.id) {
      setCurrent(collection.getById(match?.params.id));
    }
  }, [match, collection]);

  let detail = null;
  switch (current?._type) {
    case 'class':
      detail = <Class clas={current as ClassType} />;
  }

  return (
    <>
      <Grid templateColumns="20% 80%" gap={2}>
        <GridItem>
          <Box pr="2" borderRight="1px" borderRightColor="gray.300">
            {collection.data.map((d) => (
              <Link
                as={RouterLink}
                display="block"
                key={d.id}
                fontSize="lg"
                px="2"
                py="1"
                my="1"
                cursor="pointer"
                backgroundColor={d === current ? 'gray.200' : 'transparent'}
                _hover={{ backgroundColor: 'gray.100' }}
                borderRadius="md"
                to={`/explore/${collection.type}/${d.id}`}
              >
                {d.name}
              </Link>
            ))}
          </Box>
        </GridItem>
        <GridItem>{detail}</GridItem>
      </Grid>

      <Switch>
        <Redirect
          exact
          push={false}
          from={`/explore/${collection.type}`}
          to={`/explore/${collection.type}/${collection.data[0].id}`}
        />
      </Switch>
    </>
  );
}
