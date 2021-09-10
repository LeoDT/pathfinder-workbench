import { MouseEvent, useCallback, useRef } from 'react';
import { useMove } from 'react-use-gesture';
import rough from 'roughjs/bin/rough';

import { useBattleScene } from './scene';
import {
  LAYERS,
  Shape,
  ShapeStyle,
  ShapeTypes,
  Vector2,
  addVector2,
  makeCircle,
  makeLine,
  makePolygon,
  makeSquare,
  sameVector2,
  transformTranslate,
} from './utils';

interface Props {
  type: ShapeTypes;
  style: ShapeStyle;

  onDrawn: (s: Shape) => void;
}

export function Draw({ type, onDrawn, style }: Props): JSX.Element {
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
            const s = makeSquare(firstClick, snappedXY, style);
            const g = canvas.rectangle(0, 0, s.w, s.h, s.style);

            transformTranslate(g, s.lt);

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
            const s = makeCircle(firstClick, snappedXY, style);

            if (s.radius !== placeholderRadius.current) {
              const g = canvas.circle(0, 0, s.radius * 2, s.style);

              transformTranslate(g, s.center);

              if (placeholderRef.current) {
                svgRef.current.removeChild(placeholderRef.current);
              }
              svgRef.current.appendChild(g);

              placeholderRef.current = g;
              placeholderRadius.current = s.radius;
            }
          }
          break;
        case ShapeTypes.line:
        case ShapeTypes.poly:
          if (firstClick && !sameVector2(placeholderXY.current, snappedXY)) {
            const points = [...clicks.current, snappedXY];
            const s =
              type === ShapeTypes.line ? makeLine(points, style) : makePolygon(points, style);
            const create = type === ShapeTypes.line ? 'linearPath' : 'polygon';
            const g = canvas[create](s.points, s.style);

            transformTranslate(g, s.offset);

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
          onDrawn(makeSquare(clicks.current[0], clicks.current[1], style));

          clicks.current = [];
        }
        break;
      case ShapeTypes.circle:
        if (clicks.current.length === 2 && !sameVector2(clicks.current[0], clicks.current[1])) {
          onDrawn(makeCircle(clicks.current[0], clicks.current[1], style));

          clicks.current = [];
        }
        break;
      case ShapeTypes.line:
      case ShapeTypes.poly:
        {
          const lastClick = clicks.current[clicks.current.length - 2];

          if (lastClick && clicks.current.length >= 2 && sameVector2(snappedXY, lastClick)) {
            onDrawn(
              type === ShapeTypes.line
                ? makeLine(clicks.current, style)
                : makePolygon(clicks.current, style)
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
        zIndex: LAYERS.draw,
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
