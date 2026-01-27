import React, { useState } from 'react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Modal } from '../Modal';
import { Eye, EyeOff, User, Lock, Fingerprint, AlertCircle, Info } from 'lucide-react';

// 입력 유효성 검증 함수
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: '비밀번호는 8자 이상이어야 합니다.' };
  }
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, message: '비밀번호에 영문자가 포함되어야 합니다.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '비밀번호에 숫자가 포함되어야 합니다.' };
  }
  return { valid: true };
};

interface Props {
  onLogin: () => void;
}

export const CustomerLogin: React.FC<Props> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('test@example.com');
  const [password, setPassword] = useState('test1234');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 입력값 검증
    let hasError = false;

    // 아이디(이메일) 검증
    if (!username.trim()) {
      setUsernameError('아이디를 입력해주세요.');
      hasError = true;
    } else if (!validateEmail(username)) {
      setUsernameError('올바른 이메일 형식이 아닙니다.');
      hasError = true;
    } else {
      setUsernameError('');
    }

    // 비밀번호 검증
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요.');
      hasError = true;
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        setPasswordError(passwordValidation.message || '비밀번호 형식이 올바르지 않습니다.');
        hasError = true;
      } else {
        setPasswordError('');
      }
    }

    // 검증 통과 시 로그인 처리
    if (!hasError) {
      onLogin();
    }
  };

  // 입력 시 에러 메시지 초기화
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (usernameError) setUsernameError('');
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) setPasswordError('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 sm:bg-gray-50">
      <div className="w-full max-w-[400px] sm:bg-white sm:p-8 sm:rounded-2xl sm:shadow-lg">
        {/* Logo Area */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg transform rotate-3">
             <span className="text-white text-2xl font-bold">M</span>
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 tracking-tight">AI 고객센터</h3>
          <p className="text-gray-500 text-sm mt-1">미래금융그룹</p>
        </div>

        {/* Form Area */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="아이디"
              placeholder="example@mail.com"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              icon={<User size={16} />}
            />
            {usernameError && (
              <p className="mt-1 text-xs text-red flex items-center gap-1">
                <AlertCircle size={12} />
                {usernameError}
              </p>
            )}
          </div>

          <div className="relative">
            <Input
              label="비밀번호"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              icon={<Lock size={16} />}
            />
            {passwordError && (
              <p className="mt-1 text-xs text-red flex items-center gap-1">
                <AlertCircle size={12} />
                {passwordError}
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[28px] text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <span className="text-xs text-gray-600 font-medium">아이디 저장</span>
            </label>
            <button type="button" onClick={() => setShowComingSoonModal(true)} className="text-xs text-primary font-medium hover:underline">비밀번호 찾기</button>
          </div>

          <Button type="submit" className="w-full mt-2" size="lg">
            로그인
          </Button>
        </form>

        {/* Social / Divider */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white sm:bg-white text-gray-500 text-xs">간편 로그인</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-4">
             <button
               type="button"
               onClick={() => setShowComingSoonModal(true)}
               className="w-11 h-11 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors"
             >
                <Fingerprint className="text-primary" size={24} />
             </button>
             <button
               type="button"
               onClick={() => setShowComingSoonModal(true)}
               className="w-11 h-11 rounded-full bg-[#FAE100] border border-[#FAE100] flex items-center justify-center hover:brightness-95 transition-colors font-bold text-[#371D1E]"
             >
                K
             </button>
             <button
               type="button"
               onClick={() => setShowComingSoonModal(true)}
               className="w-11 h-11 rounded-full bg-[#03C75A] border border-[#03C75A] flex items-center justify-center hover:brightness-95 transition-colors font-bold text-white"
             >
                N
             </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">계정이 없으신가요? <button type="button" onClick={() => setShowComingSoonModal(true)} className="text-primary font-bold hover:underline">회원가입</button></p>
        </div>
      </div>

      {/* 추후 개발 안내 모달 */}
      <Modal
        isOpen={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        title="알림"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Info className="text-blue-600" size={24} />
          </div>
          <p className="text-gray-700">해당 기능은 추후 개발 예정입니다.</p>
          <Button
            onClick={() => setShowComingSoonModal(false)}
            className="w-full"
            size="lg"
          >
            확인
          </Button>
        </div>
      </Modal>
    </div>
  );
};