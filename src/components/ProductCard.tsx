import Image from 'next/image';
import Link from 'next/link';
import { excerpt } from '@/lib/format';
import { productShot } from '@/lib/media';
import type { Product } from '@/lib/types';

type Props = {
  product: Product;
  /** Short collection name shown above the title. */
  label?: string;
  heading?: 'h2' | 'h3';
  compact?: boolean;
};

export default function ProductCard({ product, label = 'Product', heading: Heading = 'h3', compact = false }: Props) {
  const image = productShot(product.images[0]);
  return (
    <Link className={`pcard${compact ? ' pcard--compact' : ''}`} href={`/product/${encodeURIComponent(product.slug)}/`}>
      <div className="pcard__media">
        {image && (
          <Image
            src={image}
            alt={product.title}
            fill
            sizes={compact ? '(max-width: 640px) 72vw, (max-width: 1100px) 33vw, 25vw' : '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw'}
          />
        )}
      </div>
      <div className="pcard__body">
        <div className="pcard__top">
          <span className="label">{label}</span>
          <span className="pcard__brand" aria-hidden="true">
            FROG-IS
          </span>
        </div>
        <Heading className="pcard__title">{product.title}</Heading>
        <p className="pcard__sub">{product.subtitle}</p>
        {!compact && product.description && <p className="pcard__desc">{excerpt(product.description, 210)}</p>}
      </div>
    </Link>
  );
}
