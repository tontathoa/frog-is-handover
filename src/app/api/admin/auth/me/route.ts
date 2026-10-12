import { NextResponse } from 'next/server';
import { guard, route } from '@/lib/api';

export const GET = route(async (request: Request) => NextResponse.json({ user: await guard(request) }));
