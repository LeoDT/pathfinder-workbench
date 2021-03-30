import { orderBy } from 'lodash-es';
import { useCallback, useEffect, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbProps } from '@chakra-ui/react';

import { createContextNoNullCheck } from '../../utils/react';

type Props = BreadcrumbProps;

export default function Bread(props: Props): JSX.Element {
  const { items } = useBreadcrumbManager();

  return (
    <Breadcrumb spacing="8px" {...props}>
      {items.map((i) => (
        <BreadcrumbItem key={i.link}>
          <BreadcrumbLink as={Link} to={i.link}>
            {i.text}
          </BreadcrumbLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}

interface BreadcrumbItemType {
  text: string;
  link: string;
}

interface BreadcrumbManager {
  items: BreadcrumbItemType[];
  add: (link: string, text: string) => void;
  remove: (link: string, text: string) => void;
}

function breadcrumbsReducer(
  state: BreadcrumbItemType[],
  action: { type: 'add' | 'remove'; link: string; text: string }
) {
  const { link, text } = action;

  switch (action.type) {
    case 'add': {
      if (state.find((i) => i.link === link)) {
        return state;
      }

      // order by slash count
      return orderBy([...state, { link, text }], ({ link }) => link.split('/').length, 'asc');
    }

    case 'remove':
      return state.filter((i) => i.link !== link);

    default:
      return state;
  }
}

export function useBreadcrumbs(initialState: BreadcrumbItemType[]): BreadcrumbManager {
  const [items, dispatch] = useReducer(breadcrumbsReducer, initialState);
  const add = useCallback((link: string, text: string) => {
    dispatch({ type: 'add', link, text });
  }, []);
  const remove = useCallback((link: string, text: string) => {
    dispatch({ type: 'remove', link, text });
  }, []);

  return {
    items,
    add,
    remove,
  };
}

export function useBreadcrumb(text: string, link: string): void {
  const manager = useBreadcrumbManager();

  useEffect(() => {
    manager.add(link, text);

    return () => {
      manager.remove(link, text);
    };
  }, [text, link]);
}

export const [
  useBreadcrumbManager,
  BreadcrumbManagerContext,
] = createContextNoNullCheck<BreadcrumbManager>();
