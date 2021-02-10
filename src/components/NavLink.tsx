import { useTheme } from '@chakra-ui/react';
import { NavLink as RouterNavLink } from 'react-router-dom';

interface Props {
  to: string;
  children: JSX.Element | string;
}

export default function NavLink({ to, children }: Props): JSX.Element {
  const theme = useTheme();

  return (
    <RouterNavLink to={to} activeStyle={{ color: theme.colors.teal[400] }}>
      {children}
    </RouterNavLink>
  );
}
