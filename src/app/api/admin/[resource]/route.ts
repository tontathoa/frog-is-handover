import { NextResponse } from 'next/server';
import { ApiError, guard, notFoundError, publish, readBody, route } from '@/lib/api';
import { getResource } from '@/lib/admin';

type Context = { params: Promise<{ resource: string }> };

export const GET = route(async (request: Request, { params }: Context) => {
  await guard(request);
  const resource = getResource((await params).resource);
  if (!resource?.list) throw notFoundError();
  return NextResponse.json(await resource.list(new URL(request.url).searchParams));
});

export const POST = route(async (request: Request, { params }: Context) => {
  const user = await guard(request);
  const resource = getResource((await params).resource);
  if (!resource?.create) throw new ApiError(405, 'This action is not supported');
  const created = await resource.create(await readBody(request), user.id);
  publish();
  return NextResponse.json(created, { status: 201 });
});
