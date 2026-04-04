export type Product = {
  id: number;
  title: string;
  category: string;
  type: string;
  country: string;
  access: 'Full Access' | 'Shared Access';
  premium: string;
  age: string;
  price: number;
  rating: number;
  seller: string;
  offers: number;
  thumb: string;
  tone: string;
};

export const topCategories = ['Currency','Top Up','Items','Boosting','Accounts','Video Games','Gift Cards','Coupons'];
export const hotGameColumns = [
  {title:'Currency',tone:'linear-gradient(135deg,#f59e0b,#f97316)',items:['World of Warcraft: Midnight','World of Warcraft: Mists','WoW Classic: Era','Steam Wallet']},
  {title:'Items',tone:'linear-gradient(135deg,#7c3aed,#9333ea)',items:['Fortnite','Diablo IV','World of Warcraft: Midnight','League of Legends (PC)']},
  {title:'Accounts',tone:'linear-gradient(135deg,#1e3a8a,#0f172a)',items:['Fortnite','Steam','League of Legends (PC)','Genshin Impact']},
  {title:'Gift Cards',tone:'linear-gradient(135deg,#38bdf8,#3b82f6)',items:['Hot Products','Steam','League of Legends (PC)','Roblox']}
];
export const topUps = [
  { title: 'Fortnite', offers: 465, tone: 'linear-gradient(135deg,#111827,#312e81)' },
  { title: 'Steam', offers: 389, tone: 'linear-gradient(135deg,#111827,#000000)' },
  { title: 'COD MW III', offers: 297, tone: 'linear-gradient(135deg,#3f3f46,#111827)' },
  { title: 'Xbox Game Pass', offers: 52, tone: 'linear-gradient(135deg,#15803d,#14532d)' },
  { title: 'Valorant', offers: 225, tone: 'linear-gradient(135deg,#111827,#ef4444)' },
  { title: 'Spotify', offers: 83, tone: 'linear-gradient(135deg,#16a34a,#052e16)' },
  { title: 'Xbox Live', offers: 12967, tone: 'linear-gradient(135deg,#22c55e,#166534)' },
  { title: 'League of Legends', offers: 17, tone: 'linear-gradient(135deg,#92400e,#451a03)' },
  { title: 'EA FC 26', offers: 120, tone: 'linear-gradient(135deg,#111827,#000000)' }
];
export const giftCards = ['Xbox Live (Microsoft)','Fortnite','Steam','League of Legends (PC)','PlayStation Store'];
export const videoGames = ['Xbox Live (Microsoft)','Call of Duty: Modern Warfare','EA FC 26','Diablo IV','World of Warcraft: Midnight'];
export const testimonials = [
  { user: 'MotherBoard', text: 'Excellent service, responded quickly and answered every question I had. Thank you.', score: '100%' },
  { user: 'Onineshop', text: 'Very fast delivery and the seller was professional throughout the process.', score: '99.7%' },
  { user: 'OmniAI', text: 'Really good seller and quick response.', score: '98.7%' },
  { user: 'Kier1306', text: 'The best seller. I have been buying from this store for a long time.', score: '99.1%' }
];
export const newGames = [
  ['Resident Evil Accounts','Blink Accounts','The Witcher 4 Accounts','Rogue Point Accounts','Darwin’s Paradox! Accounts','RIDE 5 Accounts'],
  ['Understand Accounts','StudyDrive Accounts','Warhammer 40,000 Space Marine 2','GameCards Accounts','Escape Tsunami Accounts','Wimatix Accounts'],
  ['The Occultist Video Games','Chuhuh: The Cosmic Abyss','Aphion Video Games','MotoGP 26','Directive 8020 Video Games','Elephorm Accounts'],
  ['Starship Troopers','PopShort AI Accounts','Scira Accounts','Fallout 4 Accounts','Spotled in PDF','ReadCube Accounts']
];
export const news = [
  {title:'Last Epoch Arena Guide: How it Works, Rewards and Deep Run Strategies',date:'2026-03-30',excerpt:'The arena in Last Epoch tests how far you can go against ever harder waves. Learn the route, scaling and reward loop.'},
  {title:'ARC Raiders Flashpoint Update Preview Complete Breakdown',date:'2026-03-30',excerpt:'This preview introduces refreshed enemy AI, gameplay improvements and progression updates.'},
  {title:'Limbus Company Mirror Dungeon Explained',date:'2026-03-17',excerpt:'Mirror Dungeon offers rogue-like loops with ego gifts and challenging encounters.'},
  {title:'Kingdom Come: Deliverance II Ultimate Guide',date:'2026-03-29',excerpt:'Everything you need to know before starting your first campaign and building momentum.'}
];
const tones = ['linear-gradient(135deg,#2563eb,#1d4ed8)','linear-gradient(135deg,#059669,#065f46)','linear-gradient(135deg,#7c3aed,#4c1d95)','linear-gradient(135deg,#dc2626,#7f1d1d)','linear-gradient(135deg,#0f172a,#1e293b)','linear-gradient(135deg,#ea580c,#9a3412)'];
const titles = ['USA Apple ID Premium account with full access and verified email','Japan iCloud ID private account for App Store and media services','High quality gaming top-up package with instant delivery','Fortnite stacked locker account with safe ownership transfer','Steam wallet top-up voucher with quick activation','League of Legends ranked-ready account with skins included','ChatGPT Plus 1 month access from trusted seller','Valorant points package instant top-up service','Xbox Live annual subscription activation code','PlayStation store gift card digital delivery service','Spotify premium one month access code','Discord Nitro voucher with email support'];
const countries = ['USA','Japan','Hong Kong','Turkey','Germany','Bangladesh','Singapore'];
const premiums = ['Apple One','Game Pass','Premium','Standard','Family'];
const ages = ['New','3 Months','6 Months','1 Year+'];
const types = ['Accounts','Top Up','Gift Card','Subscriptions'];
const sellers = ['AstraStore','NovaBoost','CloudMart','GameHub Pro','Digital Dock','PixelWave'];

export const products: Product[] = Array.from({ length: 45 }, (_, index) => {
  const title = titles[index % titles.length];
  const type = types[index % types.length];
  const country = countries[index % countries.length];
  return {
    id: index + 1,
    title,
    category: title.includes('ChatGPT') ? 'AI Tools' : title.includes('Fortnite') ? 'Gaming Accounts' : title.includes('gift') ? 'Gift Cards' : 'Digital Services',
    type,
    country,
    access: index % 4 === 0 ? 'Shared Access' : 'Full Access',
    premium: premiums[index % premiums.length],
    age: ages[index % ages.length],
    price: Number((2.49 + (index % 12) * 1.35).toFixed(2)),
    rating: 4 + ((index % 10) / 10),
    seller: sellers[index % sellers.length],
    offers: 20 + index * 7,
    thumb: title.split(' ')[0].toUpperCase(),
    tone: tones[index % tones.length]
  };
});
