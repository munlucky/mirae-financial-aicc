/**
 * E2EE (End-to-End Encryption) 서비스
 * TweetNaCl.js 기반 메시지 암호화/복호화
 */

import { box, randomBytes, BoxKeyPair, BoxKeyPairSecretKey, BoxKeyPairSecretKeyBox, BoxKeyPairSecretKeyOpen } from 'tweetnacl';
import { createLogger } from '../utils/logger';

const logger = createLogger('Encryption');

/**
 * 키 쌍 생성
 */
export const generateKeyPair = (): BoxKeyPair => {
  return box.keyPair();
};

/**
 * 공개키 내보내기 (Uint8Array → Base64)
 */
export const encodeBase64 = (data: Uint8Array): string => {
  let binary = '';
  const bytes = new Uint8Array(data);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * 공개키 불러오기 (Base64 → Uint8Array)
 */
export const decodeBase64 = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

/**
 * 메시지 암호화
 * @param message - 평문 메시지
 * @param publicKeyBase64 - 수신자 공개키 (Base64)
 * @returns 암호화된 메시지 (Base64)
 */
export const encryptMessage = (message: string, publicKeyBase64: string): string => {
  try {
    const nonce = randomBytes(box.nonceLength);
    const publicKey = decodeBase64(publicKeyBase64);

    const messageBytes = new TextEncoder().encode(message);
    const encrypted = box(messageBytes, nonce, publicKey);

    // nonce + encrypted message 결합
    const combined = new Uint8Array(nonce.length + encrypted.length);
    combined.set(nonce);
    combined.set(encrypted, nonce.length);

    return encodeBase64(combined);
  } catch (error) {
    logger.error('Encryption error:', error);
    throw new Error('메시지 암호화 실패');
  }
};

/**
 * 메시지 복호화
 * @param encryptedMessageBase64 - 암호화된 메시지 (Base64)
 * @param secretKey - 송신자 비밀키
 * @returns 복호화된 평문 메시지
 */
export const decryptMessage = (encryptedMessageBase64: string, secretKey: BoxKeyPairSecretKey): string => {
  try {
    const combined = decodeBase64(encryptedMessageBase64);

    // nonce 추출 (前 24바이트)
    const nonce = combined.slice(0, box.nonceLength);
    const encrypted = combined.slice(box.nonceLength);

    const decrypted = box.open(encrypted, nonce, secretKey);

    if (!decrypted) {
      throw new Error('복호화 실패: 잘못된 키 또는 손상된 데이터');
    }

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    logger.error('Decryption error:', error);
    throw new Error('메시지 복호화 실패');
  }
};

/**
 * 키 쌍을 문자열로 변환 (저장용)
 */
export const stringifyKeyPair = (keyPair: BoxKeyPair): {
  publicKey: string;
  secretKey: string;
} => {
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    secretKey: encodeBase64(keyPair.secretKey),
  };
};

/**
 * 문자열을 키 쌍로 변환 (로딩용)
 */
export const parseKeyPair = (keys: { publicKey: string; secretKey: string }): BoxKeyPair => {
  return {
    publicKey: decodeBase64(keys.publicKey),
    secretKey: decodeBase64(keys.secretKey),
  };
};

/**
 * 키 교환을 위한 키 쌍 생성 및 반환
 * 클라이언트에서 생성하여 서버에 공개키 전송
 */
export const createClientKeys = (): {
  keyPair: BoxKeyPair;
  publicKeyBase64: string;
} => {
  const keyPair = generateKeyPair();
  const publicKeyBase64 = encodeBase64(keyPair.publicKey);

  return {
    keyPair,
    publicKeyBase64,
  };
};

/**
 * E2EE 서비스 인터페이스
 */
export const e2eeService = {
  generateKeyPair,
  encryptMessage,
  decryptMessage,
  stringifyKeyPair,
  parseKeyPair,
  createClientKeys,
};
