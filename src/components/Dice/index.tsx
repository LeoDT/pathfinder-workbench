import { Fragment, useRef, useState } from 'react';

import { Box, Button, useDisclosure } from '@chakra-ui/react';
import { Physics, usePlane } from '@react-three/cannon';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

import { makeD10, makeD12, makeD20, makeD4, makeD6, makeD8 } from './dices';

export function useAspect(width: number, height: number, factor = 1): [number, number, number] {
  const { viewport: v } = useThree();

  const adaptedHeight = height * (v.aspect > width / height ? v.width / width : v.height / height);
  const adaptedWidth = width * (v.aspect > width / height ? v.width / width : v.height / height);

  return [adaptedWidth * factor, adaptedHeight * factor, 1];
}

export function D4(): JSX.Element {
  const { geometry, materials, cannon } = makeD4(1, 'white', 'black');

  return (
    <mesh
      ref={cannon[0]}
      castShadow
      geometry={geometry}
      material={materials}
      position={[-15, 10, 0]}
    />
  );
}

export function D6(): JSX.Element {
  const { geometry, materials, cannon } = makeD6(2, 'white', 'black');

  return (
    <mesh
      ref={cannon[0]}
      castShadow
      geometry={geometry}
      material={materials}
      position={[-10, 10, 0]}
    />
  );
}

export function D8(): JSX.Element {
  const { geometry, materials, cannon } = makeD8(1.8, 'white', 'black');

  return (
    <mesh
      ref={cannon[0]}
      castShadow
      geometry={geometry}
      material={materials}
      position={[-5, 10, 0]}
    />
  );
}

export function D10(): JSX.Element {
  const { geometry, materials, cannon } = makeD10(1.6, 'white', 'black');

  return (
    <mesh
      ref={cannon[0]}
      castShadow
      geometry={geometry}
      material={materials}
      position={[0, 10, 0]}
    />
  );
}

export function D12(): JSX.Element {
  const { geometry, materials, cannon } = makeD12(0.9, 'white', 'black');

  return (
    <mesh
      ref={cannon[0]}
      castShadow
      geometry={geometry}
      material={materials}
      position={[5, 10, 0]}
    />
  );
}

export function D20(): JSX.Element {
  const { geometry, materials, cannon } = makeD20(0.9, 'white', 'black');

  return (
    <mesh
      ref={cannon[0]}
      castShadow
      geometry={geometry}
      material={materials}
      position={[10, 10, 0]}
    />
  );
}

function FloorAndWalls(): JSX.Element {
  const [w, h] = useAspect(window.innerWidth, window.innerHeight);
  const cw = w / 2;
  const ch = h / 2;
  const wallSize = Math.max(w, h);
  const halfWallSize = wallSize / 2;

  const [floorRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
  }));
  const [wallLeftRef] = usePlane(() => ({
    rotation: [0, Math.PI / 2, 0],
    position: [-cw, halfWallSize, 0],
  }));
  const [wallFrontRef] = usePlane(() => ({
    rotation: [0, 0, 0],
    position: [0, halfWallSize, -ch],
  }));
  const [wallRightRef] = usePlane(() => ({
    rotation: [0, -Math.PI / 2, 0],
    position: [cw, halfWallSize, 0],
  }));
  const [wallBackRef] = usePlane(() => ({
    rotation: [0, Math.PI, 0],
    position: [0, halfWallSize, ch],
  }));

  const opacity = 0;

  return (
    <>
      <mesh ref={floorRef} receiveShadow position={[0, 0, 0]} scale={[w, h, 1]}>
        <planeGeometry />
        <shadowMaterial opacity={0.6} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[w, h, 1]} position={[0, 0.1, 0]}>
        <planeGeometry />
        <meshBasicMaterial color="green" transparent opacity={opacity} />
      </mesh>

      <mesh ref={wallLeftRef} castShadow={false} scale={[h, wallSize, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="red" transparent opacity={opacity} />
      </mesh>

      <mesh ref={wallFrontRef} castShadow={false} scale={[wallSize, wallSize, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="red" transparent opacity={opacity} />
      </mesh>

      <mesh ref={wallRightRef} castShadow={false} scale={[h, wallSize, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="red" transparent opacity={opacity} />
      </mesh>

      <mesh ref={wallBackRef} castShadow={false} scale={[wallSize, wallSize, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="red" transparent opacity={opacity} />
      </mesh>

      <ambientLight color={0xf0f5fb} />
      <spotLight
        position={[-ch, h * 2, ch]}
        color={0xefdfd5}
        castShadow
        intensity={2}
        distance={150}
        decay={2}
      />
    </>
  );
}

export function DiceToggler(): JSX.Element {
  const { isOpen, onToggle } = useDisclosure();
  const [update, forceUpdate] = useState(1);

  return (
    <Box onClick={() => forceUpdate(update + 1)}>
      <Button size="sm" onClick={onToggle} position="relative" zIndex={9999}>
        Dice
      </Button>

      {isOpen ? (
        <Box position="fixed" left="0px" top="0px" w="full" h="full" zIndex={9998}>
          <Canvas camera={{ fov: 20, position: [0, 90, 0] }} shadows frameloop="demand">
            <OrbitControls enableRotate target={[0, 10, 0]} />
            <Physics
              allowSleep
              gravity={[0, -9.82 * 20, 0]}
              iterations={16}
              defaultContactMaterial={{
                friction: 0.01,
                restitution: 0.5,
              }}
            >
              <Fragment key={update}>
                <D4 />
                <D6 />
                <D8 />
                <D10 />
                <D12 />
                <D20 />
              </Fragment>
              <FloorAndWalls />
            </Physics>
          </Canvas>
        </Box>
      ) : null}
    </Box>
  );
}

export default DiceToggler;
