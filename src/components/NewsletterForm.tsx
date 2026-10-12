'use client';

import { useActionState, useEffect, useRef } from 'react';
import { subscribe, type FormState } from '@/app/actions';

const initial: FormState = { status: 'idle' };

export default function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, initial);
  const mounted = useRef(0);
  const elapsed = useRef<HTMLInputElement>(null);

  useEffect(() => {
    mounted.current = Date.now();
  }, []);

  if (state.status === 'ok') {
    return (
      <p className="notice notice--ok" role="status">
        Thank you — you are subscribed.
      </p>
    );
  }

  return (
    <>
      <p>Frog-is news and new products, by email.</p>
      <form
        className="newsletter"
        action={action}
        onSubmit={() => {
          if (elapsed.current) elapsed.current.value = String(Date.now() - mounted.current);
        }}
      >
        <input className="hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <input ref={elapsed} type="hidden" name="elapsed" defaultValue="" />
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          placeholder="Email address"
          required
          autoComplete="email"
          defaultValue={state.values?.email ?? ''}
        />
        <button className="btn btn--dark" type="submit" disabled={pending}>
          {pending ? 'Sending…' : 'Subscribe'}
        </button>
      </form>
      {state.status === 'error' && (
        <p className="notice notice--error" role="alert">
          {state.message}
        </p>
      )}
    </>
  );
}
