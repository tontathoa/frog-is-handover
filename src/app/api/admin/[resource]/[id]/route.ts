import { NextResponse } from 'next/server';
import { ApiError, guard, notFoundError, parseId, publish, readBody, route } from '@/lib/api';
import { getResource } from '@/lib/admin';

type Context = { params: Promise<{ resource: string; id: string }> };

export const GET = route(async (request: Request, { params }: Context) => {
  await guard(request);
  const { resource: name, id } = await params;
  const resource = getResource(name);
  if (!resource?.get) throw notFoundError();
  return NextResponse.json(await resource.get(parseId(id)));
});

/** Partial update: only the fields present in the JSON body are changed. */
const update = route(async (request: Request, { params }: Context) => {
  await guard(request);
  const { resource: name, id } = await params;
  const resource = getResource(name);
  if (!resource?.update) throw new ApiError(405, 'This action is not supported');
  await resource.update(parseId(id), await readBody(request));
  publish();
  return NextResponse.json({ success: true });
});

export const PUT = update;
export const PATCH = update;

export const DELETE = route(async (request: Request, { params }: Context) => {
  await guard(request);
  const { resource: name, id } = await params;
  const resource = getResource(name);
  if (!resource?.remove) throw new ApiError(405, 'This action is not supported');
  await resource.remove(parseId(id));
  publish();
  return NextResponse.json({ success: true });
});
