import shortid from 'shortid';

export const LAYERS = {
  base: 999,
  shapes: 1000,
  draw: 1001,
};
export type Vector2 = [number, number];

export function subVector2(a: Vector2, b: Vector2): Vector2 {
  return [a[0] - b[0], a[1] - b[1]];
}

export function addVector2(a: Vector2, b: Vector2): Vector2 {
  return [a[0] + b[0], a[1] + b[1]];
}

export function sameVector2(a: Vector2, b: Vector2): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

export interface ShapeStyle {
  fill: string;
  stroke: string;
  fillStyle: string;
}

export enum ShapeTypes {
  square = 'square',
  circle = 'circle',
  line = 'line',
  poly = 'poly',
}

export interface BaseShape {
  readonly type: ShapeTypes;
  id: string;
  style: ShapeStyle;
}

export interface Square extends BaseShape {
  type: ShapeTypes.square;
  lt: Vector2;
  w: number;
  h: number;
}

export interface Circle extends BaseShape {
  type: ShapeTypes.circle;
  center: Vector2;
  radius: number;
}

export interface Line extends BaseShape {
  type: ShapeTypes.line;
  offset: Vector2;
  points: Vector2[];
}

export interface Polygon extends BaseShape {
  type: ShapeTypes.poly;
  offset: Vector2;
  points: Vector2[];
}

export type Shape = Square | Circle | Line | Polygon;

export function normalizeSquareVertex(p1: Vector2, p2: Vector2): [Vector2, Vector2] {
  if (p1[0] < p2[0] || p1[1] < p2[1]) {
    return [p1, p2];
  }

  return [p2, p1];
}

export const shapeWithFillStyle = {
  roughness: 2,
  strokeWidth: 2,
  fillWeight: 3,
};

export function makeSquare(p1: Vector2, p2: Vector2, style: ShapeStyle): Square {
  const [lt, rb] = normalizeSquareVertex(p1, p2);
  const [w, h] = subVector2(rb, lt);

  return {
    type: ShapeTypes.square,
    id: shortid(),
    lt,
    w,
    h,
    style: {
      ...shapeWithFillStyle,
      ...style,
    },
  };
}

export function calculateCircleRadius(center: Vector2, other: Vector2): number {
  return Math.max(...subVector2(center, other).map(Math.abs));
}

export function makeCircle(center: Vector2, other: Vector2, style: ShapeStyle): Circle {
  const radius = calculateCircleRadius(center, other);

  return {
    type: ShapeTypes.circle,
    id: shortid(),
    center,
    radius,
    style: {
      ...shapeWithFillStyle,
      ...style,
    },
  };
}

export const lineStyle = {
  roughness: 1,
  strokeWidth: 3,
  bowing: 3,
  disableMultiStroke: true,
};

export function makeLine(points: Vector2[], style: ShapeStyle): Line {
  const offset = points[0];

  return {
    type: ShapeTypes.line,
    id: shortid(),
    offset,
    points: points.map((p) => subVector2(p, offset)),
    style: {
      ...lineStyle,
      ...style,
    },
  };
}

export function makePolygon(points: Vector2[], style: ShapeStyle): Polygon {
  const offset = points[0];

  return {
    type: ShapeTypes.poly,
    id: shortid(),
    offset,
    points: points.map((p) => subVector2(p, offset)),
    style: {
      ...shapeWithFillStyle,
      ...style,
    },
  };
}

export function transformTranslate(
  el: HTMLElement | SVGGElement,
  pos: Vector2,
  multiplier: 1 | -1 = 1
): void {
  const x = pos[0] * multiplier;
  const y = pos[1] * multiplier;

  if (el instanceof HTMLElement) {
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  if (el instanceof SVGGElement) {
    el.setAttribute('transform', `translate(${x}, ${y})`);
  }
}
