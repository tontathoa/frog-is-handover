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
  `storage/admin-password.txt`. Change it after the first login (**Đổi mật khẩu**) and delete that file.

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
- Set `SITE_URL` to the address the copy is served from. `SITE_NOINDEX=1` keeps a demo copy out of
  search engines (both are read at build time).

### Deploy files

| File | What |
| --- | --- |
| `ecosystem.config.js` | PM2 process `frogis-web`: `next start` on `127.0.0.1:3040` |
| `deploy/nginx-frogis.conf` | nginx site for `example.com` → that port; serves `/uploads/` from disk |
| `deploy.sh` | Runs on the server: `git pull`, `npm ci`, `npm run build`, PM2 reload |

Not in git, so copied to the server by hand: `.env.local`, `public/uploads/` and the database content.

```bash
ssh deploy-host "bash /var/www/frogis/deploy.sh"
```

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
| `scripts/` | `db-setup`, `db-import`, `admin-user` |
| `data/*.json` | Scraped content = seed for `db:import` |
| `public/uploads/` | Mirrored and uploaded images, data sheets, software, videos |
| `public/fonts/` | Archivo (SIL OFL), self-hosted |
| `tools/` | `scrape.py`, `build_images.py` (Python: `requests`, `beautifulsoup4`, `lxml`, `Pillow`) |
| `_legacy-php/` | The earlier plain-PHP version of this rebuild; no longer used, safe to delete |

URLs match the old WordPress site (`/product/<slug>/`, `/collection/<slug>/`, `/<post-slug>/`,
`/brochure/`, `/about-us/`, `/contact/`); old `/wp-content/uploads/...` links and `/?s=` searches redirect.

## Admin

Dashboard · Danh mục · Sản phẩm (thông tin, hình ảnh, mô tả, tính năng, ứng dụng, thông số, tài liệu) ·
Bài viết (soạn thảo, hình đại diện, nháp / đăng, ngày đăng) · Video ứng dụng · Tài liệu tải về ·
Tin nhắn (form Contact + đăng ký nhận tin) · Cài đặt (liên hệ, mạng xã hội, slide trang chủ) · Đổi mật khẩu.

Rich text is sanitised on the server when saved. Product photos on a white background get an
automatically cropped copy (`public/uploads/_trim/`) that the product cards use.

The About page text is stored in the `settings` table (`about`) and has no editing screen yet.

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
