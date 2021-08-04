import { isEmpty } from 'lodash-es';
import { autorun, observable } from 'mobx';
import { Observer } from 'mobx-react-lite';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useRouteMatch } from 'react-router-dom';
import { FixedSizeList } from 'react-window';

import { Box, Grid, GridItem, HStack, Link, Tag } from '@chakra-ui/react';

import { Collection } from '../../store/collection';
import { Entity, Spell as SpellType } from '../../types/core';
import { Spell } from '../Spell';

export interface ExploreFilter<T = Entity, V = string> {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: (data: Array<T>, filterValue: V, filterValues: Record<string, any>) => Array<T>;
  render: (value: V, onChange: (v: V) => void) => ReactNode;
  display: (value: V) => ReactNode;
}

export interface Props {
  collection: Collection;
  filters: ExploreFilter[];
}

export function Search({ collection, filters }: Props): JSX.Element {
  const match = useRouteMatch<{ id: string }>(`/explore/${collection.type}/:id`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [filterValues] = useState(() => observable<Record<string, any>>({}));
  const [data, setData] = useState(collection.data);
  const calculateData = useCallback(() => {
    setData(
      filters.reduce((d, { id, filter }) => {
        return filterValues[id] ? filter(d, filterValues[id], filterValues) : d;
      }, collection.data)
    );
  }, [collection, filters]);
  const child = useMemo(() => {
    if (match?.params.id) {
      const e = collection.getById(match.params.id);

      switch (e._type) {
        case 'spell':
          return <Spell spell={e as SpellType} showId />;
      }
    }

    return null;
  }, [match]);

  useEffect(() => {
    const dispose = autorun(() => {
      calculateData();
    });

    return () => dispose();
  }, [collection, filters]);

  return (
    <>
      <Observer>
        {() => (
          <>
            <HStack mb="2">
              {filters.map(({ render, id }) => (
                <Box key={id}>
                  {render(filterValues[id], (v) => {
                    if (isEmpty(v)) {
                      delete filterValues[id];
                    } else {
                      filterValues[id] = v;
                    }
                  })}
                </Box>
              ))}
            </HStack>
            {Object.entries(filterValues).length ? (
              <HStack my="2">
                {Object.entries(filterValues).map(([k, v]) => {
                  const f = filters.find(({ id }) => id === k);

                  if (f) {
                    return <Tag key={k}>{f.display(v)}</Tag>;
                  }

                  return null;
                })}
              </HStack>
            ) : null}
          </>
        )}
      </Observer>
      <Grid templateColumns="20% 80%" borderTop="1px" borderTopColor="gray.300" pt="2" gap={2}>
        <GridItem borderRight="1px" borderRightColor="gray.300">
          <FixedSizeList
            itemData={data}
            itemCount={data.length}
            height={400}
            width="100%"
            itemSize={32}
          >
            {({ index, style }) => (
              <Box pr="2" style={style}>
                <Link
                  as={RouterLink}
                  lineHeight="32px"
                  display="block"
                  fontSize="lg"
                  px="2"
                  my="1"
                  cursor="pointer"
                  _hover={{ backgroundColor: 'gray.100' }}
                  borderRadius="md"
                  to={`/explore/${collection.type}/${data[index].id}`}
                >
                  {data[index].name}
                </Link>
              </Box>
            )}
          </FixedSizeList>
        </GridItem>
        <GridItem>{child}</GridItem>
      </Grid>
    </>
  );
}
