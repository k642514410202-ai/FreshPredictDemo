import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Store, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { switchUser, currentUser, showToast } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickLogin = async (targetEmail: string) => {
    setIsSubmitting(true);
    await switchUser(targetEmail);
    setIsSubmitting(false);
    showToast(`Đã đăng nhập tài khoản: ${targetEmail}`);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');
        await switchUser(email);
        showToast('Đăng nhập thành công');
        onClose();
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, shopName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại');
        await switchUser(email);
        showToast('Đăng ký tài khoản thành công');
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              FP
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'login' ? 'Đăng nhập FreshPredict' : 'Tạo tài khoản mới'}
              </h3>
              <p className="text-[11px] text-slate-500">Dành riêng cho chủ quán ăn & cafe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Switcher Section */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Tài khoản mẫu có sẵn (Thử nghiệm 1-click):
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleQuickLogin('chusan@freshpredict.vn')}
              className="w-full text-left p-2.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50/70 transition flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span>Bác Sáng - Phở Gia Truyền 1986</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 rounded">
                    PRO
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">Hoàn Kiếm, Hà Nội • 10 nguyên liệu</div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </button>

            <button
              onClick={() => handleQuickLogin('caphesuada@freshpredict.vn')}
              className="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span>Anh Nam - Cà Phê Muối Đà Nẵng</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 rounded">
                    FREE
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">Hải Châu, Đà Nẵng • 8 nguyên liệu</div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Regular Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Họ và tên của bạn
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Sáng"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên quán của bạn
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Phở Bò Bát Đàn"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs"
                />
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email đăng nhập
            </label>
            <input
              type="email"
              required
              placeholder="tenban@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer mt-2"
          >
            {isSubmitting
              ? 'Đang xử lý...'
              : mode === 'login'
              ? 'Đăng nhập vào hệ thống'
              : 'Tạo tài khoản FreshPredict'}
          </button>

          <div className="pt-2 text-center text-slate-500 text-[11px]">
            {mode === 'login' ? (
              <span>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Đăng ký ngay
                </button>
              </span>
            ) : (
              <span>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Đăng nhập
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
