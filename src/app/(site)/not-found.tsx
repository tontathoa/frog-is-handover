import Link from 'next/link';

export const metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <div className="page-head page-head--tall">
      <p className="label">Error 404</p>
      <h1 className="display">Page not found</h1>
      <p className="page-head__lead">The page you are looking for has moved or no longer exists.</p>
      <p className="page-head__actions">
        <Link className="btn btn--dark btn--wide" href="/products/">
          Browse products
        </Link>
        <Link className="btn btn--outline btn--wide" href="/">
          Back to home
        </Link>
      </p>
    </div>
  );
}
