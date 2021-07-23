import shortid from 'shortid';

import { PeerMessageEvent, Signal } from './types';

export class Peer extends EventTarget {
  id: string;
  fromId: string;
  toId: string;
  signal: (s: Partial<Signal>) => void;

  conn: RTCPeerConnection;
  sendChannel: RTCDataChannel;
  receiveChannel: RTCDataChannel | null;

  constructor(fromId: string, toId: string, signal: (s: Signal) => void) {
    super();

    this.id = shortid.generate();
    this.fromId = fromId;
    this.toId = toId;
    this.signal = (s: Partial<Signal>) => {
      signal({
        ...s,
        peerId: this.id,
        fromNetwork: fromId,
        toNetwork: toId,
      } as Signal);
    };

    this.conn = new RTCPeerConnection({ iceServers: [] });
    this.sendChannel = this.conn.createDataChannel('message');
    this.receiveChannel = null;

    this.conn.addEventListener('icecandidate', this.onIceCandidate);
    this.conn.addEventListener('datachannel', this.onDataChannel);
    this.conn.addEventListener('connectionstatechange', this.onDisconnected);
    this.sendChannel.addEventListener('open', this.onSendChannelOpen);
  }

  log(msg: string): void {
    console.debug(`peer ${this.id}: ${msg}`);
  }

  addEventListener(
    type: 'message',
    listener:
      | null
      | ((e: PeerMessageEvent) => void)
      | { handleEvent: (e: PeerMessageEvent) => void }
  ): void;
  addEventListener(
    type: 'disconnected',
    listener: null | (() => void) | { handleEvent: () => void }
  ): void;
  addEventListener(t: string, listener: null | EventListenerOrEventListenerObject): void {
    return super.addEventListener(t, listener);
  }

  onDisconnected = (): void => {
    if (this.conn.connectionState === 'disconnected') {
      this.dispatchEvent(new CustomEvent('disconnected'));

      this.close();
    }
  };

  async sendOffer(): Promise<void> {
    this.log('send offer');

    const offerDesc = await this.conn.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: false,
    });

    this.conn.setLocalDescription(offerDesc);

    this.signal({
      messageType: 'offer',
      peerDescription: offerDesc,
    });
  }

  async receiveOffer(desc: RTCSessionDescriptionInit): Promise<void> {
    this.log('receive offer');

    this.conn.setRemoteDescription(new RTCSessionDescription(desc));
    const anwserDesc = await this.conn.createAnswer();

    this.conn.setLocalDescription(anwserDesc);

    this.signal({
      messageType: 'answer',
      peerDescription: anwserDesc,
    });
  }

  receiveAnswer(desc: RTCSessionDescriptionInit): void {
    this.log('receive answer');

    this.conn.setRemoteDescription(new RTCSessionDescription(desc));
  }

  receiveIceCnadidate(candidate: RTCIceCandidateInit): void {
    this.log('receive candidate');

    this.conn.addIceCandidate(new RTCIceCandidate(candidate));
  }

  sendData(d: string): void {
    if (this.sendChannel.readyState === 'open') {
      this.sendChannel.send(d);
    }
  }

  close(): void {
    this.log('close');

    this.signal({ messageType: 'bye' });

    if (this.sendChannel) {
      this.sendChannel.close();
    }

    this.conn.close();
  }

  onIceCandidate = (e: RTCPeerConnectionIceEvent): void => {
    if (e.candidate) {
      this.log('Sending ICE candidate...');

      this.signal({
        messageType: 'iceCandidate',
        candidate: e.candidate,
      });
    } else {
      this.log('End of candidates.');
    }
  };

  onDataChannel = (e: RTCDataChannelEvent): void => {
    this.receiveChannel = e.channel;
    this.receiveChannel.addEventListener('message', this.onChannelReceive);
  };

  onChannelReceive = (e: MessageEvent): void => {
    this.log(`channel receive ${e.data}`);

    this.dispatchEvent(
      new CustomEvent('message', {
        detail: e.data,
      })
    );
  };

  onSendChannelOpen = (): void => {
    this.log('sending channel open');
  };
}
