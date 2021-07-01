import { Link as RouterLink, LinkProps as RouterLinkProps, useRouteMatch } from 'react-router-dom';

import { Link, LinkProps } from '@chakra-ui/react';

interface Props
  extends LinkProps,
    Pick<RouterLinkProps, 'to' | 'component' | 'innerRef' | 'replace'> {
  to: string;
}

export function NavLink({ to, ...props }: Props): JSX.Element {
  const match = useRouteMatch(to);

  return <Link as={RouterLink} color={match ? 'teal.400' : 'black'} to={to} {...props} />;
}
