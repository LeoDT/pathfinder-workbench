import {
  Body,
  ContactMaterial,
  GSSolver,
  NaiveBroadphase,
  Material as PhysicsMaterial,
  Plane,
  Vec3,
  World,
} from 'cannon-es';
import { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { Matrix3, Matrix4, Mesh, Quaternion, Vector3 } from 'three';

import { DiceNotation } from '../../utils/dice';
import { randomPick } from '../../utils/random';
import { createContextNoNullCheck } from '../../utils/react';
import {
  BaseDiceOptions,
  Dice,
  dicePhysicMaterial,
  makeD10,
  makeD12,
  makeD20,
  makeD4,
  makeD6,
  makeD8,
  trianglePerFaces,
} from './dices';

const wallPhysicsMaterial = new PhysicsMaterial();
const floorPhysicsMaterial = new PhysicsMaterial();

export class DiceStore {
  world: World;
  dices: Map<Dice, Mesh>;

  walls: Body[];
  floor: Body;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).diceStore = this;

    const solver = new GSSolver();
    solver.iterations = 16;

    this.world = new World({
      allowSleep: true,
      gravity: new Vec3(0, -9.82 * 20, 0),
      quatNormalizeFast: false,
      quatNormalizeSkip: 0,
      solver,
      broadphase: new NaiveBroadphase(),
    });

    this.dices = new Map();

    this.world.addContactMaterial(
      new ContactMaterial(floorPhysicsMaterial, dicePhysicMaterial, {
        friction: 0.01,
        restitution: 0.5,
      })
    );
    this.world.addContactMaterial(
      new ContactMaterial(wallPhysicsMaterial, dicePhysicMaterial, {
        friction: 0,
        restitution: 5,
      })
    );
    this.world.addContactMaterial(
      new ContactMaterial(dicePhysicMaterial, dicePhysicMaterial, {
        friction: 0,
        restitution: 0.5,
      })
    );

    this.walls = [
      this.makePlane([0, Math.PI / 2, 0]),
      this.makePlane([0, 0, 0]),
      this.makePlane([0, -Math.PI / 2, 0]),
      this.makePlane([0, Math.PI, 0]),
    ];
    this.floor = this.makePlane([-Math.PI / 2, 0, 0]);
  }

  makePlane(rotation: [number, number, number], position?: number[]): Body {
    const body = new Body({
      shape: new Plane(),
      mass: 0,
      position: position ? new Vec3(...position) : new Vec3(0, 0, 0),
    });

    body.quaternion.setFromEuler(...rotation);

    this.world.addBody(body);

    return body;
  }

  updateFloorAndWalls(w: number, h: number): void {
    const cw = w / 2;
    const ch = h / 2;
    const wallSize = Math.max(w, h);
    const halfWallSize = wallSize / 2;

    [
      [-cw, halfWallSize, 0],
      [0, halfWallSize, -ch],
      [cw, halfWallSize, 0],
      [0, halfWallSize, ch],
    ].forEach((p, i) => {
      this.walls[i].position.set(p[0], p[1], p[2]);
    });
  }

  addDice(d: Dice, o: Mesh): void {
    this.dices.set(d, o);

    this.world.addBody(d.body);
  }

  removeDice(d: Dice): void {
    this.dices.delete(d);

    this.world.removeBody(d.body);
  }

  roll(onSimulate?: () => void, onEnd?: () => void): () => void {
    let frame = 0;

    const step = () => {
      if (this.world.hasActiveBodies) {
        this.world.step(1 / 60);

        if (onSimulate) {
          onSimulate();
        }

        frame = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(frame);

        if (onEnd) {
          onEnd();
        }
      }
    };

    this.world.step(1 / 60);
    step();

    return () => cancelAnimationFrame(frame);
  }

  getDiceValues(): Map<Dice, number> {
    const values = new Map<Dice, number>();

    this.dices.forEach((o, d) => {
      const index = getFaceUpIndex(o, trianglePerFaces[d.notation], d.notation === 'd4');

      values.set(d, index);
    });

    return values;
  }
}

export const [useDiceStore, DiceStoreContext] = createContextNoNullCheck<DiceStore>();

const faceUpNormal = new Vector3(0, 1, 0);
const faceUpTargetNormal = new Vector3();
const faceUpNormalMatrix = new Matrix3();
export function getFaceUpIndex(o: Mesh, trianglePerFace = 1, upsidedown = false): number {
  o.updateMatrixWorld(true);

  faceUpNormalMatrix.getNormalMatrix(o.matrixWorld);

  o.geometry.computeVertexNormals();

  const objNorm = o.geometry.attributes.normal;

  let minIndex = 0;
  let minAngle = Math.PI;
  let maxIndex = 0;
  let maxAngle = 0;
  for (let j = 0, jl = objNorm.count; j < jl; j++) {
    faceUpTargetNormal.set(objNorm.getX(j), objNorm.getY(j), objNorm.getZ(j));
    faceUpTargetNormal.applyMatrix3(faceUpNormalMatrix).normalize();

    const angle = Math.abs(faceUpNormal.angleTo(faceUpTargetNormal));
    if (angle <= minAngle) {
      minAngle = angle;
      minIndex = j;
    }
    if (angle >= maxAngle) {
      maxAngle = angle;
      maxIndex = j;
    }
  }

  return Math.floor((upsidedown ? maxIndex : minIndex) / (3 * trianglePerFace));
}

const updatePosition = new Vector3();
const updateQuaternion = new Quaternion();
const updateMatrix = new Matrix4();
export function updateObject3DWithBody(o: Mesh | null, b: Body): void {
  if (o) {
    updateMatrix.compose(
      updatePosition.set(b.position.x, b.position.y, b.position.z),
      updateQuaternion.set(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w),
      o.scale
    );

    o.matrixAutoUpdate = false;
    o.matrix.copy(updateMatrix);
  }
}

const makes: Record<DiceNotation, (o: BaseDiceOptions) => Dice> = {
  d4: makeD4,
  d6: makeD6,
  d8: makeD8,
  d10: makeD10,
  d12: makeD12,
  d20: makeD20,
};

export function useDice(
  notation: DiceNotation,
  diceOptions?: Partial<BaseDiceOptions>
): [Dice, MutableRefObject<Mesh | null>] {
  const diceStore = useDiceStore();
  const ref = useRef<Mesh | null>(null);
  const options = Object.assign({ size: 1, fgColor: 'white', bgColor: 'black' }, diceOptions);
  const dice = useMemo(() => makes[notation](options), [notation, diceOptions]);

  useEffect(() => {
    if (ref.current) {
      dice.body.position.set(0, 20, 0);

      dice.body.applyImpulse(
        new Vec3(
          10000 * Math.random() * randomPick([-1, 1]),
          4000 * Math.random(),
          10000 * Math.random() * randomPick([-1, 1])
        ),
        new Vec3(0.1, 0.1, 0.1)
      );

      diceStore.addDice(dice, ref.current);
    }

    return () => {
      diceStore.removeDice(dice);
    };
  }, [dice]);

  return [dice, ref];
}
