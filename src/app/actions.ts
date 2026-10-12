'use server';

import { headers } from 'next/headers';
import { execute } from '@/lib/db';

export type FormState = {
  status: 'idle' | 'ok' | 'error';
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Small in-memory limiter: enough to stop a form being hammered from one address.
const hits = new Map<string, number[]>();
function tooMany(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > max;
}

async function clientIp(): Promise<string> {
  const list = await headers();
  return (list.get('x-forwarded-for')?.split(',')[0] ?? list.get('x-real-ip') ?? '').trim().slice(0, 64);
}

/** Honeypot filled, or submitted faster than a person can type: treat as a bot (but answer like a success). */
function looksAutomated(data: FormData): boolean {
  if (String(data.get('website') ?? '') !== '') return true;
  const elapsed = String(data.get('elapsed') ?? '');
  return elapsed !== '' && Number(elapsed) < 1500;
}

const field = (data: FormData, name: string, max: number) => String(data.get(name) ?? '').trim().slice(0, max);

export async function sendMessage(_previous: FormState, data: FormData): Promise<FormState> {
  const values = {
    name: field(data, 'name', 120),
    email: field(data, 'email', 190),
    company: field(data, 'company', 160),
    phone: field(data, 'phone', 40),
    message: field(data, 'message', 5000),
  };

  const errors: Record<string, string> = {};
  if (!values.name) errors.name = 'Please enter your name.';
  if (!EMAIL.test(values.email)) errors.email = 'Please enter a valid email address.';
  if (values.message.length < 10) errors.message = 'Please tell us a little more about your enquiry.';
  if (Object.keys(errors).length > 0) {
    return { status: 'error', message: 'Please check the highlighted fields.', errors, values };
  }

  if (looksAutomated(data)) return { status: 'ok' };

  const ip = await clientIp();
  if (tooMany(`message:${ip}`, 5, 10 * 60 * 1000)) {
    return { status: 'error', message: 'Too many messages in a short time. Please try again in a few minutes.', values };
  }

  try {
    await execute('INSERT INTO messages (name, email, company, phone, message, ip) VALUES (?, ?, ?, ?, ?, ?)', [
      values.name,
      values.email,
      values.company,
      values.phone,
      values.message,
      ip,
    ]);
  } catch (error) {
    console.error('contact form: could not store message', error);
    return { status: 'error', message: 'Your message could not be sent. Please email us directly.', values };
  }
  return { status: 'ok' };
}

export async function subscribe(_previous: FormState, data: FormData): Promise<FormState> {
  const email = field(data, 'email', 190).toLowerCase();
  if (!EMAIL.test(email)) {
    return { status: 'error', message: 'Please enter a valid email address.', values: { email } };
  }
  if (looksAutomated(data)) return { status: 'ok' };

  const ip = await clientIp();
  if (tooMany(`subscribe:${ip}`, 5, 10 * 60 * 1000)) {
    return { status: 'error', message: 'Please try again in a few minutes.', values: { email } };
  }

  try {
    await execute('INSERT IGNORE INTO subscribers (email, ip) VALUES (?, ?)', [email, ip]);
  } catch (error) {
    console.error('newsletter: could not store subscriber', error);
    return { status: 'error', message: 'Something went wrong. Please try again later.', values: { email } };
  }
  return { status: 'ok' };
}
