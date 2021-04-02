import { makeObservable, observable } from 'mobx';

import { Entity } from '../types/core';

export default class UIStore {
  quickViewerEntity: Entity | null;

  constructor() {
    makeObservable(this, {
      quickViewerEntity: observable.ref,
    });

    this.quickViewerEntity = null;
  }

  showQuickViewer(entity: Entity): void {
    this.quickViewerEntity = entity;
  }

  closeQuickViewer(): void {
    this.quickViewerEntity = null;
  }
}
