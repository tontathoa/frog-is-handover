export type ProductFile = { label: string; file: string };

/** The product lines; a product without a line is shared by all of them. */
export type ProductLine = 'installation' | 'performance' | 'portable';
export type SpecSection = { title: string; rows: string[][] };

export type Product = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  /** Sanitised HTML. */
  description: string;
  /** Paths relative to the site root, e.g. "uploads/2025/03/FI-SUB12IP-1.jpg". */
  images: string[];
  files: ProductFile[];
  features: string[];
  applications: string[];
  specs: SpecSection[];
  /** Slug of the collection the product belongs to. */
  collection: string | null;
  isNew: boolean;
  /** Installation, Performance or Portable; null = shared by all lines. */
  line: ProductLine | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Collection = {
  id: number;
  slug: string;
  name: string;
  short: string;
  icon: string | null;
  iconHover: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  /** Sanitised HTML. */
  content: string;
  image: string | null;
  isPublished: boolean;
  publishedAt: string;
  updatedAt: string;
};

export type Video = {
  id: number;
  slug: string;
  title: string;
  thumb: string | null;
  duration: string;
  video: string | null;
  embed: string | null;
  description: string;
  sortOrder: number;
  isActive: boolean;
  publishedAt: string;
};

export type Download = {
  id: number;
  title: string;
  file: string | null;
  remote: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type Slide = { image: string; title: string; text: string; cta: string; href: string };
export type AboutSection = { layout: 'full' | 'left' | 'right'; title: string; html: string; image: string | null };
export type ContactInfo = {
  intro: string;
  address: string[];
  phones: { label: string; number: string }[];
  emails: { label: string; email: string }[];
};
export type Social = { network: string; href: string };
