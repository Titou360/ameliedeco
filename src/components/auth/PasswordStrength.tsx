'use client';

import { Check, X } from 'lucide-react';
import { checkPassword } from '@/lib/auth/password-policy';
import { cn } from '@/utils/cn';

const RULES = [
  { key: 'length', label: 'Au moins 12 caractères' },
  { key: 'upper', label: 'Une lettre majuscule' },
  { key: 'lower', label: 'Une lettre minuscule' },
  { key: 'digit', label: 'Un chiffre' },
  { key: 'special', label: 'Un caractère spécial (!@#$…)' },
] as const;

/** Checklist en direct de la robustesse du mot de passe + égalité des saisies. */
export function PasswordStrength({ password, confirm }: { password: string; confirm: string }) {
  const checks = checkPassword(password);
  const match = password.length > 0 && password === confirm;

  const Item = ({ ok, label }: { ok: boolean; label: string }) => (
    <li className={cn('flex items-center gap-2 font-sans text-sm', ok ? 'text-green-700' : 'text-muted')}>
      {ok ? <Check size={16} strokeWidth={2} aria-hidden="true" /> : <X size={16} strokeWidth={2} aria-hidden="true" />}
      {label}
    </li>
  );

  return (
    <ul aria-live="polite" className="mt-3 space-y-1.5">
      {RULES.map((r) => <Item key={r.key} ok={checks[r.key]} label={r.label} />)}
      <Item ok={match} label="Les deux mots de passe sont identiques" />
    </ul>
  );
}
