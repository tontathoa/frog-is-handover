'use client';

import { useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useRef } from 'react';
import { sendMessage, type FormState } from '@/app/actions';

const initial: FormState = { status: 'idle' };

export default function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, initial);
  const product = useSearchParams().get('product')?.slice(0, 80);
  const mounted = useRef(0);
  const elapsed = useRef<HTMLInputElement>(null);

  useEffect(() => {
    mounted.current = Date.now();
  }, []);

  if (state.status === 'ok') {
    return (
      <div className="notice notice--ok" role="status">
        <strong>Thank you.</strong> Your message has been sent — we will get back to you shortly.
      </div>
    );
  }

  const values = state.values ?? {};
  const errors = state.errors ?? {};
  const input = (name: 'name' | 'email' | 'company' | 'phone', label: string, type: string, required: boolean, autoComplete: string) => (
    <div className={`field${errors[name] ? ' has-error' : ''}`}>
      <label htmlFor={`f-${name}`}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={`f-${name}`}
        type={type}
        name={name}
        defaultValue={values[name] ?? ''}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `e-${name}` : undefined}
      />
      {errors[name] && (
        <p className="field__error" id={`e-${name}`}>
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <>
      {state.status === 'error' && state.message && (
        <div className="notice notice--error" role="alert">
          {state.message}
        </div>
      )}
      <form
        action={action}
        noValidate
        onSubmit={() => {
          if (elapsed.current) elapsed.current.value = String(Date.now() - mounted.current);
        }}
      >
        <input className="hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <input ref={elapsed} type="hidden" name="elapsed" defaultValue="" />
        <div className="field-row">
          {input('name', 'Name', 'text', true, 'name')}
          {input('email', 'Email', 'email', true, 'email')}
        </div>
        <div className="field-row">
          {input('company', 'Company', 'text', false, 'organization')}
          {input('phone', 'Phone', 'tel', false, 'tel')}
        </div>
        <div className={`field${errors.message ? ' has-error' : ''}`}>
          <label htmlFor="f-message">
            Message<span aria-hidden="true"> *</span>
          </label>
          <textarea
            id="f-message"
            name="message"
            rows={7}
            required
            defaultValue={values.message ?? (product ? `I would like more information about ${product}.` : '')}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? 'e-message' : undefined}
          />
          {errors.message && (
            <p className="field__error" id="e-message">
              {errors.message}
            </p>
          )}
        </div>
        <button className="btn btn--dark btn--wide" type="submit" disabled={pending}>
          {pending ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </>
  );
}
