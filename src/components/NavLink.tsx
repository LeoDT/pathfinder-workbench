import { useTheme } from '@chakra-ui/react';
import { NavLink as RouterNavLink } from 'react-router-dom';

interface Props extends React.DOMAttributes<HTMLAnchorElement> {
  to: string;
  children: JSX.Element | string;
}

export default function NavLink({ to, children, onClick }: Props): JSX.Element {
  const theme = useTheme();

  return (
    <RouterNavLink to={to} activeStyle={{ color: theme.colors.teal[400] }} onClick={onClick}>
      {children}
    </RouterNavLink>
  );
}
