import React, { useState } from 'react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Eye, EyeOff, User, Lock, Fingerprint } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

export const CustomerLogin: React.FC<Props> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
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
          <Input 
            label="아이디" 
            placeholder="example@mail.com" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<User size={16} />}
          />
          
          <div className="relative">
            <Input 
              label="비밀번호" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
            />
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
            <a href="#" className="text-xs text-primary font-medium hover:underline">비밀번호 찾기</a>
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
             <button className="w-11 h-11 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Fingerprint className="text-primary" size={24} />
             </button>
             <button className="w-11 h-11 rounded-full bg-[#FAE100] border border-[#FAE100] flex items-center justify-center hover:brightness-95 transition-colors font-bold text-[#371D1E]">
                K
             </button>
             <button className="w-11 h-11 rounded-full bg-[#03C75A] border border-[#03C75A] flex items-center justify-center hover:brightness-95 transition-colors font-bold text-white">
                N
             </button>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">계정이 없으신가요? <a href="#" className="text-primary font-bold hover:underline">회원가입</a></p>
        </div>
      </div>
    </div>
  );
};