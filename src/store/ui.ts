import { action, computed, makeObservable, observable } from 'mobx';

import { Entity } from '../types/core';

export class UIStore extends EventTarget {
  quickViewerEntities: Entity[];

  rollOpen: boolean;

  constructor() {
    super();

    makeObservable(this, {
      quickViewerEntities: observable,
      currentQuickViewerEntity: computed,
      showQuickViewer: action,
      backQuickViewer: action,
      closeQuickViewer: action,

      rollOpen: observable,
      roll: action,
      closeRoll: action,
    });

    this.quickViewerEntities = [];
    this.rollOpen = false;
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

  addEventListener(
    type: 'rollDone',
    listener:
      | null
      | ((e: CustomEvent<number[]>) => void)
      | { handleEvent: (e: CustomEvent<number[]>) => void },
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(t: string, listener: null | EventListenerOrEventListenerObject): void {
    return super.addEventListener(t, listener);
  }

  removeEventListener(
    type: 'rollDone',
    listener:
      | null
      | ((e: CustomEvent<number[]>) => void)
      | { handleEvent: (e: CustomEvent<number[]>) => void }
  ): void;
  removeEventListener(t: string, listener: null | EventListenerOrEventListenerObject): void {
    return super.removeEventListener(t, listener);
  }

  async roll(): Promise<number[]> {
    this.rollOpen = true;

    return new Promise((resolve) => {
      const listener = (e: CustomEvent<number[]>) => {
        resolve(e.detail);

        this.removeEventListener('rollDone', listener);
      };

      this.addEventListener('rollDone', listener);
    });
  }

  dispatchRollDone(results: number[]): void {
    const e = new CustomEvent('rollDone', { detail: results });
    this.dispatchEvent(e);
  }

  closeRoll(): void {
    this.rollOpen = false;
  }
}
