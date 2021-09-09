import { clamp } from 'lodash-es';
import { IObservableArray, makeAutoObservable, observable } from 'mobx';

import { createContextNoNullCheck } from '../../utils/react';
import { Shape, Vector2 } from './utils';

interface Viewport {
  xy: Vector2;
  dimension: Vector2;
  screenOffset: Vector2;
}

export class Scene {
  tileSize: number;
  tileCounts: Vector2;
  sceneDimension: Vector2;
  viewport: Viewport;

  shapes: IObservableArray<Shape>;

  constructor(tileSize: number, tileCounts: Vector2, viewportDimension: Vector2) {
    makeAutoObservable(this);

    this.tileSize = tileSize;
    this.tileCounts = tileCounts;
    this.sceneDimension = [this.tileCounts[0] * this.tileSize, this.tileCounts[1] * this.tileSize];

    const viewportInitial: Vector2 = [
      this.sceneDimension[0] / 2 - viewportDimension[0] / 2,
      this.sceneDimension[1] / 2 - viewportDimension[1] / 2,
    ];

    this.viewport = {
      xy: viewportInitial,
      dimension: viewportDimension,
      screenOffset: [0, 0],
    };

    this.shapes = observable.array([]) as IObservableArray;
  }

  clampViewportXY(xy: Vector2): Vector2 {
    return [
      clamp(xy[0], 0, this.sceneDimension[0] - this.viewport.dimension[0]),
      clamp(xy[1], 0, this.sceneDimension[1] - this.viewport.dimension[1]),
    ];
  }

  setViewportXY(xy: Vector2): void {
    this.viewport.xy = this.clampViewportXY(xy);
  }
  setViewportDimension(d: Vector2): void {
    this.viewport.dimension = d;
  }
  setViewportOffset(o: Vector2): void {
    this.viewport.screenOffset = o;
  }

  getSnappedXY(xy: Vector2): Vector2 {
    const { tileSize } = this;
    const [x, y] = [
      clamp(xy[0] - this.viewport.screenOffset[0], 0, Infinity),
      clamp(xy[1] - this.viewport.screenOffset[1], 0, Infinity),
    ];

    return [Math.round(x / tileSize) * tileSize, Math.round(y / tileSize) * tileSize];
  }

  addShape(s: Shape): void {
    this.shapes.push(s);
  }
}

export const [useBattleScene, BattleSceneContext] = createContextNoNullCheck<Scene>();
