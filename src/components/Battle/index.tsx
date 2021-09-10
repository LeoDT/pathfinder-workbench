import { debounce } from 'lodash-es';
import { autorun } from 'mobx';
import { useEffect, useRef, useState } from 'react';
import { FaDrawPolygon, FaRegCircle, FaRegSquare, FaSlash } from 'react-icons/fa';
import { useDrag } from 'react-use-gesture';

import { Box, HStack, Icon, IconButton } from '@chakra-ui/react';

import { Draw } from './Draw';
import { ColorPicker } from './DrawStylePicker';
import { Shapes } from './Shapes';
import { BattleSceneContext, Scene } from './scene';
import { LAYERS, ShapeStyle, ShapeTypes, Vector2, subVector2, transformTranslate } from './utils';

const TILE_SIZE = 40;
const TILE_COUNTS: Vector2 = [60, 60];
const DEFAULT_SHAPE_STYLE: ShapeStyle = {
  fill: 'black',
  stroke: 'black',
  fillStyle: 'hachure',
};

export function Battle(): JSX.Element {
  const [battleScene] = useState(() => new Scene(TILE_SIZE, TILE_COUNTS, [0, 0]));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const bind = useDrag(({ movement, last }) => {
    if (gridRef.current) {
      const clamped = battleScene.clampViewportXY(subVector2(battleScene.viewport.xy, movement));

      transformTranslate(gridRef.current, clamped, -1);

      if (last) {
        battleScene.setViewportXY(clamped);
      }
    }
  });
  const [drawing, setDrawing] = useState<ShapeTypes | null>(null);
  const [shapeStyle, setShapeStyle] = useState(DEFAULT_SHAPE_STYLE);

  useEffect(() => {
    const updateViewport = () => {
      if (wrapperRef.current) {
        const d = wrapperRef.current.getBoundingClientRect();

        battleScene.setViewportDimension([d.width, d.height]);
        battleScene.setViewportOffset([d.x, d.y]);
      }
    };
    const debouncedUpdate = debounce(updateViewport, 300);

    updateViewport();

    window.addEventListener('resize', debouncedUpdate);

    return () => {
      window.removeEventListener('resize', debouncedUpdate);
    };
  }, []);

  useEffect(() => {
    const dispose = autorun(() => {
      if (gridRef.current) {
        transformTranslate(gridRef.current, battleScene.viewport.xy, -1);
      }
    });

    return () => {
      dispose();
    };
  }, []);

  return (
    <BattleSceneContext.Provider value={battleScene}>
      <Box
        ref={wrapperRef}
        position="relative"
        zIndex={LAYERS.base}
        h="50vh"
        userSelect="none"
        overflow="hidden"
        backgroundColor="white"
        {...bind()}
      >
        <div
          className="grid"
          ref={gridRef}
          style={{
            width: battleScene.sceneDimension[0] + 1,
            height: battleScene.sceneDimension[1] + 1,
            backgroundSize: `${battleScene.tileSize}px ${battleScene.tileSize}px`,
            backgroundImage: `
            linear-gradient(to right, var(--chakra-colors-gray-200) 1px, transparent 1px),
            linear-gradient(to bottom, var(--chakra-colors-gray-200) 1px, transparent 1px)
          `,
          }}
        >
          {drawing ? (
            <Draw
              type={drawing}
              onDrawn={(s) => {
                battleScene.addShape(s);
                setDrawing(null);
              }}
              style={shapeStyle}
            />
          ) : null}

          <Shapes />
        </div>

        <HStack position="absolute" left="0" bottom="0">
          <IconButton
            icon={<Icon as={FaRegSquare} />}
            aria-label="方形"
            onClick={() => setDrawing(ShapeTypes.square)}
          />
          <IconButton
            icon={<Icon as={FaRegCircle} />}
            aria-label="圆形"
            onClick={() => setDrawing(ShapeTypes.circle)}
          />
          <IconButton
            icon={<Icon as={FaSlash} />}
            aria-label="线"
            onClick={() => setDrawing(ShapeTypes.line)}
          />
          <IconButton
            icon={<Icon as={FaDrawPolygon} />}
            aria-label="多边形"
            onClick={() => setDrawing(ShapeTypes.poly)}
          />
          <Box>
            <ColorPicker value={shapeStyle} onChange={(v) => setShapeStyle(v)} />
          </Box>
        </HStack>
      </Box>
    </BattleSceneContext.Provider>
  );
}
