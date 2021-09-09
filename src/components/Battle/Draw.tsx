import { MouseEvent, useCallback, useRef } from 'react';
import { useMove } from 'react-use-gesture';
import rough from 'roughjs/bin/rough';

import { useBattleScene } from './scene';
import {
  Shape,
  ShapeTypes,
  Vector2,
  addVector2,
  calculateCircleRadius,
  makeCircle,
  makeLine,
  makePolygon,
  makeSquare,
  normalizeSquareVertex,
  sameVector2,
  subVector2,
  transformTranslate,
} from './utils';

interface Props {
  type: ShapeTypes;
  onDrawn: (s: Shape) => void;
}

export function Draw({ type, onDrawn }: Props): JSX.Element {
  const battleScene = useBattleScene();
  const svgRef = useRef<SVGSVGElement>(null);
  const penRef = useRef<SVGGElement>(null);

  const placeholderRef = useRef<SVGGElement>();
  const placeholderXY = useRef<Vector2>([Infinity, Infinity]);
  const placeholderRadius = useRef<number>(Infinity);

  const clicks = useRef<Vector2[]>([]);
  const bind = useMove(({ xy }) => {
    const snappedXY = battleScene.getSnappedXY(addVector2(battleScene.viewport.xy, xy));

    if (penRef.current) {
      transformTranslate(penRef.current, snappedXY, 1);
    }

    if (svgRef.current) {
      const firstClick = clicks.current[0];
      const canvas = rough.svg(svgRef.current);

      switch (type) {
        case ShapeTypes.square:
          if (
            firstClick &&
            !sameVector2(firstClick, snappedXY) &&
            !sameVector2(placeholderXY.current, snappedXY)
          ) {
            const [lt, rb] = normalizeSquareVertex(firstClick, snappedXY);
            const [w, h] = subVector2(rb, lt);
            const g = canvas.rectangle(0, 0, w, h);

            transformTranslate(g, lt);

            if (placeholderRef.current) {
              svgRef.current.removeChild(placeholderRef.current);
            }

            svgRef.current.appendChild(g);

            placeholderRef.current = g;
            placeholderXY.current = snappedXY;
          }
          break;
        case ShapeTypes.circle:
          if (firstClick && !sameVector2(firstClick, snappedXY)) {
            const radius = calculateCircleRadius(firstClick, snappedXY);

            if (radius !== placeholderRadius.current) {
              const r = canvas.circle(0, 0, radius * 2);

              transformTranslate(r, firstClick);

              if (placeholderRef.current) {
                svgRef.current.removeChild(placeholderRef.current);
              }

              svgRef.current.appendChild(r);

              placeholderRef.current = r;
              placeholderRadius.current = radius;
            }
          }
          break;
        case ShapeTypes.line:
        case ShapeTypes.poly:
          if (firstClick && !sameVector2(placeholderXY.current, snappedXY)) {
            const create = type === ShapeTypes.line ? 'linearPath' : 'polygon';
            const g = canvas[create](
              [...clicks.current, snappedXY].map((v) => subVector2(v, firstClick))
            );

            transformTranslate(g, firstClick);

            if (placeholderRef.current) {
              svgRef.current.removeChild(placeholderRef.current);
            }

            svgRef.current.appendChild(g);

            placeholderRef.current = g;
            placeholderXY.current = snappedXY;
          }
          break;
      }
    }
  });
  const handleClick = useCallback((e: MouseEvent) => {
    const snappedXY = battleScene.getSnappedXY(
      addVector2(battleScene.viewport.xy, [e.clientX, e.clientY])
    );

    clicks.current.push(snappedXY);

    switch (type) {
      case ShapeTypes.square:
        if (clicks.current.length === 2 && !sameVector2(clicks.current[0], clicks.current[1])) {
          onDrawn(makeSquare(clicks.current[0], clicks.current[1]));

          clicks.current = [];
        }
        break;
      case ShapeTypes.circle:
        if (clicks.current.length === 2 && !sameVector2(clicks.current[0], clicks.current[1])) {
          onDrawn(makeCircle(clicks.current[0], clicks.current[1]));

          clicks.current = [];
        }
        break;
      case ShapeTypes.line:
      case ShapeTypes.poly:
        {
          const lastClick = clicks.current[clicks.current.length - 2];

          if (lastClick && clicks.current.length >= 2 && sameVector2(snappedXY, lastClick)) {
            onDrawn(
              type === ShapeTypes.line ? makeLine(clicks.current) : makePolygon(clicks.current)
            );

            clicks.current = [];
          }
        }
        break;
    }
  }, []);

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 1001,
        width: '100%',
        height: '100%',
      }}
      ref={svgRef}
      {...bind()}
      onClick={handleClick}
    >
      <g ref={penRef}>
        <circle cx="0" cy="0" r="4" fill="red" />
      </g>
    </svg>
  );
}
