import { computed, makeObservable, observable } from 'mobx';

import { Entity } from '../types/core';

export class UIStore {
  quickViewerEntities: Entity[];

  constructor() {
    makeObservable(this, {
      quickViewerEntities: observable,

      currentQuickViewerEntity: computed,
    });

    this.quickViewerEntities = [];
  }

  get currentQuickViewerEntity(): Entity | undefined {
    return this.quickViewerEntities[this.quickViewerEntities.length - 1];
  }

  showQuickViewer(entity: Entity): void {
    this.quickViewerEntities.push(entity);
  }

  backQuickViewer(): void {
    this.quickViewerEntities.pop();
  }

  closeQuickViewer(): void {
    this.quickViewerEntities = [];
  }
}
