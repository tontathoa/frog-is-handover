import { collections, downloads, messages, subscribers, videos } from './catalog';
import { posts } from './posts';
import { products } from './products';

type Body = Record<string, unknown>;

/** What a resource may implement; the generic /api/admin/[resource] routes call into this. */
export type Resource = {
  list?: (params: URLSearchParams) => Promise<unknown>;
  get?: (id: number) => Promise<unknown>;
  create?: (body: Body, userId: number) => Promise<{ id: number }>;
  update?: (id: number, body: Body) => Promise<void>;
  remove?: (id: number) => Promise<void>;
};

const registry: Record<string, Resource> = { collections, products, posts, videos, downloads, messages, subscribers };

export function getResource(name: string): Resource | undefined {
  return Object.hasOwn(registry, name) ? registry[name] : undefined;
}
