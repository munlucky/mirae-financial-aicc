/**
 * T1-T3: 마스킹 유틸 테스트
 * 전화번호, 주민등록번호, 카드번호 마스킹 기능 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  maskPhoneNumber,
  maskSSN,
  maskCardNumber,
  maskAccountNumber,
  maskEmail,
  maskName,
  maskAddress,
  maskMiddle,
  isMasked,
  validateSSN,
  validateCardNumber,
  validateEmail,
} from './masking';

describe('maskPhoneNumber - T1: 전화번호 마스킹', () => {
  it('010-1234-5678를 010-****-5678로 마스킹', () => {
    expect(maskPhoneNumber('010-1234-5678')).toBe('010-****-5678');
  });

  it('01012345678를 010-****-5678로 마스킹 (숫자만 입력)', () => {
    expect(maskPhoneNumber('01012345678')).toBe('010-****-5678');
  });

  it('02-1234-5678를 02-****-5678로 마스킹 (지역번호)', () => {
    expect(maskPhoneNumber('02-1234-5678')).toBe('02-****-5678');
  });

  it('011-123-4567를 011-***-4567로 마스킹 (구형 휴대폰)', () => {
    expect(maskPhoneNumber('011-123-4567')).toBe('011-***-4567');
  });

  it('1577-1234를 1577-****로 마스킹 (대표번호)', () => {
    expect(maskPhoneNumber('1577-1234')).toBe('1577-****');
  });

  it('빈 문자열 처리', () => {
    expect(maskPhoneNumber('')).toBe('');
  });

  it('커스텀 마스킹 문자 사용', () => {
    expect(maskPhoneNumber('010-1234-5678', '#')).toBe('010-####-5678');
  });
});

describe('maskSSN - T2: 주민등록번호 마스킹', () => {
  it('123456-1234567를 123456-*******로 마스킹', () => {
    expect(maskSSN('123456-1234567')).toBe('123456-*******');
  });

  it('1234561234567를 123456-*******로 마스킹 (하이픈 없음)', () => {
    expect(maskSSN('1234561234567')).toBe('123456-*******');
  });

  it('잘못된 길이의 주민번호는 원본 반환', () => {
    const invalid = '123456-12345';
    expect(maskSSN(invalid)).toBe(invalid);
  });

  it('빈 문자열 처리', () => {
    expect(maskSSN('')).toBe('');
  });

  it('커스텀 마스킹 문자 사용', () => {
    expect(maskSSN('123456-1234567', '#')).toBe('123456-#######');
  });
});

describe('maskCardNumber - T3: 카드번호 마스킹', () => {
  it('1234-5678-1234-5678를 1234-****-****-5678로 마스킹', () => {
    expect(maskCardNumber('1234-5678-1234-5678')).toBe('1234-****-****-5678');
  });

  it('1234567812345678를 1234-****-****-5678로 마스킹 (하이픈 없음)', () => {
    expect(maskCardNumber('1234567812345678')).toBe('1234-****-****-5678');
  });

  it('16자리 카드번호 마스킹', () => {
    expect(maskCardNumber('1234567890123456')).toBe('1234-****-****-3456');
  });

  it('15자리 카드번호 (아메리칸 익스프레스) 마스킹', () => {
    expect(maskCardNumber('123456789012345')).toBe('1234-*******-2345');
  });

  it('잘못된 길이의 카드번호는 원본 반환', () => {
    const invalid = '12345678';
    expect(maskCardNumber(invalid)).toBe(invalid);
  });

  it('빈 문자열 처리', () => {
    expect(maskCardNumber('')).toBe('');
  });

  it('커스텀 마스킹 문자 사용', () => {
    expect(maskCardNumber('1234-5678-1234-5678', '#')).toBe('1234-####-####-5678');
  });
});

describe('maskAccountNumber: 계좌번호 마스킹', () => {
  it('계좌번호 뒤 4자리만 표시', () => {
    expect(maskAccountNumber('1234567890123')).toBe('*********0123');
  });

  it('표시할 자릿수 지정', () => {
    expect(maskAccountNumber('1234567890123', '*', 3)).toBe('**********123');
  });

  it('짧은 계좌번호는 원본 반환', () => {
    const short = '123';
    expect(maskAccountNumber(short)).toBe(short);
  });
});

describe('maskEmail: 이메일 마스킹', () => {
  it('example@example.com을 exa***@example.com으로 마스킹', () => {
    expect(maskEmail('example@example.com')).toBe('exa***@example.com');
  });

  it('a@example.com을 a***@example.com으로 마스킹 (짧은 로컬 파트)', () => {
    expect(maskEmail('a@example.com')).toBe('a***@example.com');
  });

  it('잘못된 형식은 원본 반환', () => {
    const invalid = 'invalidemail';
    expect(maskEmail(invalid)).toBe(invalid);
  });
});

describe('maskName: 이름 마스킹', () => {
  it('홍길동을 홍*동으로 마스킹', () => {
    expect(maskName('홍길동')).toBe('홍*동');
  });

  it('김수를 김*으로 마스킹 (2글자)', () => {
    expect(maskName('김수')).toBe('김*');
  });

  it('한글이 아니면 원본 반환', () => {
    const english = 'John';
    expect(maskName(english)).toBe(english);
  });

  it('1글자 이름은 그대로', () => {
    expect(maskName('김')).toBe('김');
  });
});

describe('maskAddress: 주소 마스킹', () => {
  it('동 이름 마스킹', () => {
    expect(maskAddress('서울시 강남구 역삼동 123-45')).toBe('서울시 강남구 **동 123-45');
  });
});

describe('maskMiddle: 범용 마스킹', () => {
  it('12345678을 12****78로 마스킹', () => {
    expect(maskMiddle('12345678', 2, 2)).toBe('12****78');
  });

  it('문자열 길이보다 큰 표시 길이는 원본 반환', () => {
    const str = 'abc';
    expect(maskMiddle(str, 2, 2)).toBe(str);
  });
});

describe('isMasked: 마스킹 감지', () => {
  it('연속된 * 3개 이상이면 마스킹으로 간주', () => {
    expect(isMasked('010-****-5678')).toBe(true);
  });

  it('마스킹되지 않은 문자열', () => {
    expect(isMasked('010-1234-5678')).toBe(false);
  });
});

describe('validateSSN: 주민등록번호 검증', () => {
  it('13자리 숫자면 유효', () => {
    expect(validateSSN('1234561234567')).toBe(true);
  });

  it('13자리가 아니면 유효하지 않음', () => {
    expect(validateSSN('123456')).toBe(false);
  });
});

describe('validateCardNumber: 카드번호 검증 (LUHN)', () => {
  it('유효한 카드번호', () => {
    // 테스트용 카드번호 (4242 4242 4242 4242 - Stripe 테스트 카드)
    expect(validateCardNumber('4242424242424242')).toBe(true);
  });

  it('잘못된 카드번호', () => {
    expect(validateCardNumber('1234567890123456')).toBe(false);
  });
});

describe('validateEmail: 이메일 검증', () => {
  it('유효한 이메일', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('잘못된 이메일', () => {
    expect(validateEmail('invalidemail')).toBe(false);
  });
});
