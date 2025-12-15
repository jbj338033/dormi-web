'use client';

import { forwardRef, useState, useEffect, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  showStrength?: boolean;
}

const getPasswordStrength = (password: string): { level: number; text: string; color: string } => {
  if (!password) return { level: 0, text: '', color: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, text: '약함', color: 'bg-red-500' };
  if (score <= 2) return { level: 2, text: '보통', color: 'bg-amber-500' };
  if (score <= 3) return { level: 3, text: '좋음', color: 'bg-sky-500' };
  return { level: 4, text: '강함', color: 'bg-emerald-500' };
};

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, id, showStrength, value, onFocus, onBlur, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      const handleKeyChange = (e: globalThis.KeyboardEvent) => {
        if (e.getModifierState) {
          setCapsLockOn(e.getModifierState('CapsLock'));
        }
      };

      window.addEventListener('keydown', handleKeyChange);
      window.addEventListener('keyup', handleKeyChange);

      return () => {
        window.removeEventListener('keydown', handleKeyChange);
        window.removeEventListener('keyup', handleKeyChange);
      };
    }, []);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const passwordValue = typeof value === 'string' ? value : '';
    const strength = showStrength ? getPasswordStrength(passwordValue) : null;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-zinc-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={showPassword ? 'text' : 'password'}
            value={value}
            className={cn(
              'w-full h-9 px-3 pr-10 text-sm bg-white border rounded-md',
              'placeholder:text-zinc-400',
              'focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1',
              'disabled:bg-zinc-50 disabled:cursor-not-allowed',
              error ? 'border-red-500' : 'border-zinc-200',
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-zinc-100 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-zinc-400" />
            ) : (
              <Eye className="h-4 w-4 text-zinc-400" />
            )}
          </button>
        </div>

        {capsLockOn && isFocused && (
          <div className="flex items-center gap-1.5 mt-1.5 text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="text-xs">Caps Lock이 켜져 있습니다</span>
          </div>
        )}

        {showStrength && passwordValue && strength && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors',
                    level <= strength.level ? strength.color : 'bg-zinc-200'
                  )}
                />
              ))}
            </div>
            <span
              className={cn('text-xs', {
                'text-red-600': strength.level === 1,
                'text-amber-600': strength.level === 2,
                'text-sky-600': strength.level === 3,
                'text-emerald-600': strength.level === 4,
              })}
            >
              {strength.text}
            </span>
          </div>
        )}

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
