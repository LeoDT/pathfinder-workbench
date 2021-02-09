import {
  Drawer,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  useDisclosure,
} from '@chakra-ui/react';

import QuickSearch from './QuickSearch';

interface Props {
  children: JSX.Element;
}

export default function QuickSearchToggler({ children }: Props): JSX.Element {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Drawer isOpen={isOpen} onClose={onClose} size="lg">
        <DrawerOverlay>
          <DrawerContent>
            <DrawerHeader>Quick Search</DrawerHeader>
            <DrawerBody d="flex" flexDir="column">
              <QuickSearch />
            </DrawerBody>
            <DrawerCloseButton />
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  );
}
