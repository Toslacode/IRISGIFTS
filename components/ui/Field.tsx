'use client';

import { useId, type ComponentProps, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/* ==========================================================================
   Form controls.

   Every input carries a visible <label> — placeholders are hints, never
   labels. Errors sit next to the field they belong to and are announced
   politely, so nothing shouts at someone mid-typing.
   ========================================================================== */

const controlBase =
  'w-full rounded-card border bg-surface px-4 py-3 text-ink ' +
  'transition-[border-color,box-shadow] duration-200 ease-out-soft ' +
  'placeholder:text-ink-faint hover:border-line-strong ' +
  'focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25';

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: (props: {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': boolean | undefined;
  }) => ReactNode;
}

export function FieldShell({
  label,
  hint,
  error,
  optional,
  children,
}: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="flex items-baseline gap-2 text-[0.9375rem] font-semibold text-ink"
      >
        {label}
        {optional && (
          <span className="text-[0.8125rem] font-normal text-ink-muted">
            (לא חובה)
          </span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-[0.8125rem] leading-snug text-ink-muted">
          {hint}
        </p>
      )}

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-[0.8125rem] leading-snug text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface TextFieldProps extends Omit<ComponentProps<'input'>, 'id'> {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
}

export function TextField({
  label,
  hint,
  error,
  optional,
  className,
  ...props
}: TextFieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} optional={optional}>
      {(a11y) => (
        <input
          {...a11y}
          {...props}
          className={cn(
            controlBase,
            error ? 'border-danger' : 'border-line',
            className
          )}
        />
      )}
    </FieldShell>
  );
}

interface TextAreaFieldProps extends Omit<ComponentProps<'textarea'>, 'id'> {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  /** Shows "n / max" under the field. */
  maxLength?: number;
  value?: string;
}

export function TextAreaField({
  label,
  hint,
  error,
  optional,
  className,
  maxLength,
  value,
  ...props
}: TextAreaFieldProps) {
  const used = typeof value === 'string' ? value.length : 0;

  return (
    <FieldShell label={label} hint={hint} error={error} optional={optional}>
      {(a11y) => (
        <div className="flex flex-col gap-1.5">
          <textarea
            {...a11y}
            {...props}
            value={value}
            maxLength={maxLength}
            className={cn(
              controlBase,
              'min-h-36 resize-y leading-relaxed',
              error ? 'border-danger' : 'border-line',
              className
            )}
          />
          {maxLength && (
            <span
              className="text-[0.75rem] text-ink-faint"
              /* Count is decorative; the field itself is already labelled */
              aria-hidden="true"
            >
              {used} / {maxLength}
            </span>
          )}
        </div>
      )}
    </FieldShell>
  );
}

interface SelectFieldProps extends Omit<ComponentProps<'select'>, 'id'> {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
}

export function SelectField({
  label,
  hint,
  error,
  optional,
  className,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} optional={optional}>
      {(a11y) => (
        <select
          {...a11y}
          {...props}
          className={cn(
            controlBase,
            'cursor-pointer appearance-none bg-[length:1.1rem] bg-[position:left_1rem_center] bg-no-repeat pe-4 ps-10',
            error ? 'border-danger' : 'border-line',
            className
          )}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237c7568' stroke-width='1.6' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          }}
        >
          {children}
        </select>
      )}
    </FieldShell>
  );
}
