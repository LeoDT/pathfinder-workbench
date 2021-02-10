import { Box, Heading, Container, Flex, Spacer, IconButton } from '@chakra-ui/react';
import { Search2Icon } from '@chakra-ui/icons';

import QuickSearchToggler from './QuickSearchToggler';
import NavLink from './NavLink';

export default function Navbar(): JSX.Element {
  return (
    <Box bg="white" borderBottom="1px" borderColor="gray.300" py={3}>
      <Container>
        <Flex alignItems="center">
          <Heading as="h1" fontSize="initial" mr="8">
            Pathfinder Workbench
          </Heading>
          <NavLink to="/player">Player</NavLink>
          <Spacer />
          <QuickSearchToggler>
            <IconButton aria-label="Quick Search" size="sm" icon={<Search2Icon />} />
          </QuickSearchToggler>
        </Flex>
      </Container>
    </Box>
  );
}
