export interface BaseSignal {
  fromNetwork: string;
  toNetwork: string;
}

export interface SignalOfferRequest {
  messageType: 'offerRequest';
  fromNetwork: string;
  toNetwork: null;
}

export interface SignalOffer extends BaseSignal {
  messageType: 'offer';
  peerDescription: RTCSessionDescriptionInit;
  peerId: string;
}

export interface SignalAnswer extends BaseSignal {
  messageType: 'answer';
  peerDescription: RTCSessionDescriptionInit;
  peerId: string;
}

export interface SignalIceCandidate extends BaseSignal {
  messageType: 'iceCandidate';
  candidate: RTCIceCandidateInit;
  peerId: string;
}

export interface SignalBye extends BaseSignal {
  messageType: 'bye';
  peerId: string;
}

export type Signal =
  | SignalOfferRequest
  | SignalOffer
  | SignalAnswer
  | SignalIceCandidate
  | SignalBye;

export interface PeerMessageEvent extends Event {
  detail: string;
}

export interface SerializedCharacterForSharing {
  id: string;
  name: string;
  maxHP: string;
  initiative: string;
  perception: string;
  will: string;
}

export interface BasePeerMessage {
  fromNetwork: string;
  toNetwork: string | null;
}

export interface PeerMessageShareCharacters extends BasePeerMessage {
  type: 'shareCharacters';
  characters: SerializedCharacterForSharing[];
}

export type PeerMessage = PeerMessageShareCharacters;
