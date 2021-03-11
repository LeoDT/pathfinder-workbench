import { useState } from 'react';
import { Observer } from 'mobx-react-lite';
import {
  Button,
  ButtonGroup,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Container,
  SimpleGrid,
  HStack,
  Spacer,
} from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa';

import { useStore } from '../store';
import { useIsSmallerScreen } from '../utils/react';

import DMCharacter from '../components/DM/Character';
import ButtonSwitch from '../components/ButtonSwitch';

export default function DMPage(): JSX.Element {
  const { dm } = useStore();
  const [order, setOrder] = useState('normal');
  const isSmallerScreen = useIsSmallerScreen();

  return (
    <Container pt="2">
      <HStack w="full" wrap="wrap" spacing={[0, 2]}>
        <Button
          mb={[2, 0]}
          mr={[2, 0]}
          onClick={() => {
            dm.addCharacter('无名氏');
          }}
        >
          添加人物
        </Button>
        <Button
          mb={[2, 0]}
          onClick={() => {
            dm.addCharacter('敌人');
          }}
        >
          添加敌人
        </Button>
        <Spacer />
        <ButtonGroup isAttached mb={[2, 0]}>
          <Button onClick={() => dm.rollAllInitiative()}>全员投先攻</Button>
          <Menu placement="bottom-end">
            <MenuButton as={IconButton} icon={<FaChevronDown />} aria-label="More Action" />
            <MenuList>
              <MenuItem onClick={() => dm.rollAllPerception()}>全员投察觉</MenuItem>
              <MenuItem onClick={() => dm.rollAllSenseMotive()}>全员投察言观色</MenuItem>
              <MenuItem onClick={() => dm.rollAllWillSave()}>全员投意志</MenuItem>
              <MenuItem onClick={() => dm.healAll()}>全员恢复</MenuItem>
              <MenuItem onClick={() => dm.recoverAllTracker()}>全员恢复Tracker</MenuItem>
              <MenuItem onClick={() => dm.recoverAllAttunment()}>全员恢复消耗品同调</MenuItem>
            </MenuList>
          </Menu>
        </ButtonGroup>
        <ButtonSwitch
          options={[
            { text: '创建顺序', value: 'normal' },
            { text: '先攻顺序', value: 'initiative' },
          ]}
          value={order}
          onChange={(v) => setOrder(v)}
        />
      </HStack>

      <Observer>
        {() => (
          <SimpleGrid py="2" spacing="2" columns={isSmallerScreen ? 1 : 3}>
            {(order === 'initiative' ? dm.sortedCharacters : dm.characters).map((c) => (
              <DMCharacter key={c.id} character={c} />
            ))}
          </SimpleGrid>
        )}
      </Observer>
    </Container>
  );
}
