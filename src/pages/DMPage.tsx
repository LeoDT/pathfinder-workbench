import { useState } from 'react';
import { Observer } from 'mobx-react-lite';
import { Button, Container, SimpleGrid, HStack, Spacer } from '@chakra-ui/react';

import { useStore } from '../store';

import DMCharacter from '../components/DM/Character';
import { useIsSmallerScreen } from '../utils/react';

export default function DMPage(): JSX.Element {
  const { dm } = useStore();
  const [battleView, setBattleView] = useState(false);
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
        <Button colorScheme="teal" onClick={() => setBattleView(!battleView)}>
          {battleView ? '一般排序' : '先攻排序'}
        </Button>
      </HStack>

      <Observer>
        {() => (
          <SimpleGrid py="2" spacing="2" columns={isSmallerScreen ? 1 : 3}>
            {(battleView ? dm.sortedCharacters : dm.characters).map((c) => (
              <DMCharacter key={c.id} character={c} />
            ))}
          </SimpleGrid>
        )}
      </Observer>
    </Container>
  );
}
