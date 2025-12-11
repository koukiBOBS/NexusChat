import React, { useState } from 'react';
import { User } from '../types';
import { Mail, ArrowRight, Loader2, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      setStep('verify');
    }, 1500);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setIsLoading(true);
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        email,
        name,
        avatar: `https://picsum.photos/seed/${email}/200/200`
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
            <Mail size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">NexusChat</h1>
          <p className="text-gray-500 mt-2">
            {step === 'email' ? '登录以开始聊天' : '验证您的身份'}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">电子邮箱</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">显示名称</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="其他人看到的名称"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <>发送验证码 <ArrowRight size={20} className="ml-2" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
             <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4">
                我们已向 <strong>{email}</strong> 发送了验证码。
                <br />
                <span className="text-xs text-blue-600">(演示模式：请输入任意6位数字)</span>
             </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">验证码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors tracking-widest text-lg"
                  placeholder="123456"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-70"
            >
               {isLoading ? <Loader2 className="animate-spin" /> : '进入 NexusChat'}
            </button>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
            >
              返回修改邮箱
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;