'use client';

import Image from 'next/image';
import { useState } from 'react';

/** Product gallery: large stage, arrows and thumbnails. */
export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const go = (next: number) => setIndex((next + count) % count);

  return (
    <div
      className="pdp__gallery"
      onKeyDown={(event) => {
        if (count < 2) return;
        if (event.key === 'ArrowLeft') go(index - 1);
        if (event.key === 'ArrowRight') go(index + 1);
      }}
    >
      <div className="pdp__stage">
        {count > 0 && (
          <Image
            key={images[index]}
            src={images[index]}
            alt={title}
            fill
            sizes="(max-width: 960px) 100vw, 66vw"
            loading="eager"
            fetchPriority="high"
          />
        )}
        {count > 1 && (
          <>
            <button className="pdp__arrow pdp__arrow--prev" type="button" aria-label="Previous image" onClick={() => go(index - 1)}>
              ‹
            </button>
            <button className="pdp__arrow pdp__arrow--next" type="button" aria-label="Next image" onClick={() => go(index + 1)}>
              ›
            </button>
          </>
        )}
      </div>
      {count > 1 && (
        <div className="pdp__thumbs">
          {images.map((image, i) => (
            <button
              key={image}
              type="button"
              className={`pdp__thumb${i === index ? ' is-active' : ''}`}
              aria-label={`Image ${i + 1}`}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
            >
              <Image src={image} alt="" fill sizes="78px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
