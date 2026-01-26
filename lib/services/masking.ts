/**
 * 민감정보 마스킹 서비스
 * 전화번호, 주민번호, 카드번호, 계좌번호 등의 민감정보를 마스킹 처리
 */

// ============================================================================
// 전화번호 마스킹
// ============================================================================

/**
 * 전화번호 마스킹
 * @param phone - 전화번호 (다양한 형식 지원)
 * @param maskChar - 마스킹 문자 (기본: '*')
 * @returns 마스킹된 전화번호
 *
 * @example
 * maskPhoneNumber('01012345678') // '010****5678'
 * maskPhoneNumber('010-1234-5678') // '010-****-5678'
 * maskPhoneNumber('02-1234-5678') // '02-****-5678'
 * maskPhoneNumber('1577-1234') // '1577-****'
 */
export const maskPhoneNumber = (phone: string, maskChar: string = '*'): string => {
  if (!phone) return '';

  // 하이픈이 있는 경우: 하이픈 위치 유지하며 마스킹
  if (phone.includes('-')) {
    const parts = phone.split('-');

    if (parts.length === 2) {
      // 15XX-XXXX 형태 (대표번호)
      return `${parts[0]}-${maskChar.repeat(parts[1].length)}`;
    } else if (parts.length === 3) {
      // 010-XXXX-XXXX, 02-XXXX-XXXX 형태
      // 가운데 부분만 마스킹
      return `${parts[0]}-${maskChar.repeat(parts[1].length)}-${parts[2]}`;
    }

    return phone;
  }

  // 하이픈이 없는 경우: 숫자 패턴 분석 후 포맷팅
  const digits = phone.replace(/\D/g, '');

  if (digits.length < 4) {
    return digits;
  }

  // 지역번호 (02)
  if (digits.startsWith('02')) {
    if (digits.length <= 6) {
      const prefix = digits.substring(0, 2);
      const suffix = digits.substring(2);
      return `${prefix}-${maskChar.repeat(suffix.length)}`;
    }
    const prefix = digits.substring(0, 2);
    const middle = digits.substring(2, 6);
    const suffix = digits.substring(6);
    return `${prefix}-${maskChar.repeat(middle.length)}-${suffix}`;
  }

  // 15XX, 16XX, 18XX (대표번호)
  if (/^15|^16|^18/.test(digits)) {
    if (digits.length === 4) {
      return digits;
    }
    const prefix = digits.substring(0, 4);
    const suffix = digits.substring(4);
    return `${prefix}-${maskChar.repeat(suffix.length)}`;
  }

  // 휴대폰/0XX 지역번호 (3자리 시작)
  if (digits.length <= 7) {
    const prefix = digits.substring(0, 3);
    const suffix = digits.substring(3);
    return `${prefix}-${maskChar.repeat(suffix.length)}`;
  }

  // 3-X-X 형식 (10자리: 011-XXX-XXXX)
  // 3-4-X 형식 (11자리: 010-XXXX-XXXX)
  const prefix = digits.substring(0, 3);
  const middleLength = digits.length === 10 ? 3 : 4;
  const middle = digits.substring(3, 3 + middleLength);
  const suffix = digits.substring(3 + middleLength);

  return `${prefix}-${maskChar.repeat(middle.length)}-${suffix}`;
};

// ============================================================================
// 주민등록번호 마스킹
// ============================================================================

/**
 * 주민등록번호 마스킹
 * @param ssn - 주민등록번호 (123456-1234567 또는 1234561234567)
 * @param maskChar - 마스킹 문자 (기본: '*')
 * @returns 마스킹된 주민등록번호
 *
 * @example
 * maskSSN('123456-1234567') // '123456-*******'
 * maskSSN('1234561234567') // '123456-*******'
 */
export const maskSSN = (ssn: string, maskChar: string = '*'): string => {
  if (!ssn) return '';

  // 숫자만 추출
  const digits = ssn.replace(/\D/g, '');

  if (digits.length !== 13) {
    return ssn; // 형식이 맞지 않으면 원본 반환
  }

  const front = digits.substring(0, 6);
  const back = maskChar.repeat(7);

  return `${front}-${back}`;
};

// ============================================================================
// 카드번호 마스킹
// ============================================================================

/**
 * 카드번호 마스킹
 * @param cardNumber - 카드번호 (1234567812345678 또는 1234-5678-1234-5678)
 * @param maskChar - 마스킹 문자 (기본: '*')
 * @returns 마스킹된 카드번호
 *
 * @example
 * maskCardNumber('1234567812345678') // '1234-****-****-5678'
 * maskCardNumber('1234-5678-1234-5678') // '1234-****-****-5678'
 */
export const maskCardNumber = (cardNumber: string, maskChar: string = '*'): string => {
  if (!cardNumber) return '';

  // 숫자만 추출
  const digits = cardNumber.replace(/\D/g, '');

  if (digits.length < 13 || digits.length > 19) {
    return cardNumber; // 형식이 맞지 않으면 원본 반환
  }

  const first4 = digits.substring(0, 4);
  const last4 = digits.substring(digits.length - 4);
  const middleLength = digits.length - 8;

  // 카드번호 길이에 따른 포맷 결정
  // 15자리: 4-7-4 (아메리칸 익스프레스)
  // 16자리: 4-4-4-4 (비자, 마스터카드 등)
  // 13-14자리: 4-4-4-1~2

  if (digits.length === 15) {
    // 4-7-4 형식
    const middle7 = digits.substring(4, 11);
    return `${first4}-${maskChar.repeat(middle7.length)}-${last4}`;
  }

  // 4-4-4-4 형식 또는 그 외
  const groups = [first4];
  let remainingMiddle = middleLength;

  // 두 번째 그룹 (항상 4자리 마스킹)
  const secondMaskLen = Math.min(4, remainingMiddle);
  groups.push(maskChar.repeat(secondMaskLen));
  remainingMiddle -= secondMaskLen;

  // 세 번째 그룹 (남은 중간부)
  if (remainingMiddle > 0) {
    const thirdMaskLen = Math.min(4, remainingMiddle);
    groups.push(maskChar.repeat(thirdMaskLen));
    remainingMiddle -= thirdMaskLen;
  }

  // 마지막 그룹
  groups.push(last4);

  return groups.join('-');
};

// ============================================================================
// 계좌번호 마스킹
// ============================================================================

/**
 * 계좌번호 마스킹
 * @param accountNumber - 계좌번호
 * @param maskChar - 마스킹 문자 (기본: '*')
 * @param visibleLength - 뒤에서 표시할 자릿수 (기본: 4)
 * @returns 마스킹된 계좌번호
 *
 * @example
 * maskAccountNumber('1234567890123') // '*********90123'
 * maskAccountNumber('1234567890123', '*', 3) // '**********0123'
 */
export const maskAccountNumber = (
  accountNumber: string,
  maskChar: string = '*',
  visibleLength: number = 4
): string => {
  if (!accountNumber) return '';

  // 숫자만 추출
  const digits = accountNumber.replace(/\D/g, '');

  if (digits.length <= visibleLength) {
    return accountNumber; // 표시할 길이보다 짧으면 원본 반환
  }

  const masked = maskChar.repeat(digits.length - visibleLength);
  const visible = digits.substring(digits.length - visibleLength);

  return masked + visible;
};

// ============================================================================
// 이메일 마스킹
// ============================================================================

/**
 * 이메일 마스킹
 * @param email - 이메일 주소
 * @param maskChar - 마스킹 문자 (기본: '*')
 * @returns 마스킹된 이메일
 *
 * @example
 * maskEmail('example@example.com') // 'exa***@example.com'
 * maskEmail('a@example.com') // 'a***@example.com'
 */
export const maskEmail = (email: string, maskChar: string = '*'): string => {
  if (!email) return '';

  const atIndex = email.indexOf('@');
  if (atIndex <= 0) {
    return email; // 형식이 맞지 않으면 원본 반환
  }

  const localPart = email.substring(0, atIndex);
  const domain = email.substring(atIndex);

  // 로컬 파트가 3글자 이상: 앞 3글자 표시, 최대 3글자 마스킹
  // 로컬 파트가 1-2글자: 첫글자 표시, 최소 3개 마스킹
  let maskedLocal: string;

  if (localPart.length >= 3) {
    const visible = localPart.substring(0, 3);
    // 최대 3글자만 마스킹 (나머지는 제거)
    maskedLocal = visible + maskChar.repeat(3);
  } else {
    // 1-2글자: 첫글자는 표시, 최소 3개 마스킹
    maskedLocal = localPart[0] + maskChar.repeat(3);
  }

  return maskedLocal + domain;
};

// ============================================================================
// 이름 마스킹
// ============================================================================

/**
 * 이름 마스킹
 * @param name - 이름
 * @param maskChar - 마스킹 문자 (기본: '*')
 * @returns 마스킹된 이름
 *
 * @example
 * maskName('홍길동') // '홍*동'
 * maskName('김') // '김'
 */
export const maskName = (name: string, maskChar: string = '*'): string => {
  if (!name) return '';

  // 한글 이름만 처리
  if (!/^[가-힣]+$/.test(name)) {
    return name; // 한글이 아니면 원본 반환
  }

  const len = name.length;

  if (len === 1) {
    return name; // 1글자는 그대로
  }

  if (len === 2) {
    return name[0] + maskChar; // 2글자: 홍*
  }

  // 3글자 이상: 첫글자 + 마스킹 + 마지막글자
  return name[0] + maskChar.repeat(len - 2) + name[len - 1];
};

// ============================================================================
// 주소 마스킹
// ============================================================================

/**
 * 주소 마스킹
 * @param address - 주소
 * @param maskChar - 마스킹 문자 (기본: '*')
 * @returns 마스킹된 주소
 *
 * @example
 * maskAddress('서울시 강남구 역삼동 123-45') // '서울시 강남구 **동 123-45'
 */
export const maskAddress = (address: string, maskChar: string = '*'): string => {
  if (!address) return '';

  // 동(洞) 또는 로(路) 부분 마스킹
  // 1-2글자 + '동' 또는 '로'로 끝나는 패턴 (예: 삼동, 역삼동)
  // 역삼동에서는 '삼동'만 매칭되도록 뒤에서부터 매칭
  const dongPattern = /([가-힣]{1,2})(동|로)(?=\s|$)/g;

  const result = address.replace(dongPattern, (match, prefix, suffix) => {
    // prefix(1-2글자)를 모두 마스킹하고 suffix(동/로)는 유지
    return maskChar.repeat(prefix.length) + suffix;
  });

  return result;
};

// ============================================================================
// 범용 마스킹 함수
// ============================================================================

/**
 * 문자열 중간 부분 마스킹
 * @param str - 원본 문자열
 * @param visiblePrefix - 앞에서 표시할 글자 수
 * @param visibleSuffix - 뒤에서 표시할 글자 수
 * @param maskChar - 마스킹 문자 (기본: '*')
 * @returns 마스킹된 문자열
 *
 * @example
 * maskMiddle('12345678', 2, 2) // '12****78'
 */
export const maskMiddle = (
  str: string,
  visiblePrefix: number,
  visibleSuffix: number,
  maskChar: string = '*'
): string => {
  if (!str) return '';

  const len = str.length;

  if (len <= visiblePrefix + visibleSuffix) {
    return str; // 전체 길이보다 표시할 길이가 크면 원본 반환
  }

  const prefix = str.substring(0, visiblePrefix);
  const suffix = str.substring(len - visibleSuffix);
  const masked = maskChar.repeat(len - visiblePrefix - visibleSuffix);

  return prefix + masked + suffix;
};

// ============================================================================
// 마스킹 감지 및 검증
// ============================================================================

/**
 * 문자열이 마스킹되어 있는지 확인
 * @param str - 확인할 문자열
 * @returns 마스킹 여부
 */
export const isMasked = (str: string): boolean => {
  if (!str) return false;
  // 연속된 *이 3개 이상이면 마스킹으로 간주
  return /\*{3,}/.test(str);
};

/**
 * 주민등록번호 형식 검증
 * @param ssn - 주민등록번호
 * @returns 유효 여부
 */
export const validateSSN = (ssn: string): boolean => {
  const digits = ssn.replace(/\D/g, '');
  return /^\d{13}$/.test(digits);
};

/**
 * 카드번호 형식 검증 (LUHN 알고리즘)
 * @param cardNumber - 카드번호
 * @returns 유효 여부
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '');

  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  // LUHN 알고리즘
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * 이메일 형식 검증
 * @param email - 이메일
 * @returns 유효 여부
 */
export const validateEmail = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};
