import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';

interface Props {
  items: Array<{ text: string; link: string }>;
}

export default function Bread({ items }: Props): JSX.Element {
  return (
    <Breadcrumb spacing="8px" mb="4">
      <BreadcrumbItem>
        <BreadcrumbLink as={Link} to="/player">
          PC
        </BreadcrumbLink>
      </BreadcrumbItem>
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
