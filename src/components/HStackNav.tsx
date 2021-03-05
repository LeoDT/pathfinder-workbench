import { HStack, StackProps, Link, LinkProps } from '@chakra-ui/react';
import { Link as RouterLink, LinkProps as RouterLinkProps, useRouteMatch } from 'react-router-dom';

export function HStackNav({ children, ...props }: StackProps): JSX.Element {
  return (
    <HStack w="full" justify="stretch" align="stretch" spacing="0" {...props}>
      {children}
    </HStack>
  );
}

interface ItemProps
  extends LinkProps,
    Pick<RouterLinkProps, 'to' | 'component' | 'innerRef' | 'replace'> {
  to: string;
}

export function HStackNavItem({ to, children, ...props }: ItemProps): JSX.Element {
  const match = useRouteMatch(to);

  return (
    <Link
      as={RouterLink}
      to={to}
      px={['2', '4', '6']}
      py="2"
      border="1px"
      borderColor="gray.300"
      backgroundColor={match ? 'gray.10' : 'white'}
      textAlign="center"
      _notLast={{ borderRightColor: 'transparent' }}
      _first={{ borderStartRadius: 'md' }}
      _last={{ borderEndRadius: 'md' }}
      _hover={{ textDecoration: 'none', backgroundColor: 'gray.50' }}
      _focus={{ outline: 'none' }}
      flexGrow={1}
      transition="background-color .15s ease-in-out"
      {...props}
    >
      {children}
    </Link>
  );
}
