// All site copy and image paths live here so the site can be edited in one place.

export const contact = {
  email: 'tannbiki@paindane.com',
  // 071 360 8554 – one number for calls and WhatsApp
  phone: '+27 71 360 8554',
  phoneHref: 'tel:+27713608554',
  whatsapp: 'https://wa.me/27713608554',
  facebook: 'https://www.facebook.com/p/Tan-n-Biki-at-Paindane-61576954640114/',
  instagram: 'https://www.instagram.com/tan_n_biki',
  address: 'VFXX+F6H, Guinjala, Mozambique',
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=Paindane+VFXX+F6H+Guinjala+Mozambique',
  lat: -24.10117856868916,
  lng: 35.49808783943367,
};

export const brand = {
  name: 'Tan ‘n Biki',
  logo: '/images/logo.webp',
  tagline: 'Paindane Resort & Pleasure Bay Resort',
};

// Hero headline over the resort photos
export const heroHeading = {
  eyebrow: 'Paindane & Pleasure Bay · Mozambique',
  lines: ['Sun, sea &', 'barefoot bliss'],
  sub: 'Beachfront chalets, campsites and coral reefs on Mozambique’s Inhambane coast.',
};

// Lines revealed by passing light as the hero dives under the sea
export const diveLines = ['Dive into Mozambique', 'Turquoise water, coral reefs & sea safaris', 'Your holiday starts at Paindane & Pleasure Bay'];

/** Menu links: sections of the home page by id, or a page of their own via href */
export const nav: { id: string; label: string; href?: string }[] = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'paindane', label: 'Paindane' },
  { id: 'pleasure-bay', label: 'Pleasure Bay' },
  { id: 'gallery', label: 'Gallery', href: '/gallery.html' },
  { id: 'accommodation', label: 'Accommodation' },
  { id: 'contact', label: 'Enquire Now' },
];

export const heroSlides = [
  '/images/hero/hero-1.jpg',
  '/images/hero/hero-2.jpg',
  '/images/hero/hero-3.jpg',
  '/images/hero/hero-4.jpg',
];

const g = (f: string) => `/images/gallery/${f}`;

export const welcome = {
  title: 'Tan ‘n Biki – Mozambique',
  paragraphs: [
    'Stretching along the sunlit shores of southeastern Africa, Mozambique beckons travellers with its pristine beaches, turquoise waters, and warm, vibrant culture. Whether you dream of exploring coral-fringed islands, savouring fresh seafood beneath swaying palm trees, or immersing yourself in the rhythm of bustling markets and historic towns, Mozambique offers a holiday experience unlike any other. Welcome to a land where natural beauty and heartfelt hospitality create memories that will linger long after the tides have gone out.',
  ],
  highlight: 'Our resorts are under new management and being renovated for an even better holiday experience.',
};

export type Link = { label: string; href: string };

export type Feature = {
  /** Short name for the topic chips in the Explore section */
  label: string;
  title?: string;
  body: string[];
  list?: string[];
  image: string;
  imageSide: 'left' | 'right';
  tone: 'navy' | 'light' | 'sand';
  /** Optional trailing paragraph with inline links. */
  links?: { before: string; items: { text: string; link: Link; after: string }[] };
  subheading?: string;
  subLink?: { before: string; link: Link; after: string };
  footnote?: string;
};

export const welcomeFeatures: Feature[] = [
  {
    label: 'About Mozambique',
    title: 'About Mozambique',
    body: [
      'Mozambique, with its stunning coastline along the Indian Ocean, offers a paradise for tourists seeking both relaxation and adventure. The ocean resorts in Mozambique are renowned for their pristine beaches, crystal-clear waters, and vibrant marine life. Whether you’re looking to unwind on the sandy shores or explore the underwater wonders, Mozambique’s ocean resorts have something for everyone.',
    ],
    image: g('757480401_2021007731832123_8169523890536478803_n.jpeg'),
    imageSide: 'right',
    tone: 'navy',
  },
  {
    label: 'Activities',
    title: 'Activities in the area',
    body: ['Here are some of the main activities that tourists can enjoy at these resorts:'],
    list: [
      'Snorkeling and Scuba Diving: Discover the rich marine biodiversity and colorful coral reefs.',
      'Fishing: Experience deep-sea fishing and catch a variety of fish species.',
      'Water Sports: Engage in thrilling activities like jet skiing, windsurfing, and kiteboarding.',
      'Pansy Island and Survivor Island tours: Explore the beautiful islands and enjoy secluded beaches.',
      'Sea Safaris: Take guided tours to see dolphins, whales, and other marine life.',
      'Cultural Experiences: Immerse yourself in the local culture with traditional music, and cuisine.',
    ],
    image: g('608816846_122145400730898488_5800414235495499328_n.jpg'),
    imageSide: 'left',
    tone: 'light',
  },
  {
    label: 'Getting here',
    title: 'Getting here safely',
    body: [
      'For your added peace of mind, we are members of DriveMoz and have created our own Zello channel so that all guests can communicate and recieve guidance on their journey to our resorts.',
      'It’s important to keep in contact with other cars while driving to Mozambique to ensure safety, coordinate travel plans, and stay informed about road conditions and potential hazards.',
    ],
    links: {
      before: 'Read more about ',
      items: [
        { text: '', link: { label: 'DriveMoz', href: 'https://www.drivemoz.co.za/home' }, after: ' or download the ' },
        { text: '', link: { label: 'Zello', href: 'https://zello.com/downloads/' }, after: ' app.' },
      ],
    },
    subheading: 'Top TRAVEL tips TO MOZAMBIQUE',
    subLink: {
      before: 'Read our top travel tips ',
      link: { label: 'here', href: '/Hot-Tips-for-Traveling-in-Mozambique.pdf' },
      after: ' so that its smooth sailing.',
    },
    image: g('706971156_122163753326898488_5659330505378723359_n.jpg'),
    imageSide: 'right',
    tone: 'sand',
  },
];

export const paindaneFeatures: Feature[] = [
  {
    label: 'The resort',
    title: 'Tan ‘n Biki @ Paindane Beach Resort',
    body: [
      'Tan ‘n Biki @ Paindane Beach Resort (Praia de Paindane) is situated 28 km South of Inhambane and is nestled amongst plantations of Coconut palms and miles of sun-bleached beaches. The last 4km is a thick sand track, 4×4 or Diff Lock recommended.',
    ],
    image: g('707098616_122163753320898488_5135170916882484444_n.jpg'),
    imageSide: 'left',
    tone: 'navy',
  },
  {
    label: 'Chalets & camping',
    title: 'Luxury self-catering chalets',
    body: [
      'Luxury self-catering chalets with air conditioning and own pool, as well as basic rustic chalets and campsites, are on the dunes and just a stone’s throw from the beach. On selected campsites, baraccas are available for hire. The baraccas are cool traditional shelters with modern clean ablutions, electrical plug points, and water.',
      'Paindane Resort offers self catering or full board accommodation units that include: Fridge/Freezer, Gas Stove, Gas Geyser, Cutlery and Crockery, All Bedding And Mosquito Nets',
    ],
    footnote: '* Towels are not supplied.',
    image: g('735483072_889300770894414_119153830828480387_n.jpeg'),
    imageSide: 'right',
    tone: 'light',
  },
];

export const pleasureBayFeatures: Feature[] = [
  {
    label: 'The resort',
    title: 'Tan ‘n Biki @ Pleasure Bay Resort',
    body: [
      'Pleasure Bay Resort offers various self catering accommodation options which are situated on the dunes overlooking Paindane Beach and Lighthouse Reef about 30 kilometers south of Inhambane, Mozambique. It is the ideal destination for your Scuba Diving, Fishing, Adventure or Beach Holiday!',
    ],
    image: g('715472419_122164900544898488_6577615120319739180_n.jpg'),
    imageSide: 'right',
    tone: 'navy',
  },
  {
    label: 'Rustic houses',
    title: 'Rustic self-catering houses',
    body: [
      'Nestled on the edge of the beach, rustic self-catering houses offer an idyllic retreat for those seeking tranquillity and charm. The gentle sound of waves lapping against the shore serves as a soothing backdrop, while large windows frame breathtaking views of the sea and sky. These rural self-catering houses provide a unique blend of rustic elegance and seaside serenity.',
      'Pleasure Bay offers self catering or full board accommodation units that include: Fridge/Freezer, Gas Stove, Gas Geyser, Cutlery and Crockery, All Bedding And Mosquito Nets.',
    ],
    footnote: '* Towels are not supplied.',
    image: g('706971156_122163753326898488_5659330505378723359_n.jpg'),
    imageSide: 'left',
    tone: 'light',
  },
];

export const gallery: string[] = [
  '657228076_122156935496898488_1864773361443252039_n.jpg',
  '712623699_122164480910898488_4223045975821870272_n.jpg',
  '690743571_122161614758898488_450162191001755392_n.jpg',
  '745282927_3996649443975357_65738744875295824_n.jpeg',
  '731808268_1692198578614931_3844923428205432591_n.jpeg',
  '741258292_1660614798356932_5286632092324504130_n.jpeg',
  '688356653_122161418084898488_7465257140707656468_n.jpg',
  '728606978_850698067800202_2541178028059738605_n.jpeg',
  '714444049_122164480898898488_5471222912356320599_n.jpg',
  '711229326_122164900484898488_5566644979506779920_n.jpg',
  '657471734_122156934668898488_5869491144525458499_n.jpg',
  '763895379_2304085387061523_2307290216724867120_n.jpeg',
  '619184439_122148487370898488_2800897184434687356_n.jpg',
  '750941967_1046000044554207_7863595692077112073_n.jpeg',
  '700035186_122163071150898488_6479627167002161447_n.jpg',
  '707436517_122163753332898488_8478920268268930384_n.jpg',
  '740659533_2465884293895113_2984027615856181149_n.jpeg',
  '724958622_2569660496800951_2481374784901930368_n.jpeg',
  '726399807_3960564300746342_3585065883842622479_n.jpeg',
  '772102300_1915033205831244_3426281878630048759_n.jpeg',
  '619001315_122148487424898488_1031191257585992306_n.jpg',
  '608816846_122145400730898488_5800414235495499328_n.jpg',
  '759253995_1041134465317632_1569822390385733885_n.jpeg',
  '757480401_2021007731832123_8169523890536478803_n.jpeg',
  '753169894_1730896784502195_1260571294139012820_n.jpeg',
  '747154158_2455110544964862_1124194928461680904_n.jpeg',
  '700102231_122163071144898488_1534760444925562152_n.jpg',
  '727543126_4009939682470279_2460415041602726577_n.jpeg',
  '706971156_122163753326898488_5659330505378723359_n.jpg',
  '713584365_122164480952898488_3077183850693702636_n.jpg',
  '619147219_122148487580898488_3536437673812585847_n.jpg',
  '726373174_3662748670530159_8433216455914667614_n.jpeg',
  '619031812_122148487574898488_365266179914863318_n.jpg',
  '722039047_978653691743698_7289636952596112617_n.jpeg',
  '758016742_1060012449902886_2097048343588441183_n.jpeg',
  '715472419_122164900544898488_6577615120319739180_n.jpg',
  '618945571_122148487328898488_7014527170472187328_n.jpg',
  '733139744_27563012236720103_4635848874042393616_n.jpeg',
  '714881507_122164900472898488_5452903309911464229_n.jpg',
  '712684343_122164480904898488_1750457687399235716_n.jpg',
  '770751009_1756506922215091_873201582840494174_n.jpeg',
  '659040483_122156934860898488_877812430612507415_n.jpg',
  '740580904_1015701321319349_5780520643490535146_n.jpeg',
  '742266650_1565626421784296_2011712744297422796_n.jpeg',
  '766008178_1575307707471470_9155319774046192316_n.jpeg',
  '746385342_1326017369687111_4455632533533396276_n.jpeg',
  '700708251_122163071156898488_8814898574550021425_n.jpg',
  '660534601_122156934728898488_7240905978873135739_n.jpg',
].map(g);

export type Resort = 'Paindane' | 'Pleasure Bay';

export type Unit = {
  resort: Resort;
  category: string;
  name: string;
  details: string[];
};

const luxury = '3 x Bedrooms, 2 x Bathrooms, Kitchen, Open plan Lounge & Dining room, Verandah, Braai, Aircon, Wifi & Swimming Pool';
const fitted2 = 'Fitted with gas Geysers, 2 Plate Cooker(gas supplied), Electric Fridge/Freezer & Linen';
const fitted3 = 'Fitted with gas Geysers, 3 Plate Cooker (gas supplied), Electric Fridge/Freezer & Linen';
const notSupplied = 'NOT SUPPLIED – Towels, black rubbish bags & toilet paper';
const chalet6 = '3 x Bedrooms, 2 x Bathrooms, Kitchen, Open plan Lounge & Dining room, Verandah & Braai';
const chalet7 = '2 x Bedrooms, 1 x Bathrooms, Kitchen, Open plan Lounge, Veranda & Braai';
const chalet8 = '4 x Bedrooms, 2 Bathrooms, Kitchen, Open plan Lounge & Dining room, Verandah/Gazebo & Braai, 2 x Double beds & 4 x Single beds';

export const accommodationTitle = 'Accommodation & Camping Options';

export const units: Unit[] = [
  { resort: 'Paindane', category: 'Luxury Houses', name: 'Luxury House 8 (3 x Bed House)', details: [luxury] },
  { resort: 'Paindane', category: 'Luxury Houses', name: 'Luxury House 10 (3 x Bed House)', details: [luxury] },
  { resort: 'Paindane', category: 'Luxury Houses', name: 'Luxury House 25 (3 x Bed House)', details: [luxury] },
  {
    resort: 'Paindane',
    category: 'Luxury Houses',
    name: 'Luxury House 11 (6 x Bed House)',
    details: ['6 x Bedrooms, 2 x Bathrooms, Kitchen, Open plan Lounge & Dining room, Verandah, Braai, Aircon, Wifi & Swimming Pool'],
  },
  { resort: 'Paindane', category: 'Rondavels', name: 'Rondavel 1 (6 x Bed)', details: ['2 x Bedrooms, Lounge, Kitchen & Bathroom', fitted2, notSupplied] },
  { resort: 'Paindane', category: 'Rondavels', name: 'Rondavel 2 (6 x Bed)', details: ['2 x Bedrooms, Lounge, Kitchen & Bathroom', fitted2, notSupplied] },
  { resort: 'Paindane', category: 'Rondavels', name: 'Rondavel 3 (4 x Bed)', details: ['1 x Bedroom, Lounge, Kitchen & Bathroom', fitted2, notSupplied] },
  { resort: 'Paindane', category: 'Rondavels', name: 'Rondavel 4 (4 x Bed)', details: ['1 x Bedroom, Lounge, Kitchen & Bathroom', fitted2, notSupplied] },
  { resort: 'Paindane', category: 'Rondavels', name: 'Rondavel 5 (4 x Bed)', details: ['1 x Bedroom, Lounge, Kitchen & Bathroom', fitted2, notSupplied] },
  { resort: 'Paindane', category: 'Chalets', name: 'Chalet 21 (6 x Bed)', details: [chalet6, fitted3, notSupplied] },
  { resort: 'Paindane', category: 'Chalets', name: 'Chalet 22 (6 x Bed)', details: [chalet6, fitted3, notSupplied] },
  { resort: 'Paindane', category: 'Chalets', name: 'Chalet 23 (6 x Bed)', details: [chalet6, fitted3, notSupplied] },
  { resort: 'Paindane', category: 'Chalets', name: 'Chalet 24 (6 x Bed)', details: [chalet6, fitted3, notSupplied] },
  { resort: 'Paindane', category: 'Chalets', name: 'Chalet 6 (7 x Bed)', details: [chalet7, fitted3, notSupplied] },
  { resort: 'Paindane', category: 'Chalets', name: 'Chalet 7 (7 x Bed)', details: [chalet7, fitted3, notSupplied] },
  { resort: 'Paindane', category: 'Chalets', name: 'Chalet 9 (7 x Bed)', details: [chalet7, fitted3, notSupplied] },
  { resort: 'Paindane', category: 'Chalets', name: 'Chalet 12 (8 x Bed)', details: [chalet8, fitted3, notSupplied] },
  { resort: 'Paindane', category: 'Chalets', name: 'Chalet 13 (8 x Bed)', details: [chalet8, fitted3, notSupplied] },
  { resort: 'Paindane', category: 'Chalets', name: 'Chalet 15 (8 x Bed)', details: [chalet8, fitted3, notSupplied] },
  {
    resort: 'Paindane',
    category: 'Chalets',
    name: 'Chalet 16 (8 x Bed)',
    details: [
      '3 x Bedrooms, 2 Bathrooms, Kitchen, Open plan Lounge & Dining room, Verandah & Braai, 1 x Double bed, 2 x single Beds in rooms, 2 x Beds in Lounge',
      fitted3,
      notSupplied,
    ],
  },
  {
    resort: 'Paindane',
    category: 'Camping',
    name: 'OPEN SITE with Gazebo',
    details: ['2m x 2m on site. Site size 12m x 24m with Plug point – for household electric freezer only – 5AMP PLUGS ONLY'],
  },
  {
    resort: 'Paindane',
    category: 'Camping',
    name: 'Baracca',
    details: ['8m x 4m (Sites 19, 20, 21, 22, 23, 24, 25, 26, 28, 31, 32, 33)', 'With prep bowl, plug point, work surface and a light – 5AMP PLUG ONLY'],
  },
  {
    resort: 'Paindane',
    category: 'Camping',
    name: 'Casita',
    details: ['8m x 6m (Sites 3, 4, 5, 6, 7, 8, 9, 10)', 'Own ablution – Toilet, Shower, Hand basin, Geyser & Kitchenette'],
  },
  { resort: 'Pleasure Bay', category: 'Units', name: 'Nemo & Dory', details: ['Interleading Double rooms'] },
  { resort: 'Pleasure Bay', category: 'Units', name: 'Domino & Goldie', details: ['Double room + bunk bed', 'Goldie includes Large Balcony'] },
  { resort: 'Pleasure Bay', category: 'Units', name: 'Starfish & Angel Fish (Honeymoon Unit)', details: ['Interleading Double room + bunk bed'] },
  { resort: 'Pleasure Bay', category: 'Units', name: 'Frog Fish & Tiger Fish', details: ['Double room + single bed'] },
  { resort: 'Pleasure Bay', category: 'Houses', name: 'Marlin (8 Sleeper)', details: ['2 x Double + 2 Single Bedrooms – 2 Beds per Room'] },
  { resort: 'Pleasure Bay', category: 'Houses', name: 'Manatee (8 Sleeper)', details: ['1 x Double + 3 Single Bedrooms – 2 Beds per Room'] },
  { resort: 'Pleasure Bay', category: 'Houses', name: 'Periwinkel (6 Sleeper)', details: ['1 x Double + 2 Single Bedrooms – 2 Beds per Room'] },
  { resort: 'Pleasure Bay', category: 'Houses', name: 'Orca (8 Sleeper)', details: ['1 x Double + 3 Single Bedrooms – 2 Beds per Room'] },
  { resort: 'Pleasure Bay', category: 'Houses', name: 'Dugomgo (8 Sleeper)', details: ['1 x Double + 3 Single Bedrooms – 2 Beds per Room'] },
];

export const contactSection = {
  cta: 'Enquire to Book Your Stay',
  portal: {
    tease: 'Ready when you are',
    kicker: 'Enquire to book your stay',
    title: ['Your sun', 'is waiting.'],
    text: 'Tell us your dates and who’s coming – the Tan ‘n Biki team will check availability and confirm everything with you personally.',
  },
  title: 'Contact Us',
};

export const footer = {
  copyright: `Copyrights © ${new Date().getFullYear()} Tan ‘n Biki`,
  privacy: '/privacy.html',
  disclaimer: '/disclaimer.html',
};

// ---------- 2026 price lists (from the printed Paindane and Pleasure Bay price lists) ----------

/** Price per day. A single `price` applies all year; null means "price on enquiry". */
export type Rate = {
  name: string;
  /** Unit / site numbers */
  units?: string;
  description?: string[];
  season?: string | null;
  peak?: string | null;
  /** One price for the whole year (camping sites) */
  price?: string;
};

export type RateGroup = {
  title: string;
  subtitle?: string;
  rates: Rate[];
  notes?: string[];
};

const rondavelFitted = 'Rondavels fitted with gas Geysers, 2 Plate Cooker (gas supplied), Electric Fridge/Freezer & Linen.';
const chaletFitted = 'Chalets fitted with gas Geysers, 3 Plate Cooker (gas supplied), Electric Fridge/Freezer & Linen.';
const notSuppliedNote = 'NOT SUPPLIED – Towels, black rubbish bags & toilet paper.';
const villaDesc = 'Kitchen, Open plan Lounge & Dining room, Verandah, Braai, Aircon, Wifi & Swimming Pool';

export const rates: Record<Resort, RateGroup[]> = {
  Paindane: [
    {
      title: 'Luxury Houses',
      subtitle: 'Self Catering',
      rates: [
        { name: 'Luxury Villa 7 Sleeper', units: 'No 8, 10 & 25', description: [`3 x Bedrooms, 2 x Bathrooms, ${villaDesc}`], season: 'R5250', peak: 'R7500' },
        { name: 'Luxury Villa 12 Sleeper', units: 'No 11', description: [`5 x Bedrooms, 2 x Bathrooms, ${villaDesc}`], season: 'R5950', peak: 'R8500' },
      ],
    },
    {
      title: 'Rondavels',
      subtitle: 'Constructed from bricks – Relaxed, not Posh',
      rates: [
        {
          name: '2 Sleeper Rondavel',
          units: 'No 3, 4 & 5',
          description: ['1 x Bedroom, Lounge, Kitchen & Bathroom', '2 x Single beds in room & bunk bed in lounge & Fans'],
          season: 'R1680',
          peak: 'R2400',
        },
        {
          name: '4 Sleeper Rondavel',
          units: 'No 1 & 2',
          description: ['2 x Bedrooms, Lounge, Kitchen & Bathroom', '2 x 2 Single beds in rooms & bunk bed in lounge & Fans'],
          season: 'R2100',
          peak: 'R3000',
        },
      ],
      notes: [rondavelFitted, notSuppliedNote],
    },
    {
      title: 'Chalets',
      subtitle: 'Constructed from bricks, reed & grass – Rustic Mozambique style',
      rates: [
        {
          name: '6 Sleeper Chalet',
          units: 'No 21, 22, 23 & 24',
          description: ['3 x Bedrooms, 2 x Bathrooms, Kitchen, Open plan Lounge & Dining room, Verandah & Braai'],
          season: 'R3500',
          peak: 'R5000',
        },
        {
          name: '7 Sleeper Chalet',
          units: 'No 6, 7 & 9',
          description: ['2 x Bedrooms, 1 x Bathroom, Kitchen, Open plan Lounge, Veranda & Braai'],
          season: 'R6000',
          peak: 'R8000',
        },
        {
          name: '10 Sleeper Chalet',
          units: 'No 13 & 15',
          description: ['4 x Bedrooms, 2 Bathrooms, Kitchen, Open plan Lounge & Dining room, Verandah/Gazebo & Braai'],
          season: 'R4200',
          peak: 'R6000',
        },
        {
          name: '12 Sleeper Chalet',
          units: 'No 12',
          description: ['5 x Bedrooms, 2 Bathrooms, Kitchen, Open plan Lounge & Dining room, Verandah & Braai'],
          season: 'R4550',
          peak: 'R6500',
        },
        {
          name: '10 Sleeper Chalet',
          units: 'No 26',
          description: ['4 x Bedrooms, 2 Bathrooms, Kitchen, Open plan Lounge & Dining room, Verandah & Braai', '1 x Double bed & 8 x Single beds'],
          season: 'R2450',
          peak: 'R3500',
        },
        { name: '6 Sleeper Chalet', units: 'No 17', season: 'R2450', peak: 'R3500' },
      ],
      notes: [chaletFitted, notSuppliedNote],
    },
    {
      title: 'Camping',
      subtitle: 'Open Sites, Baracca, Casita',
      rates: [
        { name: 'Camping fees per adult', description: ['Per adult per day (plus camping option)'], season: 'R150 p/p/d', peak: 'R200 p/p/d' },
        { name: 'Camping fees per child', description: ['Per child per day – under 11 years pay ½ price'], season: 'R75 p/p/d', peak: 'R100 p/p/d' },
        {
          name: 'Open Site with Gazebo',
          description: ['2m x 2m on site. Site size 12m x 24m with plug point – for household electric freezer only – 5AMP PLUGS ONLY'],
          price: 'R300 / day',
        },
        {
          name: 'Baracca',
          units: 'Sites 19, 20, 21, 22, 23, 24, 25, 26, 28, 31, 32 & 33',
          description: [
            '8m x 4m with prep bowl, plug point, work surface and a light – 5AMP PLUG ONLY',
            'Baracca 31 can’t take a Safari Trailer because of a retainer wall around the site',
          ],
          price: 'R450 / day',
        },
        {
          name: 'Casita',
          units: 'Sites 3, 4, 5, 6, 7, 8, 9 & 10',
          description: ['8m x 6m. Own ablution – Toilet, Shower, Hand basin, Geyser & Kitchenette', 'Electric plug point for own freezer – 5AMP PLUG ONLY'],
          price: 'R500 / day',
        },
      ],
    },
  ],
  'Pleasure Bay': [
    {
      title: 'Units',
      subtitle: 'Self Catering',
      rates: [
        { name: 'Nemo', description: ['Double room (interleading to Dory double room)', '2 Sleeper'], season: 'R2000', peak: 'R2500' },
        { name: 'Dory', description: ['Double room (interleading to Nemo double room)', '2 Sleeper'], season: 'R2000', peak: 'R2500' },
        { name: 'Goby', description: ['Double room', '2 Sleeper'], season: 'R2000', peak: 'R2500' },
        { name: 'Chocdip', description: ['Double room', '2 Sleeper'], season: 'R2000', peak: 'R2500' },
        { name: 'Domino', description: ['Double room', '2 Sleeper'], season: 'R2000', peak: 'R2500' },
        { name: 'Goldie', description: ['Double room & bunk bed', '4 Sleeper', 'Large balcony – Honeymoon unit'], season: 'R2450', peak: 'R2950' },
        { name: 'Starfish', description: ['Double room & bunk bed', '4 Sleeper (interleading to Angel Fish double room)'], season: 'R2450', peak: 'R2950' },
        { name: 'Angel Fish', description: ['Double room & bunk bed', '4 Sleeper (interleading to Starfish with bunk bed)'], season: 'R2450', peak: 'R2950' },
        { name: 'Frog Fish', description: ['Double room & single bed', '3 Sleeper'], season: 'R2350', peak: 'R2850' },
        { name: 'Tiger Fish', description: ['Double room & single bed', '3 Sleeper'], season: 'R2350', peak: 'R2850' },
      ],
    },
    {
      title: 'Houses',
      rates: [
        { name: 'Marlin', description: ['2 x Double rooms, 2 x Single rooms (2 beds per room)', '8 Sleeper'], season: null, peak: null },
        { name: 'Manatee', description: ['1 x Double room, 3 x Single rooms (2 beds per room)', '8 Sleeper'], season: null, peak: null },
        { name: 'Periwinkel', description: ['1 x Double room, 2 x Single rooms (2 beds per room)', '4 Sleeper'], season: null, peak: null },
        { name: 'Orca', description: ['1 x Double room, 3 x Single rooms (2 beds per room)', '8 Sleeper'], season: null, peak: null },
        { name: 'Dugongo', description: ['1 x Double room, 3 x Single rooms (2 beds per room)', '8 Sleeper'], season: null, peak: null },
      ],
    },
  ],
};

export const ratesSection = {
  eyebrow: 'Rates 2026',
  title: 'Our 2026 Price List',
  intro: 'All prices are per day, in South African Rand. Ask us whether your dates fall in season or peak season.',
};

/** Shown wherever guests might think about booking: nothing is paid until management has confirmed. */
export const enquiryNotice = {
  title: 'Please enquire before you book',
  body: 'All bookings are arranged directly with the Paindane / Tan ‘n Biki management team. Please contact us first to check availability – don’t make any payment until you have spoken to us and received a confirmation from management.',
};

/** The Explore section: one tab per place, each with its topics */
export const exploreSection = {
  eyebrow: 'Explore',
  title: 'Discover Mozambique, Paindane & Pleasure Bay',
};

export const exploreGroups = [
  { id: 'mozambique', label: 'Mozambique', features: welcomeFeatures },
  { id: 'paindane', label: 'Paindane Beach', features: paindaneFeatures },
  { id: 'pleasure-bay', label: 'Pleasure Bay', features: pleasureBayFeatures },
] as const;

/** "At a glance" numbers under the welcome text (all from the resort info and the 2026 price lists) */
export const glanceStats = [
  { value: 2, suffix: '', label: 'Beach resorts' },
  { value: 28, suffix: ' km', label: 'South of Inhambane' },
  { value: 35, suffix: '+', label: 'Chalets, houses & units' },
  { value: 12, suffix: '', label: 'Baracca campsites' },
];

/** "How booking works" – reinforces that nothing is paid before management confirms */
export const howBooking = {
  eyebrow: 'How booking works',
  title: ['Enquire first.', 'Then relax.'],
  intro: 'Every booking is arranged personally with the Tan ‘n Biki management team – here’s how it works.',
  steps: [
    { n: '01', title: 'Choose your spot', text: 'Browse the resorts and our accommodation to find the chalet, house or campsite that suits your crew.', tags: ['Explore', 'Accommodation'] },
    { n: '02', title: 'Enquire with us', text: 'WhatsApp, email or call the Tan ‘n Biki team with your dates and the number of guests.', tags: ['WhatsApp', 'Email', 'Call'] },
    { n: '03', title: 'We confirm', text: 'Management checks availability and confirms your booking and payment details with you personally. Please don’t pay anything before this.', tags: ['Availability', 'Confirmation'] },
    { n: '04', title: 'Pack your bikini', text: 'Load the 4×4, join our Zello channel for the drive up, and we’ll see you on the beach.', tags: ['4×4', 'Zello', 'Beach'] },
  ],
};

/** The stand-alone gallery page */
export const galleryPage = {
  eyebrow: 'Paindane & Pleasure Bay',
  title: 'Gallery',
  sub: 'photos of the beaches, chalets and reefs at Tan ‘n Biki.',
  image: '/images/hero/hero-4.jpg',
  href: '/gallery.html',
};
