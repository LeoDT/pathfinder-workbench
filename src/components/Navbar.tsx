import { GiAncientSword } from 'react-icons/gi';

import { Search2Icon } from '@chakra-ui/icons';
import { Box, Container, Flex, HStack, Heading, Icon, IconButton, Spacer } from '@chakra-ui/react';

import { NavLink } from './NavLink';
import { Network } from './Network';
import { QuickSearchToggler } from './QuickSearchToggler';

export function Navbar(): JSX.Element {
  return (
    <Box bg="white" borderBottom="1px" borderColor="gray.300" py={3}>
      <Container px={['2', '0']}>
        <Flex alignItems="center">
          <HStack mr="8" color="gray.700">
            <Icon as={GiAncientSword} h="28px" w="28px" />
            <Heading as="h1" fontSize="large">
              PFWB
            </Heading>
          </HStack>
          <HStack>
            <NavLink to="/player">PC</NavLink>
            <NavLink to="/dm">DM</NavLink>
          </HStack>
          <Spacer />
          <HStack>
            <Network />
            <QuickSearchToggler>
              <IconButton aria-label="Quick Search" size="sm" icon={<Search2Icon />} />
            </QuickSearchToggler>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
