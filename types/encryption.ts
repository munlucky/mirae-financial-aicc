/**
 * E2EE (End-to-End Encryption) 타입 정의
 */

export interface E2EEKeys {
  publicKey: string;
  secretKey: string;
}

export interface EncryptedMessage {
  content: string;
  nonce: string;
  publicKey: string;
}

export interface KeyExchangeRequest {
  clientId: string;
  publicKey: string;
}

export interface KeyExchangeResponse {
  serverPublicKey: string;
  sessionId: string;
}
