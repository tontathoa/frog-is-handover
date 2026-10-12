'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Horizontal scroll-snap strip with previous / next buttons. */
export default function Rail({ children, news = false }: { children: ReactNode; news?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      setAtStart(el.scrollLeft <= 2);
      setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 2);
    };
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener('scroll', update, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', update);
    };
  }, []);

  const move = (direction: number) => {
    const el = track.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <div className="rail">
      <div className={`rail__track${news ? ' rail__track--news' : ''}`} ref={track}>
        {children}
      </div>
      <button className="rail__btn rail__btn--prev" type="button" aria-label="Previous" disabled={atStart} onClick={() => move(-1)}>
        ‹
      </button>
      <button className="rail__btn rail__btn--next" type="button" aria-label="Next" disabled={atEnd} onClick={() => move(1)}>
        ›
      </button>
    </div>
  );
}
