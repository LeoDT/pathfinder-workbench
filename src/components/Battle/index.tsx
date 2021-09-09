import { camelCase, debounce } from 'lodash-es';
import { autorun } from 'mobx';
import { createElement, useEffect, useRef, useState } from 'react';
import { FaDrawPolygon, FaRegCircle, FaRegSquare, FaSlash } from 'react-icons/fa';
import { useDrag } from 'react-use-gesture';
import rough from 'roughjs/bin/rough';

import { Box, HStack, Icon, IconButton } from '@chakra-ui/react';

import { Draw } from './Draw';
import { BattleSceneContext, Scene } from './scene';
import { Shape, ShapeTypes, Vector2, subVector2, transformTranslate } from './utils';

const TILE_SIZE = 40;
const TILE_COUNTS: Vector2 = [60, 60];

export function Battle(): JSX.Element {
  const [battleScene] = useState(() => new Scene(TILE_SIZE, TILE_COUNTS, [0, 0]));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
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
  const shapesCache = useRef(new Map<Shape, SVGGElement>());
  const [shapes, setShapes] = useState<SVGGElement[]>([]);

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

  useEffect(() => {
    const dispose = autorun(() => {
      if (svgRef.current) {
        const canvas = rough.svg(svgRef.current);
        const gs = battleScene.shapes
          .map((s) => {
            let g = shapesCache.current.get(s);

            if (g) return g;

            switch (s.type) {
              case ShapeTypes.square:
                {
                  g = canvas.rectangle(0, 0, s.w, s.h, {
                    fill: 'rgba(255,0,200,0.2)',
                    roughness: 2,
                    strokeWidth: 2,
                    fillWeight: 3,
                  });

                  transformTranslate(g, s.lt);
                }
                break;
              case ShapeTypes.circle:
                {
                  g = canvas.circle(0, 0, s.radius * 2, {
                    fill: 'rgb(10,150,10,0.2)',
                    roughness: 2,
                    strokeWidth: 2,
                    fillWeight: 3,
                  });

                  transformTranslate(g, s.center);
                }
                break;
              case ShapeTypes.line:
                {
                  g = canvas.linearPath(s.points, {
                    roughness: 1,
                    strokeWidth: 3,
                    bowing: 3,
                    disableMultiStroke: true,
                  });

                  transformTranslate(g, s.offset);
                }
                break;
              case ShapeTypes.poly:
                {
                  g = canvas.polygon(s.points, {
                    fill: 'rgb(10,150,150,0.2)',
                    roughness: 2,
                    strokeWidth: 2,
                    fillWeight: 3,
                  });

                  transformTranslate(g, s.offset);
                }
                break;
            }

            if (g) {
              shapesCache.current.set(s, g);
              g.id = s.id;

              return g;
            }
          })
          .filter((g): g is SVGGElement => Boolean(g));

        setShapes(gs);
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
        zIndex={999}
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
            />
          ) : null}

          <svg
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              zIndex: 1000,
              width: '100%',
              height: '100%',
            }}
            ref={svgRef}
          >
            {shapes.map((g) => {
              const children = [];

              for (const child of g.children) {
                const props: Record<string, string | number | null> = {};

                child.getAttributeNames().forEach((n) => {
                  props[camelCase(n)] = child.getAttribute(n);
                });

                props.key = children.length;

                children.push(createElement(child.nodeName, props));
              }

              return createElement(
                'g',
                {
                  transform: g.getAttribute('transform'),
                  id: g.id,
                  key: g.id,
                },
                children
              );
            })}
          </svg>
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
        </HStack>
      </Box>
    </BattleSceneContext.Provider>
  );
}
