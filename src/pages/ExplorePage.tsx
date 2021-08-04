import { ComponentType, createElement, useState } from 'react';
import { useEffect } from 'react';
import { FaCheck, FaChevronDown } from 'react-icons/fa';
import { Redirect, Switch, useHistory, useRouteMatch } from 'react-router-dom';

import {
  Box,
  Container,
  Heading,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';

import { List, Props as ListProps } from '../components/Explore/List';
import { ExploreFilter, Search, Props as SearchProps } from '../components/Explore/Search';
import { MultipleSelect } from '../components/Select';
import { useStore } from '../store';
import { Collection } from '../store/collection/base';
import { Class as ClassType, Spell as SpellType } from '../types/core';

interface ExploreCollection {
  name: string;
  collection: Collection;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Omit<ListProps, 'collection'> | Omit<SearchProps, 'collection'>;
}

export function ExplorePage(): JSX.Element {
  const { collections } = useStore();
  const history = useHistory();
  const match = useRouteMatch<{ col: string }>('/explore/:col');
  const [menus] = useState<ExploreCollection[]>(() => [
    { name: '职业', collection: collections.class, component: List },
    {
      name: '法术',
      collection: collections.spell,
      component: Search,
      props: {
        filters: [
          {
            id: 'class',
            filter: (d, f) =>
              d.filter((s) => f.some((c) => s.meta.level.includes(c.toLowerCase()))),
            render(value, onChange) {
              return (
                <MultipleSelect
                  buttonProps={{ children: '职业' }}
                  min={0}
                  value={value ?? []}
                  onChange={onChange}
                  options={collections.class.data
                    .filter((c) => collections.spell.SPELL_BY_CLASS_LEVEL[c.id.toLowerCase()])
                    .map((s) => ({ value: s.id, text: s.name }))}
                />
              );
            },
            display: (v) => `职业: ${v.map((id) => collections.class.getById(id).name).join(', ')}`,
          } as ExploreFilter<SpellType, string[]>,
          {
            id: 'school',
            filter: (d, f) =>
              d.filter((s) => f.map((s) => s.toLowerCase()).includes(s.meta.school)),
            render(value, onChange) {
              return (
                <MultipleSelect
                  buttonProps={{ children: '学派' }}
                  min={0}
                  value={value ?? []}
                  onChange={onChange}
                  options={collections.arcaneSchool.data
                    .filter((s) => s.type === 'standard')
                    .map((s) => ({ value: s.id, text: s.name }))}
                />
              );
            },
            display: (v) =>
              `学派: ${v.map((id) => collections.arcaneSchool.getById(id).name).join(', ')}`,
          } as ExploreFilter<SpellType, string[]>,
        ],
      },
    },
  ]);
  const [current, setCurrent] = useState<ExploreCollection | null>(null);

  useEffect(() => {
    if (match?.params.col && match?.params.col !== current?.collection.type) {
      const hit = menus.find((ec) => ec.collection.type === match.params.col);

      if (hit && hit !== current) {
        setCurrent(hit);
      }
    }
  }, [current, match]);

  return (
    <Container py="4" px={['2', '0']}>
      <Menu isLazy>
        <MenuButton
          as={Box}
          cursor="pointer"
          _hover={{ backgroundColor: 'gray.100' }}
          display="inline-block"
          px="2"
        >
          <Heading as="span" fontSize="large" fontWeight="bold">
            {current?.name}
            <Icon as={FaChevronDown} w={5} h={5} ml="2" />
          </Heading>
        </MenuButton>
        <MenuList>
          {menus.map((ec) => (
            <MenuItem key={ec.name} onClick={() => history.push(`/explore/${ec.collection.type}`)}>
              {ec === current ? <Icon as={FaCheck} mr="2" w={4} h={4} /> : null}
              {ec.name}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      {current ? (
        <Box p="2" mt="2" borderTop="1px" borderTopColor="gray.300">
          {createElement(current.component, {
            collection: current.collection,
            ...current.props,
          })}
        </Box>
      ) : null}

      <Switch>
        <Redirect exact push={false} from="/explore" to={`/explore/${menus[0].collection.type}`} />
      </Switch>
    </Container>
  );
}
