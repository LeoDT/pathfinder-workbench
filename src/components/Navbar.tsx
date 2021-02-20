import { Box, Container, Heading, Flex, Spacer, IconButton, HStack } from '@chakra-ui/react';
import { Search2Icon } from '@chakra-ui/icons';
import { GiAncientSword } from 'react-icons/gi';

import QuickSearchToggler from './QuickSearchToggler';
import NavLink from './NavLink';

export default function Navbar(): JSX.Element {
  return (
    <Box bg="white" borderBottom="1px" borderColor="gray.300" py={3}>
      <Container>
        <Flex alignItems="center">
          <HStack mr="8" color="gray.700">
            <GiAncientSword size={28} />
            <Heading as="h1" fontSize="large">
              PFWB
            </Heading>
          </HStack>
          <HStack>
            <NavLink to="/player">Player</NavLink>
            <NavLink to="/dm">DM</NavLink>
          </HStack>
          <Spacer />
          <QuickSearchToggler>
            <IconButton aria-label="Quick Search" size="sm" icon={<Search2Icon />} />
          </QuickSearchToggler>
        </Flex>
      </Container>
    </Box>
  );
}
