/* eslint-disable react-refresh/only-export-components -- strength helper and component are intentionally co-located */
/**
 * @fileoverview Password strength indicator — bar + label + disappearing rules + suggestions.
 *
 * Phase 1 (weak): "Required" section listed; bar fills red → amber as each passes.
 * Phase 2 (fair): all required rules met; "Suggestions" section fades in.
 * Phase 3 (strong): all suggestions met too; bar goes fully green.
 *
 * Used in SignUpForm (new account) and AccountPage (password change).
 */
import type { CSSProperties, ReactElement } from 'react';
import { GlassCard } from '../GlassCard/GlassCard';
import './PasswordStrength.css';

const RULES = [
  { key: 'length', label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
  { key: 'lower', label: 'One lowercase letter', test: (pw: string) => /[a-z]/.test(pw) },
  { key: 'number', label: 'One number', test: (pw: string) => /\d/.test(pw) },
  {
    key: 'special',
    label: 'One special character',
    test: (pw: string) => /[^a-zA-Z0-9]/.test(pw),
  },
] as const;

const SUGGESTIONS = [
  {
    key: 'long',
    label: '16 or more characters',
    test: (pw: string) => pw.length >= 16,
  },
  {
    key: 'multispecial',
    label: 'Multiple special characters',
    test: (pw: string) => (pw.match(/[^a-zA-Z0-9]/g) ?? []).length >= 2,
  },
  {
    key: 'norepeats',
    label: 'No repeated characters in a row',
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

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

/** Strength bar + two-phase disappearing checklist for a password field. */
export function PasswordStrength({
  password,
  className,
}: PasswordStrengthProps): ReactElement | null {
  const ruleResults = RULES.map((r) => ({ ...r, passed: r.test(password) }));
  const suggestionResults = SUGGESTIONS.map((s) => ({ ...s, passed: s.test(password) }));

  const requiredPassed = ruleResults.filter((r) => r.passed).length;
  const suggestionsPassed = suggestionResults.filter((s) => s.passed).length;
  const allRequired = requiredPassed === RULES.length;
  const allSuggestions = suggestionsPassed === SUGGESTIONS.length;

  const fillPct = password
    ? (requiredPassed / RULES.length) * 70 + (suggestionsPassed / SUGGESTIONS.length) * 30
    : 0;

  const strength = getStrength(password);
  const barColor = strength !== '' ? `var(--ps-color-${strength})` : 'transparent';

  if (!password) return null;

  return (
    <GlassCard className={`ps-card ${className ?? ''}`.trim()} maxDeg={0}>
      <div
        className="ps-bar"
        style={{ '--ps-fill': `${fillPct}%`, '--ps-fill-color': barColor } as CSSProperties}
      />

      {/* Strength label — shown whenever a password is entered */}
      {password && strength !== '' && (
        <div className="ps-strength-tag">
          <span className="ps-strength-text">{STRENGTH_LABEL[strength]} password</span>
        </div>
      )}

      {/* Required section — removed from the DOM once every rule is satisfied */}
      {password && !allRequired && (
        <div className="ps-section">
          <p className="ps-label">Required</p>
          <ul aria-label="Password requirements">
            {ruleResults
              .filter((r) => !r.passed)
              .map((r) => (
                <li key={r.key} className="ps-rule">
                  <span className="ps-rule-bullet" aria-hidden="true" />
                  {r.label}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Suggestions section — appears once required is done, disappears once all suggestions pass */}
      {password && allRequired && !allSuggestions && (
        <div className="ps-suggestions">
          <p className="ps-label">Suggestions</p>
          <ul aria-label="Password suggestions">
            {suggestionResults
              .filter((s) => !s.passed)
              .map((s) => (
                <li key={s.key} className="ps-rule">
                  <span className="ps-rule-bullet" aria-hidden="true" />
                  {s.label}
                </li>
              ))}
          </ul>
        </div>
      )}
    </GlassCard>
  );
}
