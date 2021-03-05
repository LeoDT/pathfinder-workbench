import { makeObservable, observable } from 'mobx';

import { CollectionEntityType } from './collection';
import { Entity } from './types';

export default class UIStore {
  quickViewerKind: CollectionEntityType | null;
  quickViewerEntity: Entity | null;

  constructor() {
    makeObservable(this, {
      quickViewerKind: observable,
      quickViewerEntity: observable.ref,
    });

    this.quickViewerKind = null;
    this.quickViewerEntity = null;
  }

  showQuickViewer(kind: CollectionEntityType, entity: Entity): void {
    this.quickViewerKind = kind;
    this.quickViewerEntity = entity;
  }

  closeQuickViewer(): void {
    this.quickViewerKind = null;
    this.quickViewerEntity = null;
  }
}
