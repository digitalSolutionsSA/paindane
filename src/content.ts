// All site copy and image paths live here so the site can be edited in one place.

export const contact = {
  email: 'tanbiki@paindane.com',
  phone: '+27 82 825 5597',
  phoneHref: 'tel:+27828255597',
  whatsapp: 'https://wa.me/27825693436',
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

export const nav = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'paindane', label: 'Paindane' },
  { id: 'pleasure-bay', label: 'Pleasure Bay' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'accommodation', label: 'Accommodation' },
  { id: 'contact', label: 'Book Now' },
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
    title: 'About Mozambique',
    body: [
      'Mozambique, with its stunning coastline along the Indian Ocean, offers a paradise for tourists seeking both relaxation and adventure. The ocean resorts in Mozambique are renowned for their pristine beaches, crystal-clear waters, and vibrant marine life. Whether you’re looking to unwind on the sandy shores or explore the underwater wonders, Mozambique’s ocean resorts have something for everyone.',
    ],
    image: g('757480401_2021007731832123_8169523890536478803_n.jpeg'),
    imageSide: 'right',
    tone: 'navy',
  },
  {
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
    title: 'Tan ‘n Biki @ Paindane Beach Resort',
    body: [
      'Tan ‘n Biki @ Paindane Beach Resort (Praia de Paindane) is situated 28 km South of Inhambane and is nestled amongst plantations of Coconut palms and miles of sun-bleached beaches. The last 4km is a thick sand track, 4×4 or Diff Lock recommended.',
    ],
    image: g('707098616_122163753320898488_5135170916882484444_n.jpg'),
    imageSide: 'left',
    tone: 'navy',
  },
  {
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
    title: 'Tan ‘n Biki @ Pleasure Bay Resort',
    body: [
      'Pleasure Bay Resort offers various self catering accommodation options which are situated on the dunes overlooking Paindane Beach and Lighthouse Reef about 30 kilometers south of Inhambane, Mozambique. It is the ideal destination for your Scuba Diving, Fishing, Adventure or Beach Holiday!',
    ],
    image: g('715472419_122164900544898488_6577615120319739180_n.jpg'),
    imageSide: 'right',
    tone: 'navy',
  },
  {
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
  cta: 'Reserve your Room Now',
  title: 'Contact Us',
};

export const footer = {
  copyright: `Copyrights © ${new Date().getFullYear()} Tan ‘n Biki`,
  privacy: '/privacy.html',
  disclaimer: '/disclaimer.html',
};
