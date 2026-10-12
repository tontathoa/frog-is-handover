import { notFound } from 'next/navigation';

// Any URL no other route claims: render the site's 404 page (inside the site layout).
export default function CatchAll() {
  notFound();
}
