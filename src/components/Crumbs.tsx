import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';

type Crumb = { label: string; href?: string };

/** Dark bar under the header: breadcrumb on the left, optional actions on the right. */
export default function Crumbs({ trail, children }: { trail: Crumb[]; children?: ReactNode }) {
  return (
    <div className="subbar">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/" aria-label="Home">
          <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 7.5L8 2l6 5.5V14H10v-4H6v4H2z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
        </Link>
        {trail.map((crumb, i) => (
          <Fragment key={crumb.label + i}>
            <span aria-hidden="true">/</span>
            {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <strong aria-current="page">{crumb.label}</strong>}
          </Fragment>
        ))}
      </nav>
      {children && <div className="subbar__actions">{children}</div>}
    </div>
  );
}
