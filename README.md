# Frog-is website

Rebuild of [frog-is.com](https://www.frog-is.com/) on **Next.js 16** (App Router, TypeScript) with a
**MySQL / MariaDB** content database and an admin panel at `/admin`.

The content (100 products, 8 collections, 9 news posts, downloads, application videos, contact details)
was pulled from the old WordPress site, loaded into the database, and is edited in the admin from here on.

## Run it locally

Needs Node 20.9+ and a running MySQL/MariaDB (XAMPP's MySQL is fine — Apache is not used).

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in the database login and a random `AUTH_SECRET`, then:

```bash
npm run db:setup
```

```bash
npm run db:import
```

```bash
npm run admin:user
```

```bash
npm run dev
```

- Site: <http://localhost:3000>
- Admin: <http://localhost:3000/admin/> — user `admin`; the generated password is written to
  `storage/admin-password.txt`. Change it after the first login (**Change password**) and delete that file.

`npm run admin:user -- <username> --ask` creates another admin or resets a password with one you type.

## Production

```bash
npm run build
```

```bash
npm run start
```

- The database must be reachable while building: public pages are pre-rendered from it.
- Pages are served from cache and refreshed automatically whenever something is saved in the admin.
- It needs a Node server (PM2, Docker, a VPS…). Files uploaded in the admin are written to
  `public/uploads/`, so that folder must be writable and must survive deployments.
- Set a fresh `AUTH_SECRET` per environment and serve the site over HTTPS.
- Set `SITE_URL` to the address the copy is served from. `SITE_NOINDEX=1` keeps a staging copy out of
  search engines (both are read at build time).

### Deploy files

| File | What |
| --- | --- |
| `ecosystem.config.js` | PM2 process `frogis-web`: `next start` on `127.0.0.1:3040` |
| `deploy/nginx-frogis.conf` | nginx site template (set `server_name`) → that port; serves `/uploads/` from disk |
| `deploy.sh` | Runs on the server: `git pull`, `npm ci`, `npm run build`, PM2 reload |

Not in git: `.env.local` (copy `.env.example`). The content database is `database/frogis-content.sql` and the media
is `public/uploads/`, both in git.

### Deploying a copy

1. Clone the repository on the server (Node 20.9+, MySQL 8 / MariaDB, PM2, nginx). `public/uploads/` comes with it.
2. Copy `.env.example` to `.env.local` and fill in the database login, a fresh `AUTH_SECRET` and `SITE_URL`.
3. Create the database and load the content: see *Handover: content database* below, then `npm run admin:user`.
4. Run `bash deploy.sh` from the app folder: it installs, builds and (re)starts the PM2 process.
5. Point nginx at it with `deploy/nginx-frogis.conf` (set `server_name`, add HTTPS with certbot).

Later updates: `git pull`, then `bash deploy.sh` again. Files uploaded through the admin are not tracked and survive it.

## Layout

| Path | What |
| --- | --- |
| `src/app/(site)/` | Public pages (home, products, product, news, applications, download, about, contact, search) |
| `src/app/admin/` | Admin screens; `src/components/admin/` holds their client components |
| `src/app/api/admin/` | Admin JSON API (session cookie required) |
| `src/app/actions.ts` | Contact + newsletter form handlers |
| `src/lib/content.ts` | Database reads used by the public pages |
| `src/lib/admin/` | Validation + database writes behind the admin API |
| `src/config/site.ts` | Site name, tagline, main navigation |
| `src/app/globals.css`, `src/app/admin/admin.css` | Site design / admin design |
| `database/schema.sql` | Tables (applied by `npm run db:setup`, safe to re-run) |
| `scripts/` | `db-setup`, `db-import`, `db:groups` (apply product lines), `admin-user` |
| `data/*.json` | Scraped content = seed for `db:import` |
| `public/uploads/` | Mirrored and uploaded images, data sheets, software, videos |
| `public/fonts/` | Archivo (SIL OFL), self-hosted |
| `tools/` | `scrape.py`, `build_images.py` (Python: `requests`, `beautifulsoup4`, `lxml`, `Pillow`) |
| `_legacy-php/` | The earlier plain-PHP version of this rebuild; no longer used, safe to delete |

URLs match the old WordPress site (`/product/<slug>/`, `/collection/<slug>/`, `/<post-slug>/`,
`/brochure/`, `/about-us/`, `/contact/`); old `/wp-content/uploads/...` links and `/?s=` searches redirect.

## Admin

Overview · Collections · Products (details, images, description, features, applications, specifications, documents) ·
Posts (editor, featured image, draft / published, publish date) · Application videos · Downloads ·
Messages (Contact form + newsletter sign-ups) · Settings (contact details, social networks, home page slides) · Change password.

Every product has a **line**: Installation, Performance, or Shared (both). It is set in the product's *Basic info* tab
and filtered on the website (All / Installation / Performance, shown where a list contains both lines). The home page
has one photo tile per line; they open `/products/installation/` and `/products/performance/`, the product list with
that line already switched on (the address follows the pill). Tile text and photos live in `src/lib/lines.ts` /
`public/img/lines/` (the same photos as the catalog openers). The starting
assignment, and the few products that moved to another collection, live in `data/product-groups.json`;
`npm run db:groups` re-applies it (it overwrites lines edited in the admin).

Rich text is sanitised on the server when saved. Product photos on a white background get an
automatically cropped copy (`public/uploads/_trim/`) that the product cards use.

The About page text is stored in the `settings` table (`about`) and has no editing screen yet.

## Handover: content database

`database/frogis-content.sql` is a dump of the current content: collections, products, posts, videos, downloads and
settings. `users`, `messages` and `subscribers` are in it without rows (no accounts, no personal data). Load it into an
empty database instead of running `db:import`, then create the first admin:

```bash
mysql -u <user> -p <database> < database/frogis-content.sql
```

```bash
npm run admin:user
```

Loads on MySQL 8.0 and MariaDB 10.4. It replaces the tables it contains. The database only holds the paths of images,
PDFs and videos; the files themselves are in `public/uploads/` (in git).

## Re-importing from frog-is.com

```bash
python tools/scrape.py --assets
```

```bash
python tools/build_images.py
```

```bash
npm run db:import -- --force
```

`db:import -- --force` **replaces** collections, products, posts, videos, downloads and settings with the
scraped data — anything edited in the admin since is lost. Without `--force` it refuses to touch a
database that already has content.
