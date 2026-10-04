import React from 'react';
import { Check, X } from 'lucide-react';
import { checkPasswordRules } from '../../utils/validators.ts';

interface PasswordValidationFeedbackProps {
  password: string;
}

export const PasswordValidationFeedback: React.FC<PasswordValidationFeedbackProps> = ({
  password,
}) => {
  const rules = checkPasswordRules(password);

  const items = [
    {
      label: '8 to 16 characters in length',
      valid: rules.hasLength,
    },
    {
      label: 'At least one uppercase letter (A-Z)',
      valid: rules.hasUppercase,
    },
    {
      label: 'At least one special character (!@#$%^&*...)',
      valid: rules.hasSpecialChar,
    },
  ];

  if (!password) {
    return (
      <div className="mt-1 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <p className="font-medium text-slate-800 mb-1">Password requirements:</p>
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1.5 text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mt-1 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 transition-all">
      <p className="font-medium text-slate-700 mb-1.5">Password requirements:</p>
      <div className="space-y-1">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              item.valid ? 'text-emerald-800' : 'text-slate-700'
            }`}
          >
            {item.valid ? (
              <Check className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
