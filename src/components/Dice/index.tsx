import { Body } from 'cannon-es';
import { range } from 'lodash-es';
import { Observer } from 'mobx-react-lite';
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { GiRollingDices } from 'react-icons/gi';

import {
  Box,
  Button,
  Center,
  HStack,
  Icon,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';

import { useStore } from '../../store';
import { DiceNotation, merge, parse } from '../../utils/dice';
import { DiceNotationInput } from './DiceNotationInput';
import { standardDiceSizes } from './dices';
import {
  DiceStore,
  DiceStoreContext,
  updateObject3DWithBody,
  useDice,
  useDiceStore,
} from './store';

export function useAspect(width: number, height: number, factor = 1): [number, number, number] {
  const { viewport: v } = useThree();

  const adaptedHeight = height * (v.aspect > width / height ? v.width / width : v.height / height);
  const adaptedWidth = width * (v.aspect > width / height ? v.width / width : v.height / height);

  return [adaptedWidth * factor, adaptedHeight * factor, 1];
}

function Dice({ notation }: { notation: DiceNotation }): JSX.Element {
  const [dice, ref] = useDice(notation, { size: standardDiceSizes[notation] });

  return <mesh ref={ref} castShadow geometry={dice.geometry} material={dice.materials} />;
}

function FloorAndWalls(): JSX.Element {
  const [w, h] = useAspect(window.innerWidth, window.innerHeight);
  const diceStore = useDiceStore();
  const wallSize = Math.max(w, h);

  const floorRef = useRef(null);
  const leftWallRef = useRef(null);
  const frontWallRef = useRef(null);
  const rightWallRef = useRef(null);
  const backWallRef = useRef(null);

  useEffect(() => {
    diceStore.updateFloorAndWalls(w, h);

    updateObject3DWithBody(floorRef.current, diceStore.floor);
    updateObject3DWithBody(leftWallRef.current, diceStore.walls[0]);
    updateObject3DWithBody(frontWallRef.current, diceStore.walls[1]);
    updateObject3DWithBody(rightWallRef.current, diceStore.walls[2]);
    updateObject3DWithBody(backWallRef.current, diceStore.walls[3]);
  }, [w, h]);

  const opacity = 0;

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]} scale={[w, h, 1]}>
        <planeGeometry />
        <shadowMaterial opacity={0.6} />
      </mesh>

      <mesh ref={floorRef} position={[0, 0, 0]} scale={[w, h, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="green" transparent opacity={opacity} />
      </mesh>

      <mesh ref={leftWallRef} castShadow={false} scale={[h, wallSize, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="red" transparent opacity={opacity} />
      </mesh>

      <mesh ref={frontWallRef} castShadow={false} scale={[wallSize, wallSize, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="red" transparent opacity={opacity} />
      </mesh>

      <mesh ref={rightWallRef} castShadow={false} scale={[h, wallSize, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="red" transparent opacity={opacity} />
      </mesh>

      <mesh ref={backWallRef} castShadow={false} scale={[wallSize, wallSize, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="red" transparent opacity={opacity} />
      </mesh>

      <ambientLight color={0xf0f5fb} />
      <spotLight
        position={[-h / 2, h * 2, h / 2]}
        color={0xefdfd5}
        castShadow
        intensity={2}
        distance={150}
        decay={2}
      />
    </>
  );
}

export function DiceBox({
  dices,
  onRolled,
}: {
  dices: Record<DiceNotation, number>;
  onRolled: (v: Record<DiceNotation, number[]>) => void;
}): JSX.Element {
  const [diceStore] = useState(() => new DiceStore());
  const { invalidate } = useThree();

  useLayoutEffect(() => {
    const dispose = diceStore.roll(
      () => {
        diceStore.dices.forEach((o, d) => {
          if (d.body.sleepState !== Body.SLEEPING) {
            updateObject3DWithBody(o, d.body);
          }
        });

        invalidate();
      },
      () => {
        const results = {} as Record<DiceNotation, number[]>;

        for (const [k, v] of diceStore.getDiceValues().entries()) {
          if (results[k.notation]) {
            results[k.notation].push(v + 1);
          } else {
            results[k.notation] = [v + 1];
          }
        }

        onRolled(results);
      }
    );

    return () => dispose();
  }, [diceStore, invalidate]);

  return (
    <DiceStoreContext.Provider value={diceStore}>
      <Fragment>
        {Object.entries(dices).map(([d, count]) => (
          <Fragment key={d}>
            {range(count).map((i) => (
              <Dice key={i} notation={d as DiceNotation} />
            ))}
          </Fragment>
        ))}
      </Fragment>
      <FloorAndWalls />
    </DiceStoreContext.Provider>
  );
}

export function DiceToggler(): JSX.Element {
  const { ui } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reroll, setReroll] = useState(1);
  const [dice, setDice] = useState('');
  const [rollResults, setRollResults] = useState<number[]>([]);
  const parsedDice = useMemo(() => merge(parse(dice)), [dice]);
  const dices = useMemo(() => {
    const dices = {} as Record<DiceNotation, number>;

    for (const d of parsedDice) {
      if (d.type === 'dice') {
        dices[d.die] = d.count;
      }
    }

    return dices;
  }, [parsedDice]);
  const onRolled = useCallback(
    (results: Record<DiceNotation, number[]>) => {
      const numbers: number[][] = [];

      for (const d of parsedDice) {
        if (d.type === 'dice') {
          const n = results[d.die];

          if (n) {
            numbers.push(d.multiplier === -1 ? n.map((i) => i * -1) : n);
          }
        }

        if (d.type === 'number') {
          numbers.push([d.value * d.multiplier]);
        }
      }

      setRollResults(numbers.flat());
    },
    [parsedDice]
  );
  const close = useCallback(() => {
    ui.closeRoll();
    setDice('');
    setRollResults([]);
    setReroll(1);
  }, []);

  return (
    <Box>
      <Popover placement="bottom-end" isLazy isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
        <PopoverTrigger>
          <IconButton
            aria-label="Roll"
            icon={<Icon as={GiRollingDices} width={6} height={6} />}
            size="sm"
          />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverBody>
            <DiceNotationInput
              onRoll={(d) => {
                setDice(d);

                onClose();
                ui.roll();
              }}
            />
          </PopoverBody>
        </PopoverContent>
      </Popover>

      <Observer>
        {() => (
          <>
            {ui.rollOpen ? (
              <Box
                key={reroll}
                position="fixed"
                left="0px"
                top="0px"
                w="full"
                h="full"
                backgroundColor="whiteAlpha.600"
                zIndex={9998}
              >
                {rollResults.length > 0 ? (
                  <Center position="absolute" left="0px" top="0px" w="full" h="full" zIndex={10000}>
                    <VStack>
                      <Text
                        fontSize="xx-large"
                        backgroundColor="blackAlpha.700"
                        color="white"
                        px="6"
                      >
                        {rollResults
                          .map((v, i) => {
                            if (i === 0) {
                              return v > 0 ? v : `- ${Math.abs(v)}`;
                            }

                            return `${v > 0 ? '+' : '-'} ${v}`;
                          })
                          .join(' ')}
                        {' = '}
                        {rollResults.reduce((a, r) => a + r, 0)}
                      </Text>

                      <HStack>
                        <Button
                          colorScheme="red"
                          onClick={() => {
                            setRollResults([]);
                            setReroll((r) => r + 1);
                          }}
                        >
                          重投
                        </Button>
                        <Button onClick={close}>OK</Button>
                      </HStack>
                    </VStack>
                  </Center>
                ) : null}
                <Canvas camera={{ fov: 12, position: [0, 90, 0] }} shadows frameloop="demand">
                  <DiceBox dices={dices} onRolled={onRolled} />
                </Canvas>
              </Box>
            ) : null}
          </>
        )}
      </Observer>
    </Box>
  );
}

export default DiceToggler;
