/* eslint-disable react-refresh/only-export-components -- strength helper and component are intentionally co-located */
/**
 * @fileoverview Password strength indicator — bar + label + prose sentences.
 *
 * Phase 1 (weak): sentence describing what's still required.
 * Phase 2 (fair): all required rules met; suggestion sentence fades in.
 * Phase 3 (strong): nothing shown below the bar.
 *
 * Used in SignUpForm (new account) and AccountPage (password change).
 */
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { GlassCard } from '../GlassCard/GlassCard';
import './PasswordStrength.css';

const RULES = [
  { key: 'length', label: '8 or more characters', test: (pw: string) => pw.length >= 8 },
  { key: 'upper', label: 'an uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
  { key: 'lower', label: 'a lowercase letter', test: (pw: string) => /[a-z]/.test(pw) },
  { key: 'number', label: 'at least 1 numerical value', test: (pw: string) => /\d/.test(pw) },
  {
    key: 'special',
    label: 'at least 1 special character',
    test: (pw: string) => /[^a-zA-Z0-9]/.test(pw),
  },
] as const;

const SUGGESTIONS = [
  { key: 'long', label: '16 or more characters', test: (pw: string) => pw.length >= 16 },
  {
    key: 'multispecial',
    label: 'multiple special characters',
    test: (pw: string) => (pw.match(/[^a-zA-Z0-9]/g) ?? []).length >= 2,
  },
  {
    key: 'norepeats',
    label: 'no repeated characters in a row',
    test: (pw: string) => !/(.)\1{2,}/.test(pw),
  },
] as const;

type StrengthLevel = 'weak' | 'fair' | 'strong' | '';

const STRENGTH_LABEL: Record<Exclude<StrengthLevel, ''>, string> = {
  weak: 'Weak',
  fair: 'Okay',
  strong: 'Strong',
};

export function getStrength(pw: string): StrengthLevel {
  if (!pw) return '';
  const requiredPassed = RULES.filter((r) => r.test(pw)).length;
  if (requiredPassed < RULES.length) return 'weak';
  const suggestionsPassed = SUGGESTIONS.filter((s) => s.test(pw)).length;
  if (suggestionsPassed < SUGGESTIONS.length) return 'fair';
  return 'strong';
}

/** Intersperses bold labels with plain-text connectors into inline JSX. */
function joinBold(labels: string[], conjunction: string): ReactNode {
  return labels.map((label, i) => (
    <span key={label}>
      <strong>{label}</strong>
      {i < labels.length - 2 && ', '}
      {i === labels.length - 2 && (labels.length > 2 ? `, ${conjunction} ` : ` ${conjunction} `)}
    </span>
  ));
}

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface PasswordStrengthBarProps {
  password: string;
}

/**
 * Thin coloured bar that sits flush against the bottom edge of its nearest
 * `position: relative` ancestor (the password input wrapper). Render this
 * inside the wrapper so it spans the full input width.
 */
export function PasswordStrengthBar({ password }: PasswordStrengthBarProps): ReactElement | null {
  if (!password) return null;

  const ruleResults = RULES.map((r) => ({ ...r, passed: r.test(password) }));
  const suggestionResults = SUGGESTIONS.map((s) => ({ ...s, passed: s.test(password) }));
  const requiredPassed = ruleResults.filter((r) => r.passed).length;
  const suggestionsPassed = suggestionResults.filter((s) => s.passed).length;

  const fillPct =
    (requiredPassed / RULES.length) * 70 + (suggestionsPassed / SUGGESTIONS.length) * 30;

  const strength = getStrength(password);
  const barColor = strength !== '' ? `var(--ps-color-${strength})` : 'transparent';

  return (
    <div
      className="ps-bar ps-bar-inline"
      style={{ '--ps-fill': `${fillPct}%`, '--ps-fill-color': barColor } as CSSProperties}
    />
  );
}

/** Strength label + prose sentence(s) for a password field (no bar — use PasswordStrengthBar). */
export function PasswordStrength({
  password,
  className,
}: PasswordStrengthProps): ReactElement | null {
  const ruleResults = RULES.map((r) => ({ ...r, passed: r.test(password) }));
  const suggestionResults = SUGGESTIONS.map((s) => ({ ...s, passed: s.test(password) }));

  const missingRequired = ruleResults.filter((r) => !r.passed).map((r) => r.label);
  const missingSuggestions = suggestionResults.filter((s) => !s.passed).map((s) => s.label);
  const allRequired = missingRequired.length === 0;
  const allSuggestions = missingSuggestions.length === 0;
  const strength = getStrength(password);

  if (!password) return null;

  return (
    <GlassCard className={`ps-card ${className ?? ''}`.trim()} maxDeg={0}>
      {strength !== '' && (
        <div className="ps-strength-tag">
          <span className="ps-strength-text">{STRENGTH_LABEL[strength]} password</span>
        </div>
      )}

      {!allRequired && (
        <p className="ps-sentence">
          Your password might need {joinBold(missingRequired, 'as well as')}.
        </p>
      )}

      {allRequired && !allSuggestions && (
        <p className="ps-sentence">
          You could also try {joinBold(missingSuggestions, 'or')} for an even stronger password.
        </p>
      )}
    </GlassCard>
  );
}
