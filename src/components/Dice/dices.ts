import { Body, BodyOptions, ConvexPolyhedron, Material as PhysicsMaterial, Vec3 } from 'cannon-es';
import { range } from 'lodash-es';
import {
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Material,
  MeshPhongMaterial,
  Vector2,
} from 'three';

import { DiceNotation } from '../../utils/dice';
import { takeByIndexes } from '../../utils/misc';

export interface Dice {
  notation: DiceNotation;
  geometry: BufferGeometry;
  materials: Material[] | Material;
  body: Body;
}

export interface BaseDiceOptions {
  size: number;
  bgColor: string;
  fgColor: string;
}

export const dicePhysicMaterial = new PhysicsMaterial();
export const bodyOptions: BodyOptions = {
  material: dicePhysicMaterial,
  allowSleep: true,
  sleepTimeLimit: 0.4,
  sleepSpeedLimit: 0.2,
};

export const trianglePerFaces: Record<DiceNotation, number> = {
  d4: 1,
  d6: 2,
  d8: 1,
  d10: 2,
  d12: 3,
  d20: 1,
};

export const standardDiceSizes: Record<DiceNotation, number> = {
  d4: 1,
  d6: 1,
  d8: 1.6,
  d10: 1.6,
  d12: 0.8,
  d20: 0.8,
};

const materialOptions = {
  specular: 0x172022,
  color: 0xf0f0f0,
  shininess: 30,
  flatShading: true,
};

function calculateTextureSize(approx: number): number {
  return Math.pow(2, Math.floor(Math.log(approx) / Math.log(2))) * 30;
}

function createTextMaterial(
  text: string,
  size: number,
  fgColor: string,
  bgColor: string,
  textMargin: number,
  offsetY = 0
): Material {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  const ts = calculateTextureSize(size + size * textMargin) * 2;
  const fontSize = ts / (1 + 2 * textMargin);

  canvas.width = ts;
  canvas.height = ts;

  if (context) {
    context.font = fontSize + 'pt Arial';
    context.fillStyle = bgColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = fgColor;

    if (text === '6' || text === '9') {
      context.fillText('   .', canvas.width / 2, canvas.height / 2);
    }

    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new CanvasTexture(canvas);

    if (offsetY) {
      texture.offset = new Vector2(0, offsetY);
    }

    return new MeshPhongMaterial({
      ...materialOptions,
      map: texture,
    });
  }

  throw Error('no 2d context');
}

function makeBodyVertices(size: number, vertices: number[][]): Vec3[] {
  return vertices.map((v) => new Vec3(...v).scale(size));
}

function makePositions(
  size: number,
  vertices: number[][],
  faces: number[][]
): Float32BufferAttribute {
  let positions: number[] = [];
  for (const face of faces) {
    const p = takeByIndexes(vertices, face).flat();

    positions = [...positions, ...p];
  }

  return new Float32BufferAttribute(
    positions.map((i) => i * size),
    3
  );
}

const TRIANGLE_UV = [
  [0.5, 1],
  [0, 0],
  [1, 0],
];

export function makeTriangleUV(triangleCount: number): Float32BufferAttribute {
  const uvs = range(triangleCount)
    .map(() => TRIANGLE_UV.flat())
    .flat();

  return new Float32BufferAttribute(uvs, 2);
}

const D4_LABELS = [
  [3, 2, 4],
  [4, 1, 3],
  [4, 2, 1],
  [3, 1, 2],
];

export function makeD4({ size, fgColor, bgColor }: BaseDiceOptions): Dice {
  const vertices = [
    [1, 1, 1],
    [-1, -1, 1],
    [-1, 1, -1],
    [1, -1, -1],
  ];
  const faces = [
    [1, 0, 2],
    [0, 1, 3],
    [0, 3, 2],
    [1, 2, 3],
  ];

  const geometry = new BufferGeometry();

  geometry.setAttribute('position', makePositions(size, vertices, faces));
  geometry.setAttribute('uv', makeTriangleUV(4));

  const textMargin = 2;
  const materials = D4_LABELS.map((labels) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const ts = calculateTextureSize(size + textMargin) * 2;
    const fontSize = (ts - textMargin) / 5;

    canvas.width = ts;
    canvas.height = ts;

    if (context) {
      context.font = fontSize + 'pt Arial';
      context.fillStyle = bgColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = fgColor;

      for (const l of labels) {
        context.fillText(l.toString(), canvas.width / 2, canvas.height / 2 - ts * 0.3);
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate((Math.PI * 2) / 3);
        context.translate(-canvas.width / 2, -canvas.height / 2);
      }
    } else {
      throw Error('no 2d context');
    }

    const texture = new CanvasTexture(canvas);
    texture.offset = new Vector2(0, 0.15);

    return new MeshPhongMaterial({
      ...materialOptions,
      map: texture,
    });
  });

  range(0, 4).forEach((i) => {
    geometry.addGroup(i * 3, 3, i);
  });

  const body = new Body({
    mass: 70,
    shape: new ConvexPolyhedron({
      vertices: makeBodyVertices(size, vertices),
      faces,
    }),
    ...bodyOptions,
  });

  return {
    notation: 'd4',
    geometry,
    materials,
    body,
  };
}

const D6_FACE_INDEX = [
  [0, 1, 2],
  [0, 2, 3],
];

export function makeD6({ size, fgColor, bgColor }: BaseDiceOptions): Dice {
  const vertices = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1],
  ];
  const faces = [
    [0, 3, 2, 1],
    [1, 2, 6, 5],
    [0, 1, 5, 4],
    [3, 7, 6, 2],
    [0, 4, 7, 3],
    [4, 5, 6, 7],
  ];
  const uv = [
    [0, 1],
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ].flat();

  const geometry = new BufferGeometry();

  let positions: number[] = [];
  for (const face of faces) {
    for (const subFace of D6_FACE_INDEX) {
      const f = takeByIndexes(face, subFace);
      const p = takeByIndexes(vertices, f).flat();

      positions = [...positions, ...p];
    }
  }

  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(
      positions.map((i) => i * size),
      3
    )
  );

  const uvs = range(6)
    .map(() => uv)
    .flat();
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

  const materials = range(1, 7).map((i) =>
    createTextMaterial(i.toString(), size, fgColor, bgColor, 1)
  );

  range(0, 12).forEach((i) => {
    geometry.addGroup(i * 3, 3, Math.floor(i / 2));
  });

  const body = new Body({
    // cannon unit is twice larger than three.js
    shape: new ConvexPolyhedron({
      vertices: makeBodyVertices(size, vertices),
      faces,
    }),
    mass: 70,
    ...bodyOptions,
  });

  return {
    notation: 'd6',
    geometry,
    materials,
    body,
  };
}

export function makeD8({ size, fgColor, bgColor }: BaseDiceOptions): Dice {
  const vertices = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ];
  const faces = [
    [0, 2, 4],
    [0, 3, 5],
    [0, 4, 3],
    [0, 5, 2],
    [1, 3, 4],
    [1, 2, 5],
    [1, 4, 2],
    [1, 5, 3],
  ];

  const geometry = new BufferGeometry();

  geometry.setAttribute('position', makePositions(size, vertices, faces));
  geometry.setAttribute('uv', makeTriangleUV(8));

  const materials = range(1, 9).map((i) =>
    createTextMaterial(i.toString(), size, fgColor, bgColor, 1.2, 0.15)
  );

  range(0, 8).forEach((i) => {
    geometry.addGroup(i * 3, 3, i);
  });

  const body = new Body({
    shape: new ConvexPolyhedron({
      vertices: makeBodyVertices(size, vertices),
      faces,
    }),
    mass: 80,
    ...bodyOptions,
  });

  return {
    notation: 'd8',
    geometry,
    materials,
    body,
  };
}

export function makeD10({ size, fgColor, bgColor }: BaseDiceOptions): Dice {
  const a = (Math.PI * 2) / 10;
  const h = 0.105;

  const vertices: number[][] = [];
  for (let i = 0, b = 0; i < 10; ++i, b += a) {
    vertices.push([Math.cos(b), Math.sin(b), h * (i % 2 ? 1 : -1)]);
  }

  vertices.push([0, 0, -1]);
  vertices.push([0, 0, 1]);

  const faces = [
    [11, 5, 7],
    [5, 6, 7],
    [10, 4, 2],
    [3, 2, 4],
    [11, 1, 3],
    [1, 2, 3],
    [10, 0, 8],
    [9, 8, 0],
    [11, 7, 9],
    [7, 8, 9],
    [10, 8, 6],
    [7, 6, 8],
    [11, 9, 1],
    [9, 0, 1],
    [10, 2, 0],
    [1, 0, 2],
    [11, 3, 5],
    [3, 4, 5],
    [10, 6, 4],
    [5, 4, 6],
  ];

  const geometry = new BufferGeometry();

  geometry.setAttribute('position', makePositions(size, vertices, faces));
  geometry.setAttribute('uv', makeTriangleUV(20));

  const materials = range(1, 11).map((i) =>
    createTextMaterial(i.toString(), size, fgColor, bgColor, 1, 0.15)
  );
  materials.push(new MeshPhongMaterial({ ...materialOptions, color: bgColor }));

  range(0, 20).forEach((i) => {
    geometry.addGroup(i * 3, 3, i % 2 === 0 ? Math.floor(i / 2) : 10);
  });

  const body = new Body({
    shape: new ConvexPolyhedron({
      vertices: makeBodyVertices(size, vertices),
      faces,
    }),
    mass: 85,
    ...bodyOptions,
  });

  return {
    notation: 'd10',
    geometry,
    materials,
    body,
  };
}

const D12_FACE_INDEX = [
  [0, 1, 2],
  [0, 2, 3],
  [0, 3, 4],
];

export function makeD12({ size, fgColor, bgColor }: BaseDiceOptions): Dice {
  const p = (1 + Math.sqrt(5)) / 2;
  const q = 1 / p;

  const vertices = [
    [0, q, p],
    [0, q, -p],
    [0, -q, p],
    [0, -q, -p],
    [p, 0, q],
    [p, 0, -q],
    [-p, 0, q],
    [-p, 0, -q],
    [q, p, 0],
    [q, -p, 0],
    [-q, p, 0],
    [-q, -p, 0],
    [1, 1, 1],
    [1, 1, -1],
    [1, -1, 1],
    [1, -1, -1],
    [-1, 1, 1],
    [-1, 1, -1],
    [-1, -1, 1],
    [-1, -1, -1],
  ];
  const faces = [
    [2, 14, 4, 12, 0],
    [15, 9, 11, 19, 3],
    [16, 10, 17, 7, 6],
    [6, 7, 19, 11, 18],
    [6, 18, 2, 0, 16],
    [18, 11, 9, 14, 2],
    [1, 17, 10, 8, 13],
    [1, 13, 5, 15, 3],
    [13, 8, 12, 4, 5],
    [5, 4, 14, 9, 15],
    [0, 12, 8, 10, 16],
    [3, 19, 7, 17, 1],
  ];
  const uv = [
    [0.5, 1],
    [0, 0.61],
    [0.17, 0],
    [0.5, 1],
    [0.17, 0],
    [0.82, 0],
    [0.5, 1],
    [0.82, 0],
    [1, 0.61],
  ].flat();

  const geometry = new BufferGeometry();

  let positions: number[] = [];
  for (const face of faces) {
    for (const subFace of D12_FACE_INDEX) {
      const f = takeByIndexes(face, subFace);
      const p = takeByIndexes(vertices, f).flat();

      positions = [...positions, ...p];
    }
  }

  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(
      positions.map((i) => i * size),
      3
    )
  );

  const uvs = range(12)
    .map(() => uv)
    .flat();
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

  const materials = range(1, 13).map((i) =>
    createTextMaterial(i.toString(), size, fgColor, bgColor, 1, 0.12)
  );

  // 36 triangles
  range(0, 36).forEach((i) => {
    geometry.addGroup(i * 3, 3, Math.floor(i / 3));
  });

  const body = new Body({
    shape: new ConvexPolyhedron({
      vertices: makeBodyVertices(size, vertices),
      faces,
    }),
    mass: 85,
    ...bodyOptions,
  });

  return {
    notation: 'd12',
    geometry,
    materials,
    body,
  };
}

export function makeD20({ size, fgColor, bgColor }: BaseDiceOptions): Dice {
  const t = (1 + Math.sqrt(5)) / 2;
  const vertices = [
    [-1, t, 0],
    [1, t, 0],
    [-1, -t, 0],
    [1, -t, 0],
    [0, -1, t],
    [0, 1, t],
    [0, -1, -t],
    [0, 1, -t],
    [t, 0, -1],
    [t, 0, 1],
    [-t, 0, -1],
    [-t, 0, 1],
  ];
  const faces = [
    [11, 10, 2], // 8- 1
    [7, 1, 8], // 10- 2
    [5, 11, 4], // 7- 3
    [3, 6, 8], // 14- 4
    [10, 7, 6], // 9- 5
    [3, 9, 4], // 11- 6
    [10, 11, 0], // 5- 7
    [1, 5, 9], // 6- 8
    [3, 4, 2], // 12- 9
    [5, 1, 0], // 2- 10
    [3, 2, 6], // 13- 11
    [1, 7, 0], // 3- 12
    [6, 2, 10], // 18- 13
    [3, 8, 9], // 15- 14
    [7, 10, 0], // 4- 15
    [4, 9, 5], // 16- 16
    [11, 5, 0], // 1- 17
    [8, 6, 7], // 19- 18
    [2, 4, 11], // 17- 19
    [9, 8, 1], // 20- 20
  ];

  const geometry = new BufferGeometry();

  geometry.setAttribute('position', makePositions(size, vertices, faces));
  geometry.setAttribute('uv', makeTriangleUV(20));

  const materials = range(1, 21).map((i) =>
    createTextMaterial(i.toString(), size, fgColor, bgColor, 1.3, 0.15)
  );

  range(0, 20).forEach((i) => {
    geometry.addGroup(i * 3, 3, i);
  });

  const body = new Body({
    shape: new ConvexPolyhedron({
      vertices: makeBodyVertices(size, vertices),
      faces,
    }),
    mass: 100,
    ...bodyOptions,
  });

  return {
    notation: 'd20',
    geometry,
    materials,
    body,
  };
}
