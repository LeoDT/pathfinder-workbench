import { camelCase } from 'lodash-es';
import { autorun } from 'mobx';
import { createElement, useEffect, useRef, useState } from 'react';
import rough from 'roughjs/bin/rough';

import { useBattleScene } from './scene';
import { LAYERS, Shape, ShapeTypes, transformTranslate } from './utils';

export function Shapes(): JSX.Element {
  const battleScene = useBattleScene();
  const svgRef = useRef<SVGSVGElement>(null);
  const shapesCache = useRef(new Map<Shape, SVGGElement>());
  const [shapes, setShapes] = useState<SVGGElement[]>([]);

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
                  g = canvas.rectangle(0, 0, s.w, s.h, s.style);

                  transformTranslate(g, s.lt);
                }
                break;
              case ShapeTypes.circle:
                {
                  g = canvas.circle(0, 0, s.radius * 2, s.style);

                  transformTranslate(g, s.center);
                }
                break;
              case ShapeTypes.line:
                {
                  g = canvas.linearPath(s.points, s.style);

                  transformTranslate(g, s.offset);
                }
                break;
              case ShapeTypes.poly:
                {
                  g = canvas.polygon(s.points, s.style);

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
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: LAYERS.shapes,
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
  );
}
