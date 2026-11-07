// One-off corrections to product content, applied to an existing database.   npm run db:fixes
//
// deploy.sh runs this on every deploy. Each fix is applied once per database and then recorded in the
// content_fixes table, so later edits made in the admin are never overwritten by running it again.
// Fixes only touch the products they name, and only the columns they list (images only when a fix lists them).
import { connect } from './lib.mjs';

const plywoodRows = (rows) => [
  ...rows.filter(([label]) => !['IP Rating', 'Material', 'Color'].includes(label)),
  ['Material', 'Plywood cabinet, black textured finish'],
  ['Grille', 'Perforated metal'],
  ['Color', 'Black'],
];

const FIXES = [
  {
    // Partner feedback (WeChat, 2026-11-06): the speakers listed as FI-CC12 / FI-CC10 are the FI-CB8 / FI-CB10
    // (8 and 10 inch, there is no 12 inch), and the whole series is built in plywood, not 304 stainless steel.
    id: '2026-11-07-fi-cb-series-plywood',
    products: [
      {
        slug: 'fi-cc12',
        newSlug: 'fi-cb8',
        set: {
          title: 'FI-CB8',
          subtitle: '8 inch High Performance Coaxial Speaker',
          sort_order: 20,
          description:
            '<p>The FI-CB8 is a compact passive loudspeaker built around an 8-inch coaxial transducer: a ferrite magnet woofer with a 1-inch compression driver on the same axis, for a coherent point source with even coverage for voice and music.</p>' +
            '<p>The plywood cabinet with a black textured finish and a perforated metal grille is robust and acoustically inert, small and light, and quick to set up as a main speaker or as a fill.</p>',
          features: [
            '8 inch ferrite magnet woofer with 1 inch compression driver (coaxial)',
            '250 W power handling and up to 123 dB peak SPL',
            'Plywood cabinet with black textured finish and perforated metal grille',
            'Compact size and low weight, fast and easy setup',
            'Dual SpeakON NL4 for input and link',
          ],
          applications: ['Clubs, bars and restaurants, conference rooms, houses of worship, corporate and live events'],
          specs: [
            {
              title: '',
              rows: plywoodRows([
                ['Type', 'Passive loudspeaker'],
                ['Transducer', '8" ferrite magnet woofer with 1" compression driver (coaxial)'],
                ['Frequency Response', '75 Hz - 20 kHz (-10 dB)'],
                ['Maximum SPL', '123 dB (peak)'],
                ['Power Handling', '250 W'],
                ['Coverage', 'V.90° x H.90°'],
                ['Connectors', '2x SpeakON NL4 (input and link)'],
                ['Nominal Impedance', '8 Ω'],
                ['Dimensions (W x H x D)', '260 x 270 x 230 mm (10.2 x 10.6 x 9.1 in)'],
                ['Weight', '8 kg (17.6 lb)'],
              ]),
            },
          ],
        },
      },
      {
        slug: 'fi-cc10',
        newSlug: 'fi-cb10',
        set: {
          title: 'FI-CB10',
          subtitle: '10 inch High Performance Coaxial Speaker',
          sort_order: 21,
          description:
            '<p>The FI-CB10 is the larger model of the FI-CB series. A 10-inch ferrite magnet woofer with a 1-inch compression driver on the same axis gives a compact, high-output point source with controlled coverage and a fuller low end.</p>' +
            '<p>The plywood cabinet with a black textured finish and a perforated metal grille, the Phoenix and dual SpeakON NL4 connectors make it equally at home in fixed installations and in portable professional sound systems.</p>',
          features: [
            '10 inch ferrite magnet woofer with 1 inch compression driver (coaxial)',
            '350 W power handling and up to 127 dB peak SPL',
            'Plywood cabinet with black textured finish and perforated metal grille',
            'Phoenix connector and dual SpeakON NL4 for easy system integration',
            'Pairs with the FI-CB8 for main and fill coverage',
          ],
          applications: [
            'Live sound and events, clubs, auditoriums, houses of worship, fixed installations and portable professional sound systems',
          ],
          specs: [
            {
              title: '',
              rows: plywoodRows([
                ['Type', 'Passive loudspeaker'],
                ['Transducer', '10" ferrite magnet woofer with 1" compression driver (coaxial)'],
                ['Frequency Response', '65 Hz - 20 kHz (-10 dB)'],
                ['Maximum SPL', '127 dB (peak)'],
                ['Power Handling', '350 W'],
                ['Coverage', 'V.60° x H.90°'],
                ['Connectors', '1x Phoenix connector (4-pin Euroblock)<br>2x SpeakON NL4 (1+ 1- signal, 2+ 2- through)'],
                ['Nominal Impedance', '8 Ω'],
                ['Dimensions (W x H x D)', '310 x 320 x 260 mm (12.2 x 12.6 x 10.2 in)'],
                ['Weight', '11 kg (24.3 lb)'],
              ]),
            },
          ],
        },
      },
      {
        slug: 'fi-cc4',
        set: {
          description:
            '<p>FI-CC4 is a compact, high-performance full-range speaker built around a 4-inch neodymium driver. Its variable impedance (4 to 16 ohms) makes it easy to match to different amplifiers and installations, and the cabinet design reduces rear emission for better sound control and efficiency.</p>' +
            '<p>The plywood cabinet with a black textured finish and a perforated metal grille keeps it small and discreet, so the FI-CC4 suits fixed installations in hospitality, entertainment, theatres, broadcast, houses of worship and residential spaces.</p>',
          features: [
            '4 inch full-range driver with neodymium magnet',
            'Variable impedance: 4 ohm to 16 ohm, selectable',
            'Cabinet design reduces rear emission for better control and efficiency',
            'Plywood cabinet with black textured finish and perforated metal grille',
            'Wide 90° x 90° coverage',
            'Very compact: 112 x 112 x 95 mm, only 1.2 kg',
          ],
          specs: [
            {
              title: '',
              rows: plywoodRows([
                ['Type', 'Passive loudspeaker'],
                ['Transducer', '4" neodymium magnet full range driver'],
                ['Frequency Response', '150 Hz - 20 kHz (-6 dB), with dedicated preset'],
                ['Maximum SPL', '122 dB (peak)'],
                ['Power Handling', '140 W'],
                ['Coverage', 'V.90° x H.90°'],
                ['Connector', '1x Phoenix connector (4-pin Euroblock)'],
                ['Nominal Impedance', '4 Ω - 16 Ω selectable'],
                ['Dimensions (W x H x D)', '112 x 112 x 95 mm (4.4 x 4.4 x 3.7 in)'],
                ['Weight', '1.2 kg (2.65 lb)'],
              ]),
            },
          ],
        },
      },
      {
        slug: 'fi-cc8',
        set: {
          description:
            '<p>The FI-CC8 is a compact, reliable and high-performance passive loudspeaker designed to give clear and powerful sound in a wide range of applications. With an 8-inch ferrite magnet full-range dual-cone transducer, it delivers natural voice and music reinforcement with extended frequency response and high output levels.</p>' +
            '<p>It is built in a durable plywood cabinet with a black textured finish and a perforated metal grille, and offers versatile connectivity: a Phoenix connector (4-pin Euroblock with speaker relaunch) and dual SpeakON NL4 connectors. The 16 ohm nominal impedance allows several units to be connected in parallel from a single amplifier channel.</p>',
          features: [
            '8 inch ferrite magnet full-range dual-cone transducer',
            '300 W power handling and up to 129 dB peak SPL',
            'Natural voice and music reinforcement with extended frequency response',
            'Plywood cabinet with black textured finish and perforated metal grille',
            'Phoenix connector and dual SpeakON NL4 for easy system integration',
            '16 ohm impedance: several units can share one amplifier channel',
          ],
          applications: ['Live sound, hospitality and entertainment venues, fixed and portable professional sound systems'],
          specs: [
            {
              title: '',
              rows: plywoodRows([
                ['Type', 'Passive loudspeaker'],
                ['Transducer', '8" ferrite magnet full-range dual cone transducer'],
                ['Frequency Response', '120 Hz - 18 kHz (-6 dB), with dedicated preset'],
                ['Maximum SPL', '129 dB (peak)'],
                ['Power Handling', '300 W'],
                ['Coverage', 'V.90° x H.90°'],
                ['Connectors', '1x Phoenix connector (4-pin Euroblock) with speaker relaunch<br>2x SpeakON NL4 (1+ 1- signal, 2+ 2- through)'],
                ['Nominal Impedance', '16 Ω'],
                ['Dimensions (W x H x D)', '220 x 220 x 161 mm (8.7 x 8.7 x 6.3 in)'],
                ['Weight', '5.8 kg (14.3 lb)'],
              ]),
            },
          ],
        },
      },
      {
        // Only the material here; the model number changes in the next fix.
        slug: 'fi-sub210',
        set: {
          subtitle: '2x10 inch Passive Subwoofer',
          description:
            '<p>The FI-SUB210 is a compact powerhouse: a 10-inch ferrite magnet woofer and a 10-inch passive radiator deliver a precise bass response with high power and efficiency.</p>' +
            '<p>The plywood cabinet with a black textured finish and a perforated metal grille is robust and acoustically inert. With a frequency response from 40 Hz to 250 Hz it gives deep definition in the bass range. A passive low-pass filter is built in, so it can be driven without a dedicated preset for quick and easy installations. Movable rubber feet allow vertical, horizontal or up-firing placement, which makes it versatile from hospitality and corporate settings to residential use.</p>',
          features: [
            '10 inch ferrite magnet woofer plus 10 inch passive radiator',
            'Frequency response 40 Hz - 250 Hz',
            'Built-in passive low-pass filter: no dedicated preset needed',
            'Plywood cabinet with black textured finish and perforated metal grille',
            'Movable rubber feet for vertical, horizontal or up-firing placement',
          ],
          applications: ['Hospitality, corporate and residential installations, wherever a compact and powerful sub is needed'],
          specs: [
            {
              title: '',
              rows: plywoodRows([
                ['Type', 'Passive subwoofer'],
                ['Transducer', '10" ferrite magnet woofer + 10" passive radiator'],
                ['Frequency Response', '40 Hz - 150 Hz (-6 dB), with dedicated preset<br>40 Hz - 250 Hz, with the built-in passive low-pass filter (no preset)'],
                ['Maximum SPL', '124 dB (peak)'],
                ['Rated Power', '400 W (peak)'],
                ['Coverage', 'Omni'],
                ['Connector', '1x Phoenix connector (4-pin Euroblock)'],
                ['Nominal Impedance', '4 Ω'],
                ['Dimensions (W x H x D)', '560 x 282 x 150 mm (22.0 x 11.1 x 5.9 in)'],
                ['Weight', '13 kg (28.7 lb)'],
              ]),
            },
          ],
        },
      },
      {
        slug: 'fi-sub215',
        set: {
          subtitle: '2x15 inch Passive Subwoofer',
          description:
            '<p>The FI-SUB215 brings the same design to a larger size: a 15-inch ferrite magnet woofer and a 15-inch passive radiator for deeper bass and higher output, in a plywood cabinet with a black textured finish and a perforated metal grille.</p>' +
            '<p>A built-in passive low-pass filter lets it be driven without a dedicated preset, and movable rubber feet allow standing, down-firing or up-firing placement. It is a versatile partner for the FI-CC and FI-CB series in larger venues and events.</p>',
          features: [
            '15 inch ferrite magnet woofer plus 15 inch passive radiator',
            'Deep bass: frequency response down to 32 Hz',
            'Built-in passive low-pass filter: no dedicated preset needed',
            'Plywood cabinet with black textured finish and perforated metal grille',
            'Natural partner of the FI-CC and FI-CB series',
          ],
          applications: ['Larger venues, clubs and events that need deep, powerful low frequencies'],
          specs: [
            {
              title: '',
              rows: plywoodRows([
                ['Type', 'Passive subwoofer'],
                ['Transducer', '15" ferrite magnet woofer + 15" passive radiator'],
                ['Frequency Response', '32 Hz - 150 Hz (-6 dB), with dedicated preset<br>32 Hz - 250 Hz, with the built-in passive low-pass filter (no preset)'],
                ['Maximum SPL', '128 dB (peak)'],
                ['Rated Power', '800 W (peak)'],
                ['Coverage', 'Omni'],
                ['Connector', '1x Phoenix connector (4-pin Euroblock)'],
                ['Nominal Impedance', '4 Ω'],
                ['Dimensions (W x H x D)', '840 x 420 x 230 mm (33.1 x 16.5 x 9.1 in)'],
                ['Weight', '38 kg (83.8 lb)'],
              ]),
            },
          ],
        },
      },
    ],
  },
];

FIXES.push({
  // The partner's "FI-SUB12U, FI-SUB15U" was a typo: the subs are the 2x10 and 2x15 inch models, FI-SUB10U / FI-SUB15U.
  id: '2026-11-07-fi-sub-u-models',
  products: [
    { slug: 'fi-sub210', newSlug: 'fi-sub10u', set: { title: 'FI-SUB10U' }, replace: [['FI-SUB210', 'FI-SUB10U']] },
    { slug: 'fi-sub215', newSlug: 'fi-sub15u', set: { title: 'FI-SUB15U' }, replace: [['FI-SUB215', 'FI-SUB15U']] },
  ],
});

FIXES.push({
  // "2x10 / 2x15" is one real woofer plus one passive radiator, not two woofers: say so in the subtitle.
  id: '2026-11-07-fi-sub-u-radiator',
  products: [
    { slug: 'fi-sub10u', set: { subtitle: '10 inch Passive Subwoofer with 10 inch Passive Radiator' } },
    { slug: 'fi-sub15u', set: { subtitle: '15 inch Passive Subwoofer with 15 inch Passive Radiator' } },
  ],
});

// Logo-free renders (no FROG-IS emboss on the side) replace the main shots; the straight front shots stay.
const shots = (main, front) => ['uploads/products/2026/10/' + main, 'uploads/products/2026/10/' + front];
FIXES.push({
  id: '2026-11-07-fi-series-renders',
  products: [
    { slug: 'fi-cc4', set: { images: shots('fi-cc4-1-70c86e.jpg', 'fi-cc4-2-b0e97b.jpg') } },
    { slug: 'fi-cc8', set: { images: shots('fi-cc8-1-8f9131.jpg', 'fi-cc8-2-59bc9c.jpg') } },
    { slug: 'fi-cb8', set: { images: shots('fi-cb8-1-6c00d1.jpg', 'fi-cb8-2-3931a3.jpg') } },
    { slug: 'fi-cb10', set: { images: shots('fi-cb10-1-68c2e7.jpg', 'fi-cb10-2-8a278b.jpg') } },
    { slug: 'fi-sub10u', set: { images: shots('fi-sub10u-1-b1bd4d.jpg', 'fi-sub10u-2-a09e7c.jpg') } },
    { slug: 'fi-sub15u', set: { images: shots('fi-sub15u-1-49cf1f.jpg', 'fi-sub15u-2-9b12a9.jpg') } },
  ],
});

const JSON_COLUMNS = new Set(['images', 'files', 'features', 'applications', 'specs']);
const TEXT_COLUMNS = ['subtitle', 'description', 'features', 'applications', 'specs'];
const COLUMNS = new Set(['title', 'subtitle', 'description', 'sort_order', ...JSON_COLUMNS]);

const db = await connect();
await db.query(
  `CREATE TABLE IF NOT EXISTS content_fixes (
     id VARCHAR(100) NOT NULL PRIMARY KEY,
     applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
);
const [done] = await db.query('SELECT id FROM content_fixes');
const applied = new Set(done.map((row) => row.id));

let count = 0;
try {
  for (const fix of FIXES) {
    if (applied.has(fix.id)) continue;
    await db.beginTransaction();
    const notes = [];
    for (const { slug, newSlug, set, replace = [] } of fix.products) {
      const [[row]] = await db.query('SELECT id FROM products WHERE slug = ?', [slug]);
      if (!row) {
        notes.push(`${slug} not found, skipped`);
        continue;
      }
      if (newSlug) {
        const [[taken]] = await db.query('SELECT id FROM products WHERE slug = ?', [newSlug]);
        if (taken) throw new Error(`${fix.id}: cannot rename ${slug}, "${newSlug}" already exists`);
      }
      const entries = Object.entries(set);
      for (const [column] of entries) if (!COLUMNS.has(column)) throw new Error(`${fix.id}: unknown column ${column}`);
      const sets = entries.map(([column]) => `${column} = ?`);
      const values = entries.map(([column, value]) => (JSON_COLUMNS.has(column) ? JSON.stringify(value) : value));
      if (newSlug) {
        sets.push('slug = ?');
        values.push(newSlug);
      }
      // Text replacements (e.g. a model name mentioned in the copy) on the columns the fix does not set outright.
      for (const [from, to] of replace) {
        for (const column of TEXT_COLUMNS.filter((c) => !(c in set))) {
          sets.push(`${column} = REPLACE(${column}, ?, ?)`);
          values.push(from, to);
        }
      }
      await db.query(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`, [...values, row.id]);
      notes.push(newSlug ? `${slug} -> ${newSlug}` : slug);
    }
    await db.query('INSERT INTO content_fixes (id) VALUES (?)', [fix.id]);
    await db.commit();
    count += 1;
    console.log(`Applied ${fix.id}: ${notes.join(', ')}`);
  }
} catch (error) {
  await db.rollback();
  await db.end();
  throw error;
}
await db.end();
if (count === 0) console.log('Content fixes: nothing new to apply.');
