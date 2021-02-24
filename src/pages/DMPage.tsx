import { useState } from 'react';
import { Observer } from 'mobx-react-lite';
import { Button, Container, SimpleGrid, HStack, Spacer } from '@chakra-ui/react';

import { useStore } from '../store';
import { useIsSmallerScreen } from '../utils/react';

import DMCharacter from '../components/DM/Character';
import ButtonSwitch from '../components/ButtonSwitch';

export default function DMPage(): JSX.Element {
  const { dm } = useStore();
  const [order, setOrder] = useState('normal');
  const isSmallerScreen = useIsSmallerScreen();

  return (
    <Container>
      <HStack w="full">
        <Button
          onClick={() => {
            dm.addCharacter('无名氏');
          }}
        >
          添加人物
        </Button>
        <Button
          onClick={() => {
            dm.addCharacter('敌人');
          }}
        >
          添加敌人
        </Button>
        <Spacer />
        <Button onClick={() => dm.rollAllInitiative()}>全员投先攻</Button>
        <Button onClick={() => dm.healAll()}>全员恢复</Button>
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
