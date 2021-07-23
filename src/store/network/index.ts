import { IObservableArray, extendObservable, observable, reaction } from 'mobx';
import shortid from 'shortid';

import { uniqByLast } from '../../utils/misc';
import { Character } from '../character';
import { Peer } from './peer';
import { PeerMessage, PeerMessageEvent, SerializedCharacterForSharing, Signal } from './types';

export class NetworkStore {
  id: string;
  signalingServer: string;
  disposes: Array<() => void>;

  sc: WebSocket | null;
  peers: Map<string, Peer>;

  connected: boolean;
  sharingCharacters: IObservableArray<Character>;
  receivedCharacters: IObservableArray<SerializedCharacterForSharing>;

  constructor(signalingServer: string) {
    this.id = shortid.generate();
    this.signalingServer = signalingServer;

    this.peers = observable.map({}, { deep: false });
    this.sc = null;

    this.connected = false;
    this.sharingCharacters = observable.array([], { deep: false });
    this.receivedCharacters = observable.array([], { deep: false });

    extendObservable(this, {
      connected: observable,
    });

    this.disposes = [];
    this.disposes.push(
      reaction(
        () => this.charactersForShare,
        () => {
          this.broadcastSharedCharacters();
        }
      )
    );
  }

  async ensureSignaling(): Promise<void> {
    if (this.sc && this.sc.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const socket = new WebSocket(this.signalingServer);

      socket.addEventListener('message', this.handleSignalEvents);
      socket.addEventListener('open', () => {
        this.connected = true;
        this.sc = socket;

        resolve();
        console.debug('signaling server connected');
      });
      socket.addEventListener('close', () => {
        this.connected = false;
        console.debug('signaling server closed');
      });
      socket.addEventListener('error', (e) => {
        this.connected = false;
        console.debug('signaling server error', e);
      });
    });
  }

  handleSignalEvents = async (e: MessageEvent<string>): Promise<void> => {
    const message: Signal = JSON.parse(e.data);

    console.debug('signal received: ', message);

    if (message.toNetwork && message.toNetwork !== this.id) {
      return;
    }

    switch (message.messageType) {
      case 'offerRequest':
        {
          const peer = this.createPeer(message.fromNetwork);
          await peer.sendOffer();
        }
        break;
      case 'offer':
        {
          const peer = this.createPeer(message.fromNetwork);

          await peer.receiveOffer(message.peerDescription);
        }
        break;
      case 'answer':
        {
          const peer = this.peers.get(message.fromNetwork);

          if (peer) {
            peer.receiveAnswer(message.peerDescription);
          }
        }
        break;
      case 'iceCandidate':
        {
          const peer = this.peers.get(message.fromNetwork);

          if (peer) {
            peer.receiveIceCnadidate(message.candidate);
          }
        }
        break;
      case 'bye':
        {
          const peer = this.peers.get(message.fromNetwork);

          if (peer) {
            this.peers.delete(message.toNetwork);
            peer.close();
          }
        }
        break;
    }
  };

  signal = async (s: Signal): Promise<void> => {
    await this.ensureSignaling();

    console.debug('signal sending: ', s);

    this.sc?.send(JSON.stringify(s));
  };

  createPeer(toNetwork: string): Peer {
    const peer = new Peer(this.id, toNetwork, this.signal);
    this.peers.set(toNetwork, peer);

    peer.addEventListener('disconnected', () => {
      this.peers.delete(peer.toId);
    });

    peer.addEventListener('message', this.onPeerMessage);

    return peer;
  }

  onPeerMessage = (e: PeerMessageEvent): void => {
    const message: PeerMessage = JSON.parse(e.detail);

    switch (message.type) {
      case 'shareCharacters':
        {
          const characters = uniqByLast(
            [...this.receivedCharacters, ...message.characters],
            (c) => c.id
          );

          this.receivedCharacters.replace(characters);
        }
        break;
    }
  };

  connect(): void {
    console.debug('networking connecting');

    this.signal({
      messageType: 'offerRequest',
      fromNetwork: this.id,
      toNetwork: null,
    });
  }

  broadcast(m: Omit<PeerMessage, 'fromNetwork' | 'toNetwork'>): void {
    const message: PeerMessage = {
      ...m,
      fromNetwork: this.id,
      toNetwork: null,
    };

    this.peers.forEach((peer) => {
      peer.sendData(JSON.stringify(message));
    });
  }

  broadcastSharedCharacters(): void {
    this.broadcast({
      type: 'shareCharacters',
      characters: this.charactersForShare,
    });
  }

  get charactersForShare(): SerializedCharacterForSharing[] {
    return this.sharingCharacters.map((c) => ({
      id: c.id,
      name: c.name,
      maxHP: c.status.hp.toString(),
      initiative: c.status.initiative.toString(),
      perception: c.status.perception.toString(),
      will: c.status.will.toString(),
    }));
  }
}
