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

// WordPress left the FS-Bracket1 with its post id as slug (/product/22827/); next.config.ts redirects the old address.
FIXES.push({
  id: '2026-11-07-fs-bracket1-slug',
  products: [{ slug: '22827', newSlug: 'fs-bracket1', set: {} }],
});

// Partner feedback (WeChat, 2026-11-08): real product photos and data sheets for eight models, and FI-CC4 / FI-CC8
// are not Frog-is products. Photos in uploads/products/2026/11, data sheets in uploads/documents/2026/11.
const photos = (slug, ids) => ids.map((id, i) => `uploads/products/2026/11/${slug}-${i + 1}-${id}.jpg`);
const sheet = (slug) => [{ label: 'Data sheet', file: `uploads/documents/2026/11/${slug}-data-sheet.pdf` }];
const paragraphs = (...texts) => texts.map((text) => `<p>${text}</p>`).join('\n');
const table = (rows) => [{ title: '', rows }];

const LINE_ARRAY_APPLICATIONS = [
  'Houses of worship and churches',
  'Conference rooms and boardrooms',
  'Auditoriums and lecture halls',
  'Airports, train stations, and transportation hubs',
  'Shopping malls and retail centers',
  'Hotels and hospitality venues',
  'Museums and exhibition halls',
  'Educational facilities and classrooms',
  'Sports facilities and gymnasiums',
  'Any installation requiring clear, even long-throw coverage',
];
const lineArray = ({ model, woofers, response, rms, peak, sensitivity, splCont, splPeak, vertical, size, weight }) => ({
  description: paragraphs(
    `The ${model} is a professional aluminum line array column speaker designed for precise, long-throw sound reinforcement in challenging acoustic environments. Featuring ${woofers} high-performance 3.5-inch woofers paired with a single 1-inch horn tweeter, the ${model} delivers a symmetrical, even coverage area with exceptional clarity and intelligibility.`,
    'The linear sound source effect prevents sound energy from decaying over distance, projecting sound farther than conventional point-source speakers. This results in less variance between near and far listening areas, creating a more uniform sound field throughout the venue.',
    `With controlled vertical dispersion, sound is directed only to the target audience area, minimizing reflections from ceilings and floors. Even in spaces with long reverberation times or poor acoustic conditions, the ${model} delivers clear, articulate audio. The built-in frequency division circuit uses premium ERSE electronic components for superior sound quality.`,
  ),
  features: [
    `Line Array Column Design: ${woofers}× 3.5" woofers + 1× 1" horn tweeter arranged side by side for symmetrical, even coverage.`,
    'Long-Throw Linear Source: Linear sound source effect reduces energy decay over distance, projecting sound farther with uniform coverage.',
    `Controlled Vertical Dispersion: ${vertical}° vertical coverage directs sound only to the target area, minimizing ceiling/floor reflections.`,
    'Wide Horizontal Coverage: 140° horizontal dispersion for broad audience coverage.',
    'Feedback Suppression: Low sound pressure attenuation at distance prevents near-field hot spots, increasing safe gain before feedback.',
    'Premium Crossover: Built-in frequency division circuit using ERSE electronic components for high-quality sound output.',
    'Aluminum Enclosure: Acoustically simulated aluminum cabinet with closed-box design, fine-sand UV-resistant powder coating.',
    'Adjustable Mounting Bracket: Vertical and horizontal angle adjustment allows precise positioning for any installation requirement.',
    'Protective Grille: Solid steel mesh grille with powder coating and internal acoustic filter.',
  ],
  applications: LINE_ARRAY_APPLICATIONS,
  specs: table([
    ['Model', model],
    ['Product Type', 'Aluminum Line Array Column Speaker'],
    ['System Configuration', `${woofers}× 3.5" Woofers + 1× 1" Horn Tweeter`],
    ['Frequency Response (-10 dB)', response],
    ['Rated Power (RMS)', `${rms} (continuous pink noise, 100 hours)`],
    ['Peak Power', peak],
    ['Sensitivity (1 W / 1 m)', sensitivity],
    ['Maximum SPL (1 m) Continuous', splCont],
    ['Maximum SPL (1 m) Peak', splPeak],
    ['Coverage Angle (-6 dB, V × H)', `${vertical}° × 140°`],
    ['Low-Frequency Driver', `${woofers}× 3.5" woofer, ferrite magnetic circuit, cloth-edge paper cone, high-temperature voice coil, FEA-optimized magnet structure`],
    ['High-Frequency Driver', '1× 1" tweeter, lightweight Kapton™ voice coil former, FEA-optimized neodymium magnet structure'],
    ['Enclosure Material', 'Acoustically simulated aluminum, closed-box design'],
    ['Finish', 'Fine-sand powder coating, UV-resistant'],
    ['Grille', 'Solid steel mesh, powder coating, internal acoustic filter'],
    ['Mounting', 'Vertical & horizontal angle-adjustable mounting bracket'],
    ['Crossover', 'Built-in frequency division circuit, ERSE components'],
    ['Dimensions (H × W × D)', size],
    ['Net Weight', weight],
  ]),
});

FIXES.push({
  id: '2026-11-09-gabriel-photos-and-data-sheets',
  products: [
    {
      slug: 'fi-cb8',
      set: {
        subtitle: 'Single 8 inch Two-Way Coaxial Full-Range Loudspeaker',
        images: photos('fi-cb8', ['f2e3a2', 'f33330', '6cd020', '0d9cd1']),
        files: sheet('fi-cb8'),
        description: paragraphs(
          'The FI-CB8 is a compact, high-performance single 8-inch two-way coaxial full-range loudspeaker engineered for near-field sound reinforcement. It integrates a 1-inch imported titanium diaphragm compression driver with a 44 mm voice coil and a direct-radiating 8-inch low-frequency transducer with a 50 mm voice coil, both featuring ferrite magnet structures.',
          'The coaxial configuration eliminates the acoustic path difference between drivers found in conventional loudspeakers, delivering uniform tonal balance and consistent coverage in the near field. An aluminum horn coupled with the woofer cone forms a wide-dispersion exponential high-frequency horn with an 80° (H) × 80° (V) coverage pattern. Utilizing advanced wavelet analysis technology, the crossover and driver structure are optimized to ensure that high and low frequencies arrive at the listener simultaneously, producing a natural, coherent soundstage.',
        ),
        features: [
          'Coaxial two-way design with a single 8" woofer and 1" titanium diaphragm compression driver for uniform near-field dispersion.',
          'Imported titanium diaphragm high-frequency driver delivers metallic clarity, high power handling and low distortion with refined, elegant tonality.',
          'Coaxial driver arrangement eliminates inter-driver path difference, ensuring consistent timbre across the listening area.',
          'Aluminum exponential horn combined with the woofer cone provides a wide 80° (H) × 80° (V) coverage angle.',
          'Wavelet-optimized crossover and driver structure align high and low frequency arrival times for natural, phase-coherent reproduction.',
          'Ferrite magnet structures on both drivers for reliable, consistent performance.',
          '10 × M8 rigging points and base mount support flexible flying and stand-mount installation.',
          'Dual NL4MP speakON connectors with 1+/1– full-range input for reliable professional connectivity.',
          'Compact enclosure footprint ideal for space-critical installations.',
        ],
        applications: [
          'Classrooms and educational facilities',
          'Conference rooms and meeting spaces',
          'Music venues, restaurants and lounges',
          'Small-scale home theater main loudspeakers',
          'Fill and auxiliary loudspeakers',
          'Front-fill and under-balcony applications',
          'Surround sound channels',
        ],
        specs: table([
          ['Model', 'FI-CB8'],
          ['System Type', 'Single 8" Two-Way Coaxial Full-Range Loudspeaker'],
          ['Frequency Response', '91 Hz – 20 kHz (-10 dB)'],
          ['Sensitivity (1 W / 1 m)', '93 dB'],
          ['Nominal Impedance', '8 Ω'],
          ['Rated Power (AES)', '300 W'],
          ['Low-Frequency Driver', '1 × 8" ferrite woofer, 50 mm voice coil'],
          ['High-Frequency Driver', '1 × 1" throat ferrite compression driver, 44 mm voice coil, titanium diaphragm'],
          ['Nominal Coverage (H × V)', '80° × 80°'],
          ['Maximum SPL', '116 dB (continuous) / 122 dB (peak)'],
          ['Rigging Hardware', '10 × M8 rigging points, base mount'],
          ['Input Connectors', '2 × NL4MP 4-pin speakON, 1+/1– full-range input'],
          ['Material', 'Plywood cabinet'],
          ['Grille', 'Perforated metal'],
          ['Dimensions (W × D × H)', '28 × 20 × 28 cm'],
          ['Net Weight', '8 kg'],
        ]),
      },
    },
    {
      slug: 'fi-sub10u',
      set: {
        subtitle: '10 inch Ultra-Compact Subwoofer with Passive Radiator',
        images: photos('fi-sub10u', ['ddd292', 'c1d7b3', '1549fb', 'd4cb3b']),
        files: sheet('fi-sub10u'),
        description: paragraphs(
          'The FI-SUB10U is an ultra-compact 10-inch subwoofer designed to deliver powerful, articulate low-frequency reinforcement in space-constrained environments. Featuring a long-excursion 10-inch ferrite woofer with a 50 mm voice coil paired with a 10-inch passive radiator, it significantly reduces low-frequency harmonic distortion for clean, transparent bass reproduction.',
          'Housed in a precision CNC-machined plywood enclosure with tight-tolerance dado joinery, the cabinet exhibits exceptional rigidity and effectively suppresses panel resonance, resulting in solid, pure low-frequency performance. Its compact form factor and versatile mounting options allow flexible placement without occupying valuable floor space, making it ideal for home theater, entertainment rooms and conference facilities.',
        ),
        features: [
          'Ultra-compact enclosure design with multiple mounting options for flexible, space-saving placement.',
          'Built-in 10" long-excursion ferrite woofer with 50 mm voice coil for deep, dynamic bass output.',
          'Equipped with a 10" passive radiator to greatly reduce low-frequency harmonic distortion for clean, transparent bass.',
          'Precision CNC-machined cabinet with tight-tolerance dado joinery for maximum structural rigidity.',
          'Highly rigid enclosure effectively suppresses panel resonance, delivering solid and pure low-frequency performance.',
          'Extended frequency response down to 25 Hz for immersive low-end coverage.',
          'Professional Phoenix connector for reliable, secure signal connection.',
          '4 Ω nominal impedance for efficient amplifier matching.',
        ],
        applications: [
          'Home theater low-frequency reproduction',
          'Entertainment rooms and karaoke lounges',
          'Conference rooms and meeting spaces',
          'Compact commercial audio installations',
          'Multi-room residential audio systems',
        ],
        specs: table([
          ['Model', 'FI-SUB10U'],
          ['System Type', '10" Ultra-Compact Subwoofer With Passive Radiator'],
          ['Frequency Response', '25 Hz – 250 Hz'],
          ['Sensitivity (1 W / 1 m)', '90 dB'],
          ['Nominal Impedance', '4 Ω'],
          ['Rated Power (AES)', '400 W'],
          ['Low-Frequency Driver', '1 × 10" ferrite woofer, 50 mm voice coil'],
          ['Passive Radiator', '1 × 10" passive radiator'],
          ['Maximum SPL', '114 dB (continuous) / 120 dB (peak)'],
          ['Input Connector', '1 × professional Phoenix connector'],
          ['Material', 'Plywood cabinet'],
          ['Grille', 'Perforated metal'],
          ['Dimensions (W × D × H)', '62.4 × 19.5 × 34 cm'],
          ['Net Weight', '12 kg'],
        ]),
      },
    },
    // Text and data sheet were already right; only the photos change.
    { slug: 'fi-sub6a', set: { images: photos('fi-sub6a', ['cfa651', '4cba61', '731229', '2f4241']) } },
    {
      slug: 'fs4ip',
      set: {
        subtitle: 'Aluminum Line Array Column (4 × 3.5"), IP65',
        images: photos('fs4ip', ['c020c4', '1dd8e5', '2c140d', '93864c']),
        files: sheet('fs4ip'),
        ...lineArray({
          model: 'FS4IP', woofers: 4, response: '130 Hz – 20 kHz', rms: '100 W', peak: '200 W', sensitivity: '95 dB',
          splCont: '115 dB', splPeak: '118 dB', vertical: 40, size: '51.4 × 9.7 × 10.0 cm', weight: '3.5 kg',
        }),
      },
    },
    {
      slug: 'fs8ip',
      create: { collection: 'slimline-array-speaker-systems', product_line: 'performance', sort_order: 8, is_new: 1 },
      set: {
        title: 'FS8IP',
        subtitle: 'Aluminum Line Array Column (8 × 3.5"), IP65',
        images: photos('fs8ip', ['c05f40', '4b0ba1', 'ed9e66', '4386a8']),
        files: sheet('fs8ip'),
        ...lineArray({
          model: 'FS8IP', woofers: 8, response: '120 Hz – 20 kHz', rms: '200 W', peak: '400 W', sensitivity: '97 dB',
          splCont: '120 dB', splPeak: '123 dB', vertical: 38, size: '86.5 × 9.7 × 10.0 cm', weight: '6.8 kg',
        }),
      },
    },
    {
      slug: 'fi-sms8-b-w',
      create: { collection: 'point-source-speakers', product_line: 'installation', sort_order: 10, is_new: 1 },
      set: {
        title: 'FI-SMS8 (B/W)',
        subtitle: 'Two-way surface mount speaker, 8", IP65',
        images: photos('fi-sms8-b-w', ['8bb9cf', 'c34961', 'ff4fde', '444067']),
        files: sheet('fi-sms8-b-w'),
        description: paragraphs(
          'The FI-SMS8 (B/W) is a high-performance two-way surface mount loudspeaker engineered for demanding commercial and residential audio installations. Featuring an elegant, contemporary enclosure design constructed from rugged ABS material with a powder-coated aluminum mesh grille, this speaker delivers uncompromising sound quality across any installation environment, indoors or outdoors.',
          'At its core, a precision-engineered 8-inch polypropylene woofer paired with a 1-inch titanium diaphragm tweeter produces wide dynamic range, high-fidelity sound reproduction, and exceptional voice intelligibility. With a broad frequency response of 40 Hz to 20 kHz and a sensitivity rating of 95 dB (1 W / 1 m), the FI-SMS8 (B/W) ensures consistent, even coverage with rich, detailed audio at any listening distance.',
          'The included heavy-duty C-shaped mounting bracket offers multi-position installation flexibility, allowing precise aiming and secure mounting in any orientation. Rated IP65 for dust and water ingress protection, the FI-SMS8 (B/W) is built to withstand the rigors of outdoor and high-humidity environments while maintaining long-term reliability and performance.',
        ),
        features: [
          'Two-Way Coherent Design: 8-inch polypropylene woofer and 1-inch titanium tweeter work in harmony to deliver rich, detailed sound across the full audio spectrum.',
          'Wide Frequency Response: 40 Hz – 20 kHz coverage ensures deep, punchy bass and crisp, sparkling highs for music and speech reproduction.',
          'High Sensitivity: 95 dB (1 W / 1 m) sensitivity enables efficient, high-output performance with minimal amplifier power.',
          '120 W Power Handling: Robust power handling capacity for high-SPL applications and dynamic program material.',
          'IP65 Weather Protection: Fully sealed enclosure design provides reliable operation in rain, humidity, dust, and extreme temperature conditions.',
          'Rugged ABS Enclosure: High-strength ABS cabinet resists impact, UV degradation, and environmental wear for years of dependable service.',
          'Powder-Coated Aluminum Grille: Corrosion-resistant metal grille protects drivers while maintaining acoustic transparency.',
          'Heavy-Duty C-Bracket: Included multi-position C-shaped mounting bracket enables flexible, secure installation and precise directional aiming.',
          'Dual Finish Options: Available in Black or White to seamlessly integrate with any architectural décor.',
          'Wide & Consistent Coverage: Engineered dispersion pattern delivers uniform sound coverage throughout the listening area, minimizing hot spots and dead zones.',
        ],
        applications: [
          'Retail stores and shopping centers',
          'Restaurants, bars, and music cafes',
          'Health clubs, gyms, and fitness centers',
          'Theme parks and outdoor entertainment venues',
          'Educational facilities and campuses',
          'Hospitality: hotels, resorts, and lounges',
          'Leisure venues and public spaces',
          'Indoor/outdoor foreground and background music systems',
          'Public address and paging systems',
          'Multi-room residential audio installation',
        ],
        specs: table([
          ['Model', 'FI-SMS8 (B/W)'],
          ['System Type', 'Two-Way Surface Mount Loudspeaker'],
          ['Frequency Response', '40 Hz – 20 kHz'],
          ['Sensitivity', '95 dB (1 W / 1 m)'],
          ['Power Handling', '120 W'],
          ['Low-Frequency Driver', '8" Woofer, Polypropylene Cone'],
          ['High-Frequency Driver', '1" Driver, Titanium Diaphragm'],
          ['Enclosure Material', 'High-Strength ABS'],
          ['Grille', 'Powder-Coated Aluminum Mesh'],
          ['Weather Protection', 'IP65 Rated'],
          ['Mounting', 'Heavy-Duty C-Bracket (Included), Multi-Position'],
          ['Finish / Color', 'Black / White'],
          ['Dimensions (H × W × D)', '44.0 × 30.0 × 29.0 cm'],
          ['Net Weight', '7.72 kg'],
        ]),
      },
    },
    {
      slug: 'fi-gs6dx',
      create: { collection: 'point-source-speakers', product_line: 'installation', sort_order: 15, is_new: 1 },
      set: {
        title: 'FI-GS6DX',
        subtitle: 'All-weather landscape speaker, 70 V / 100 V',
        images: photos('fi-gs6dx', ['290958', '9679c4', '53c14a', '2ec934', 'ed763d']),
        files: sheet('fi-gs6dx'),
        description: paragraphs(
          'The FI-GS6DX is a premium all-weather landscape loudspeaker engineered for outdoor gardens, parks, resorts, and commercial landscapes. Designed to blend seamlessly into natural surroundings while delivering rich, full-range audio, this speaker features a rugged weather-resistant enclosure that withstands rain, snow, UV exposure, and extreme temperature fluctuations.',
          'At its heart, a 6.5-inch polypropylene cone woofer paired with a 1-inch PET tweeter produces clear, balanced sound with a frequency response of 75 Hz to 20 kHz. The built-in 70 V / 100 V constant voltage transformer with multiple power taps allows flexible integration into distributed audio systems, making it ideal for large-scale outdoor installations requiring consistent coverage across extended areas.',
          'The FI-GS6DX supports both above-ground and below-ground installation options, offering installers maximum flexibility in landscape design. With its 360-degree sound dispersion and durable construction, the FI-GS6DX delivers reliable, high-quality background music and paging for any outdoor environment.',
        ),
        features: [
          'All-Weather Durability: Rugged weather-resistant enclosure designed for permanent outdoor installation, resistant to rain, snow, UV, and temperature extremes.',
          '6.5" Polypropylene Woofer: High-quality P.P. cone woofer delivers warm, punchy bass with excellent weather resistance and long-term reliability.',
          '1" PET Tweeter: Polyethylene terephthalate dome tweeter provides crisp, detailed highs with smooth off-axis response.',
          '70 V / 100 V Constant Voltage: Built-in multi-tap transformer supports both 70 V and 100 V distributed audio systems for long cable runs and multi-speaker installations.',
          'Multiple Power Taps: 100 V: 60 W / 30 W / 15 W; 70 V: 60 W / 30 W / 15 W / 7.4 W, selectable via rear-panel switch for precise power matching.',
          '8 Ω Low-Impedance Mode: Also supports direct 8 Ω connection for low-impedance amplifier setups.',
          '360° Sound Dispersion: Omnidirectional radiation pattern provides even, consistent coverage across the listening area without hot spots.',
          'Dual Installation Options: Can be installed above ground on a mounting base or partially buried below ground level for a discreet, natural look.',
          'Wide Frequency Response: 75 Hz – 20 kHz coverage ensures rich, detailed reproduction of both music and speech.',
          'Landscape-Friendly Design: Low-profile form factor blends into garden settings while delivering professional-grade audio performance.',
        ],
        applications: [
          'Residential gardens, patios, and backyards',
          'Hotels, resorts, and pool areas',
          'Public parks, botanical gardens, and zoos',
          'Golf courses and country clubs',
          'Theme parks and outdoor entertainment venues',
          'Shopping mall outdoor plazas and courtyards',
          'Restaurants and cafes with outdoor seating',
          'Campus grounds and educational facilities',
          'Distributed background music and paging systems',
          'Outdoor weddings and event spaces',
        ],
        specs: table([
          ['Model', 'FI-GS6DX'],
          ['Product Type', 'All-Weather Landscape Speaker'],
          ['Low-Frequency Driver', '6.5" P.P. (Polypropylene) Cone Woofer'],
          ['High-Frequency Driver', '1" PET Tweeter'],
          ['Frequency Response', '75 Hz – 20 kHz'],
          ['Sensitivity', '80 dB'],
          ['Nominal Impedance', '8 Ω'],
          ['Power Tap (100 V Line)', '60 W / 30 W / 15 W (selectable)'],
          ['Power Tap (70 V Line)', '60 W / 30 W / 15 W / 7.4 W (selectable)'],
          ['Dispersion', '360° Omnidirectional'],
          ['Installation', 'Above-ground or below-ground level'],
          ['Dimensions (H × Diameter)', '52.0 × 33.0 cm'],
          ['Base Diameter', '27.0 cm'],
        ]),
      },
    },
    {
      slug: 'fi-mdx8',
      create: { collection: 'ceiling-speakers', product_line: 'installation', sort_order: 9, is_new: 1 },
      set: {
        title: 'FI-MDX8',
        subtitle: '3-way ceiling speaker with dual passive radiators',
        images: photos('fi-mdx8', ['db05af', '8bc9ee', 'e04b44', '587540', '15425e']),
        files: sheet('fi-mdx8'),
        description: paragraphs(
          'The FI-MDX8 is a high-performance 3-way ceiling loudspeaker engineered for premium background music and paging applications in commercial and residential spaces. Featuring an elegant, ultra-slim design with a built-in enclosure, this speaker delivers exceptional sound quality while maintaining a discreet, flush-mount profile that blends seamlessly into any ceiling.',
          'At its core, a high-quality fiber cone woofer is paired with a PEI film tweeter and dual passive radiators to produce rich, full-range audio with deep bass response and crisp highs. With a rated power of 80 W, a frequency response of 45 Hz to 20 kHz, and a sensitivity of 90 ± 3 dB, the FI-MDX8 delivers powerful, detailed sound that fills any room with clarity and warmth.',
          'The ultra-thin built-in chamber design ensures easy installation in standard ceiling cavities, while the precision-engineered crossover network guarantees coherent phase response and seamless driver integration. Ideal for hotels, restaurants, retail stores, offices, and high-end residential installations, the FI-MDX8 combines Italian design aesthetics with professional acoustic performance.',
        ),
        features: [
          '3-Way Acoustic Design: Fiber cone woofer, PEI film tweeter, and dual passive radiators work together for full-range, detailed sound reproduction.',
          '80 W High Power Handling: Robust 80 W rated power capacity delivers high-SPL performance for demanding commercial environments.',
          'Wide Frequency Response: 45 Hz – 20 kHz coverage ensures deep, impactful bass and sparkling, extended highs for music and speech.',
          'High Sensitivity: 90 ± 3 dB sensitivity enables efficient, high-output performance with minimal amplifier power.',
          'Dual Passive Radiators: Two 5090 passive radiators extend low-frequency response and enhance bass depth without increasing enclosure size.',
          'Ultra-Thin Built-In Chamber: Compact integrated enclosure design fits standard ceiling depths for quick, hassle-free installation.',
          'PEI Film Tweeter: High-quality PEI diaphragm tweeter delivers smooth, detailed high frequencies with excellent dispersion.',
          'Fiber Cone Woofer: Premium fiber cone woofer provides warm, natural midrange and tight, well-defined bass.',
          'Flush-Mount Aesthetics: Slim 90 mm depth with 232 mm outer diameter for a clean, discreet ceiling appearance.',
          'Italy Design: Italian-inspired design and engineering, combining elegant aesthetics with professional acoustic performance.',
        ],
        applications: [
          'Hotels, resorts, and hospitality venues',
          'Restaurants, cafes, and bars',
          'Retail stores and shopping centers',
          'Offices, boardrooms, and conference spaces',
          'Lobbies, atriums, and public areas',
          'Educational facilities and classrooms',
          'Healthcare facilities and waiting areas',
          'High-end residential multi-room audio',
          'Background music and paging systems',
          'Distributed commercial audio installations',
        ],
        specs: table([
          ['Model', 'FI-MDX8'],
          ['System Type', '3-Way Ceiling Loudspeaker'],
          ['Rated Power', '80 W'],
          ['Nominal Impedance', '8 Ω'],
          ['Frequency Response', '45 Hz – 20 kHz'],
          ['Sensitivity', '90 ± 3 dB'],
          ['Low-Frequency Driver', 'High-Quality Fiber Cone Woofer'],
          ['High-Frequency Driver', 'PEI Film Tweeter'],
          ['Passive Radiators', 'Dual 5090 Passive Radiators'],
          ['Enclosure', 'Built-In Ultra-Thin Chamber'],
          ['Cutout Diameter', '200 – 205 mm'],
          ['Outer Dimensions (D × H)', '232 × 90 mm'],
          ['Net Weight', '1.2 kg'],
          ['Packaging (1 pc)', 'Color box, 26 × 26 × 12.5 cm, 1.56 kg'],
          ['Packaging (10 pcs)', 'Carton, 65 × 31 × 56.5 cm, 16.72 kg'],
        ]),
      },
    },
    // Not Frog-is products: hidden (kept in the admin); next.config.ts sends the old addresses to Point source.
    { slug: 'fi-cc4', set: { is_active: 0 } },
    { slug: 'fi-cc8', set: { is_active: 0 } },
  ],
});

// Partner (WeChat, 2026-11-09 13:23): new photos for the FI-SUB10 / FI-SUB12 subs (new cabinet and badge). The rear
// shot is the passive SpeakON panel, so the active models get the other three; FI-SUB10A keeps its amplifier rear shot.
FIXES.push({
  id: '2026-11-09-fi-sub10-sub12-photos',
  products: [
    { slug: 'fi-sub10p', set: { images: photos('fi-sub10p', ['2614f0', '7f9955', 'b221ef', 'dc75a9']) } },
    { slug: 'fi-sub12p', set: { images: photos('fi-sub12p', ['28096b', '818128', 'c227a7', 'a0ac4b']) } },
    {
      slug: 'fi-sub10a',
      set: { images: [...photos('fi-sub10a', ['3cecb0', '2740b3', 'c87e7c']), 'uploads/products/2026/10/fi-sub10a-3-c59355.jpg'] },
    },
    { slug: 'fi-sub12a', set: { images: photos('fi-sub12a', ['b3c226', '63a017', 'b9c171']) } },
  ],
});

// Partner (WeChat, 2026-11-09 10:48): retouch the side "FROG-IS" out of the FI-SUB10U real photos (done for the
// FI-CB8 too, same cabinet family); the user also asked for a darker black level (gamma 1.5) on these photos.
FIXES.push({
  id: '2026-11-09-sub10u-cb8-retouched',
  products: [
    { slug: 'fi-sub10u', set: { images: photos('fi-sub10u', ['7e85f0', 'e0cb05', '55a8d7', 'e45086']) } },
    { slug: 'fi-cb8', set: { images: photos('fi-cb8', ['2a2c57', 'feec9a', '56b925', '7ebdd6']) } },
  ],
});

const JSON_COLUMNS = new Set(['images', 'files', 'features', 'applications', 'specs']);
const TEXT_COLUMNS = ['subtitle', 'description', 'features', 'applications', 'specs'];
const COLUMNS = new Set(['title', 'subtitle', 'description', 'sort_order', 'is_active', 'is_new', 'product_line', ...JSON_COLUMNS]);

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
    for (const { slug, newSlug, set, replace = [], create } of fix.products) {
      let [[row]] = await db.query('SELECT id FROM products WHERE slug = ?', [slug]);
      if (create) {
        // A new product: left alone if it already exists (e.g. added in the admin meanwhile).
        if (row) {
          notes.push(`${slug} already exists, skipped`);
          continue;
        }
        const { collection, ...extra } = create;
        const [[coll]] = await db.query('SELECT id FROM collections WHERE slug = ?', [collection]);
        if (!coll) throw new Error(`${fix.id}: collection ${collection} not found`);
        const [result] = await db.query(
          `INSERT INTO products (collection_id, slug, title, subtitle, description, images, files, features, applications, specs,
             is_active, is_new, product_line, sort_order, created_at, updated_at)
           VALUES (?, ?, ?, '', '', '[]', '[]', '[]', '[]', '[]', 1, ?, ?, ?, NOW(), NOW())`,
          [coll.id, slug, set.title ?? slug, extra.is_new ?? 0, extra.product_line ?? null, extra.sort_order ?? 0],
        );
        row = { id: result.insertId };
        notes.push(`${slug} created`);
      } else if (!row) {
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
      sets.push('updated_at = NOW()');
      await db.query(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`, [...values, row.id]);
      if (!create) notes.push(newSlug ? `${slug} -> ${newSlug}` : slug);
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
