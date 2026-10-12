'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export type VideoCardData = { slug: string; title: string; thumb: string; duration: string; src: string };

/** Links to the video page; with JavaScript the video opens in a dialog instead. */
export default function VideoCard({ video, heading: Heading = 'h3' }: { video: VideoCardData; heading?: 'h2' | 'h3' }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <>
      <Link
        className="vcard"
        href={`/video/${video.slug}/`}
        onClick={(event) => {
          if (!video.src || event.metaKey || event.ctrlKey || event.shiftKey) return;
          event.preventDefault();
          setOpen(true);
        }}
      >
        {/* The posters are soft video stills, so they sit blurred and darkened behind the text. */}
        <div className="vcard__media">
          {video.thumb && <Image src={video.thumb} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 25vw" />}
        </div>
        <div className="vcard__top">
          <span className="vcard__tag">Video</span>
          {video.duration && <span className="vcard__time">{video.duration}</span>}
        </div>
        <span className="vcard__play" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 22 22">
            <path d="M6 3.5v15l12-7.5z" fill="currentColor" />
          </svg>
        </span>
        <div className="vcard__content">
          <span className="label">Application</span>
          <Heading className="vcard__title">{video.title}</Heading>
        </div>
      </Link>

      <dialog
        ref={dialog}
        className="vdialog"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        {open && (
          <>
            <div className="vdialog__bar">
              <span className="vdialog__title">{video.title}</span>
              <button className="btn btn--light btn--sm" type="button" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <video src={video.src} controls playsInline autoPlay />
          </>
        )}
      </dialog>
    </>
  );
}
