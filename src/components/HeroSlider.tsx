'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export type HeroSlide = { image: string; title?: string; text?: string; cta?: string; href?: string };

export default function HeroSlider({ slides, autoplay = 6500 }: { slides: HeroSlide[]; autoplay?: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  useEffect(() => {
    if (paused || count < 2 || !autoplay) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count);
    }, autoplay);
    return () => window.clearInterval(timer);
  }, [paused, count, autoplay, index]);

  const go = (next: number) => setIndex((next + count) % count);

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => {
        touchX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchX.current === null) return;
        const delta = event.changedTouches[0].clientX - touchX.current;
        if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {slides.map((slide, i) => {
        const active = i === index;
        const Title = i === 0 ? 'h1' : 'p';
        return (
          <div key={slide.image} className={`hero__slide${active ? ' is-active' : ''}`} aria-hidden={!active}>
            <Image
              src={slide.image}
              alt=""
              fill
              sizes="100vw"
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
            />
            {slide.title && (
              <div className="hero__content">
                <Title className="hero__title">{slide.title}</Title>
                {slide.text && <p className="hero__text">{slide.text}</p>}
                {slide.href && slide.cta && (
                  <Link className="btn btn--light btn--wide" href={slide.href} tabIndex={active ? 0 : -1}>
                    {slide.cta}
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}
      {count > 1 && (
        <div className="hero__dots">
          {slides.map((slide, i) => (
            <button
              key={slide.image}
              type="button"
              aria-label={`Slide ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => go(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
