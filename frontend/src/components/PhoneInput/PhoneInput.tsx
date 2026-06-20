/**
 * @fileoverview Phone number input — "+XX" country-code text field + auto-formatted number field.
 *
 * Country code is a free-text input showing "+{1-2 digits}". The local number
 * is auto-formatted as (NXX) NXX-XXXX with a max of 10 digits.
 * Emits E.164 (+{code}{digits}) via onChange.
 */
import { useState } from 'react';
import type { ReactElement } from 'react';
import './PhoneInput.css';

function formatPhoneDigits(digits: string): string {
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function parseE164(e164: string): { countryCode: string; digits: string } {
  if (!e164) return { countryCode: '1', digits: '' };
  const stripped = e164.replace(/^\+/, '');
  // 12 chars → 2-digit country code + 10 local digits
  if (stripped.length === 12) {
    return { countryCode: stripped.slice(0, 2), digits: stripped.slice(2) };
  }
  // Otherwise treat first char as 1-digit country code
  return { countryCode: stripped.charAt(0) || '1', digits: stripped.slice(1, 11) };
}

interface PhoneInputProps {
  value: string;
  onChange: (e164: string) => void;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  required,
  disabled,
  autoFocus,
}: PhoneInputProps): ReactElement {
  const parsed = parseE164(value);
  const [countryCode, setCountryCode] = useState(parsed.countryCode);
  const [digits, setDigits] = useState(parsed.digits);

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const code = e.target.value.replace(/\D/g, '').slice(0, 2);
    setCountryCode(code);
    onChange(digits ? `+${code}${digits}` : '');
  }

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const newDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setDigits(newDigits);
    onChange(newDigits ? `+${countryCode}${newDigits}` : '');
  }

  return (
    <div className="phone-input">
      <input
        className="phone-input__code"
        type="text"
        inputMode="numeric"
        maxLength={3}
        value={`+${countryCode}`}
        onChange={handleCodeChange}
        disabled={disabled}
        aria-label="Country code"
      />
      <div className="phone-input__sep" />
      <input
        className="phone-input__number"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="(555) 000-0000"
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        value={formatPhoneDigits(digits)}
        onChange={handleNumberChange}
      />
    </div>
  );
}
