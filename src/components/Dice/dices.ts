import { random, range } from 'lodash-es';
import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Material,
  MeshPhongMaterial,
  Vector2,
  Vector3,
} from 'three';

import { Api as CannonAPI, useBox, useConvexPolyhedron } from '@react-three/cannon';

import { takeByIndexes } from '../../utils/misc';

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

interface DiceArgs {
  geometry: BufferGeometry;
  materials: Material[] | Material;
  cannon: CannonAPI;
}

function randomVelocity(min = 40, max = 60) {
  return random(min, max) * (random(2) === 1 ? -1 : 1);
}

const D4_LABELS = [
  [3, 2, 4],
  [4, 1, 3],
  [4, 2, 1],
  [3, 1, 2],
];

export function makeD4(size: number, fgColor: string, bgColor: string): DiceArgs {
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

  const uv = [
    [0.5, 1],
    [0, 0],
    [1, 0],
  ];
  const geometry = new BufferGeometry();

  let positions: number[] = [];
  for (const face of faces) {
    const p = takeByIndexes(vertices, face).flat();

    positions = [...positions, ...p];
  }

  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(
      positions.map((i) => i * size),
      3
    )
  );

  const uvs = range(4)
    .map(() => uv.flat())
    .flat();
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

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

  range(0, 8).forEach((i) => {
    geometry.addGroup(i * 3, 3, i);
  });

  const cannon = useConvexPolyhedron(() => ({
    args: [
      vertices.map((v) => new Vector3(v[0] * size, v[1] * size, v[2] * size)),
      faces,
      undefined,
      undefined,
      size,
    ],
    position: [0, 20, 0],
    mass: 70,
    velocity: [randomVelocity(), randomVelocity(), 0],
    angularVelocity: [randomVelocity(10, 20), randomVelocity(10, 20), randomVelocity(10, 20)],
  }));

  return {
    geometry,
    materials,
    cannon,
  };
}

export function makeD6(size: number, fgColor: string, bgColor: string): DiceArgs {
  const geometry = new BoxGeometry(size, size, size);
  const materials = range(1, 7).map((i) =>
    createTextMaterial(i.toString(), size, fgColor, bgColor, 1)
  );
  const cannon = useBox(() => ({
    args: [size, size, size],
    position: [0, 20, 0],
    mass: 70,
    velocity: [randomVelocity(), randomVelocity(), 0],
    angularVelocity: [randomVelocity(), randomVelocity(), randomVelocity()],
  }));

  return { geometry, materials, cannon };
}

export function makeD8(size: number, fgColor: string, bgColor: string): DiceArgs {
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
  const uv = [
    [0.5, 1],
    [0, 0],
    [1, 0],
  ];
  const geometry = new BufferGeometry();

  let positions: number[] = [];
  for (const face of faces) {
    const p = takeByIndexes(vertices, face).flat();

    positions = [...positions, ...p];
  }

  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(
      positions.map((i) => i * size),
      3
    )
  );

  const uvs = range(8)
    .map(() => uv.flat())
    .flat();
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

  const materials = range(1, 9).map((i) =>
    createTextMaterial(i.toString(), size, fgColor, bgColor, 1.2, 0.15)
  );

  range(0, 8).forEach((i) => {
    geometry.addGroup(i * 3, 3, i);
  });

  const cannon = useConvexPolyhedron(() => ({
    args: [
      vertices.map((v) => new Vector3(v[0] * size, v[1] * size, v[2] * size)),
      faces,
      undefined,
      undefined,
      size,
    ],
    position: [0, 20, 0],
    mass: 80,
    velocity: [randomVelocity(), randomVelocity(), 0],
    angularVelocity: [randomVelocity(10, 20), randomVelocity(10, 20), randomVelocity(10, 20)],
  }));

  return {
    geometry,
    materials,
    cannon,
  };
}

export function makeD10(size: number, fgColor: string, bgColor: string): DiceArgs {
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
    [10, 4, 2],
    [11, 1, 3],
    [10, 0, 8],
    [11, 7, 9],
    [10, 8, 6],
    [11, 9, 1],
    [10, 2, 0],
    [11, 3, 5],
    [10, 6, 4],
    [1, 0, 2],
    [1, 2, 3],
    [3, 2, 4],
    [3, 4, 5],
    [5, 4, 6],
    [5, 6, 7],
    [7, 6, 8],
    [7, 8, 9],
    [9, 8, 0],
    [9, 0, 1],
  ];
  const uv = [
    [0.5, 1],
    [0, 0],
    [1, 0],
  ];

  const geometry = new BufferGeometry();

  let positions: number[] = [];
  for (const face of faces) {
    const p = takeByIndexes(vertices, face).flat();

    positions = [...positions, ...p];
  }

  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(
      positions.map((i) => i * size),
      3
    )
  );

  const uvs = range(20)
    .map(() => uv.flat())
    .flat();
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

  const materials = range(1, 11).map((i) =>
    createTextMaterial(i.toString(), size, fgColor, bgColor, 1, 0.15)
  );
  materials.push(new MeshPhongMaterial({ ...materialOptions, color: bgColor }));

  range(0, 20).forEach((i) => {
    if (i < 10) {
      geometry.addGroup(i * 3, 3, i);
    } else {
      geometry.addGroup(i * 3, 3, 10);
    }
  });

  const cannon = useConvexPolyhedron(() => ({
    args: [
      vertices.map((v) => new Vector3(v[0] * size, v[1] * size, v[2] * size)),
      faces,
      undefined,
      undefined,
      size,
    ],
    position: [0, 20, 0],
    mass: 85,
    velocity: [randomVelocity(), randomVelocity(), 0],
    angularVelocity: [randomVelocity(10, 20), randomVelocity(10, 20), randomVelocity(10, 20)],
  }));

  return {
    geometry,
    materials,
    cannon,
  };
}

const D12_FACE_INDEX = [
  [0, 1, 2],
  [0, 2, 3],
  [0, 3, 4],
];

export function makeD12(size: number, fgColor: string, bgColor: string): DiceArgs {
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
  const uvs = range(12)
    .map(() => uv)
    .flat();

  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(
      positions.map((i) => i * size),
      3
    )
  );
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

  const materials = range(1, 13).map((i) =>
    createTextMaterial(i.toString(), size, fgColor, bgColor, 1, 0.12)
  );

  // 36 triangles
  range(0, 36).forEach((i) => {
    geometry.addGroup(i * 3, 3, Math.floor(i / 3));
  });

  const cannon = useConvexPolyhedron(() => ({
    args: [
      vertices.map((v) => new Vector3(v[0] * size, v[1] * size, v[2] * size)),
      faces,
      undefined,
      undefined,
      size,
    ],
    position: [0, 20, 0],
    mass: 85,
    sleepSpeedLimit: 1,
    velocity: [randomVelocity(), randomVelocity(), 0],
    angularVelocity: [randomVelocity(10, 20), randomVelocity(10, 20), randomVelocity(10, 20)],
  }));

  return {
    geometry,
    materials,
    cannon,
  };
}

export function makeD20(size: number, fgColor: string, bgColor: string): DiceArgs {
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
  const uv = [
    [0.5, 1],
    [0, 0],
    [1, 0],
  ];

  const geometry = new BufferGeometry();

  let positions: number[] = [];
  for (const face of faces) {
    const p = takeByIndexes(vertices, face).flat();

    positions = [...positions, ...p];
  }
  const uvs = range(20)
    .map(() => uv.flat())
    .flat();

  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(
      positions.map((i) => i * size),
      3
    )
  );
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

  const materials = range(1, 21).map((i) =>
    createTextMaterial(i.toString(), size, fgColor, bgColor, 1.3, 0.15)
  );

  range(0, 20).forEach((i) => {
    geometry.addGroup(i * 3, 3, i);
  });

  const cannon = useConvexPolyhedron(() => ({
    args: [
      vertices.map((v) => new Vector3(v[0] * size, v[1] * size, v[2] * size)),
      faces,
      undefined,
      undefined,
      size,
    ],
    position: [0, 20, 0],
    mass: 100,
    velocity: [randomVelocity(), randomVelocity(), 0],
    angularVelocity: [randomVelocity(10, 20), randomVelocity(10, 20), randomVelocity(10, 20)],
  }));

  return {
    geometry,
    materials,
    cannon,
  };
}
