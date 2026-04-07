/**
 * deck-routes.ts
 *
 * Express router serving brand-customised Power House sponsorship decks.
 * Each brand gets its own styled HTML page at /deck/[brand].
 *
 * Routes:
 *   GET /deck/kantar
 *   GET /deck/magnite
 *   GET /deck/vaynermedia
 *   GET /deck/iheartmedia
 *   GET /deck/adage
 *   GET /deck/quintal
 */

import { Router } from 'express';

const router = Router();

interface BrandTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  fontFamily: string;
  heroTagline: string;
  partnerNote: string;
  logo?: string; // optional emoji/text logo placeholder
}

const themes: Record<string, BrandTheme> = {
  kantar: {
    name: 'Kantar',
    primaryColor: '#1C3D6E',
    secondaryColor: '#FFFFFF',
    accentColor: '#00C8C8',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Where Data Meets Creative Leadership',
    partnerNote: 'A partnership for the industry\'s most data-literate creative minds.',
    logo: 'KANTAR × POWER HOUSE',
  },
  magnite: {
    name: 'Magnite',
    primaryColor: '#1B0A3D',
    secondaryColor: '#FFFFFF',
    accentColor: '#9B5CE5',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Premium Media. Premium Conversations.',
    partnerNote: 'Connecting the leaders who are shaping the future of CTV and programmatic.',
    logo: 'MAGNITE × POWER HOUSE',
  },
  vaynermedia: {
    name: 'VaynerMedia',
    primaryColor: '#0A0A0A',
    secondaryColor: '#FFFFFF',
    accentColor: '#E3232C',
    textColor: '#1a1a1a',
    fontFamily: "'Arial Black', Arial, sans-serif",
    heroTagline: 'Where Culture Gets Built.',
    partnerNote: 'The villa for people who understand that attention is the real currency.',
    logo: 'VAYNERMEDIA × POWER HOUSE',
  },
  iheartmedia: {
    name: 'iHeartMedia',
    primaryColor: '#C8102E',
    secondaryColor: '#FFFFFF',
    accentColor: '#1A1A2E',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Amplifying the Conversations That Matter.',
    partnerNote: 'A stage for audio\'s most powerful voices to shape the future of creative media.',
    logo: 'iHEARTMEDIA × POWER HOUSE',
  },
  adage: {
    name: 'Ad Age',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    accentColor: '#1C1C1C',
    textColor: '#1a1a1a',
    fontFamily: "Georgia, 'Times New Roman', serif",
    heroTagline: 'The Story of Cannes, Written from the Inside.',
    partnerNote: 'A media partnership for the industry\'s most storied trade publication.',
    logo: 'AD AGE × POWER HOUSE',
  },
  quintal: {
    name: 'Quintal',
    primaryColor: '#2D4A22',
    secondaryColor: '#F5F0E8',
    accentColor: '#C8A84B',
    textColor: '#1a1a1a',
    fontFamily: "Georgia, serif",
    heroTagline: 'Culture. Community. Cannes.',
    partnerNote: 'A partnership rooted in creative excellence and cultural authenticity.',
    logo: 'QUINTAL × POWER HOUSE',
  },
  meta: {
    name: 'Meta',
    primaryColor: '#0866FF',
    secondaryColor: '#FFFFFF',
    accentColor: '#23C4F8',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Where AI Creativity Meets Human Connection.',
    partnerNote: 'A space for the brand and creative leaders shaping what co-creation between people and AI looks like next.',
    logo: 'META × POWER HOUSE',
  },
  linkedin: {
    name: 'LinkedIn',
    primaryColor: '#0A66C2',
    secondaryColor: '#FFFFFF',
    accentColor: '#70B5F9',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The B2B Creative Leadership Conversation.',
    partnerNote: 'A closed-door session for the senior leaders redefining what B2B creativity looks like — and why it matters more than ever.',
    logo: 'LINKEDIN × POWER HOUSE',
  },
  spotify: {
    name: 'Spotify',
    primaryColor: '#121212',
    secondaryColor: '#FFFFFF',
    accentColor: '#1DB954',
    textColor: '#1a1a1a',
    fontFamily: "'Circular', 'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Where Music, Culture and Brand Power Converge.',
    partnerNote: 'Bringing the energy of Spotify Beach into the most intimate creative conversation at Cannes.',
    logo: 'SPOTIFY × POWER HOUSE',
  },
  amazon: {
    name: 'Amazon Ads',
    primaryColor: '#232F3E',
    secondaryColor: '#FFFFFF',
    accentColor: '#FF9900',
    textColor: '#1a1a1a',
    fontFamily: "'Amazon Ember', 'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Where Data Meets Creative Leadership.',
    partnerNote: 'A session for the leaders driving the convergence of streaming, sport, and advertising at scale.',
    logo: 'AMAZON ADS × POWER HOUSE',
  },
  snapchat: {
    name: 'Snapchat',
    primaryColor: '#FFFC00',
    secondaryColor: '#000000',
    accentColor: '#000000',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Bringing the Next Generation Into the Room.',
    partnerNote: 'A partnership for the platform that understands where culture is going before it gets there.',
    logo: 'SNAPCHAT × POWER HOUSE',
  },
  cocacola: {
    name: 'Coca-Cola',
    primaryColor: '#F40009',
    secondaryColor: '#FFFFFF',
    accentColor: '#000000',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Real Magic. Real Conversations.',
    partnerNote: 'A space where the world\'s most iconic brand meets the industry\'s most important conversations.',
    logo: 'COCA-COLA × POWER HOUSE',
  },
  diageo: {
    name: 'Diageo',
    primaryColor: '#1A1A2E',
    secondaryColor: '#FFFFFF',
    accentColor: '#C8A84B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Celebrating Life. Every Day. Everywhere.',
    partnerNote: 'A premium partnership for the brand portfolio that understands what it means to own a cultural moment.',
    logo: 'DIAGEO × POWER HOUSE',
  },
  lvmh: {
    name: 'LVMH',
    primaryColor: '#1A1A1A',
    secondaryColor: '#F5F0E8',
    accentColor: '#C8A84B',
    textColor: '#1a1a1a',
    fontFamily: "Georgia, 'Times New Roman', serif",
    heroTagline: 'The Art of Excellence. The Science of Influence.',
    partnerNote: 'A partnership for the house that has always understood that luxury is not about exclusivity — it is about deserving it.',
    logo: 'LVMH × POWER HOUSE',
  },
  netflix: {
    name: 'Netflix',
    primaryColor: '#141414',
    secondaryColor: '#FFFFFF',
    accentColor: '#E50914',
    textColor: '#1a1a1a',
    fontFamily: "'Netflix Sans', 'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Stories That Move Culture. Conversations That Move Industry.',
    partnerNote: 'A session for the creative leaders behind the most culturally impactful IP in the world.',
    logo: 'NETFLIX × POWER HOUSE',
  },
  uber: {
    name: 'Uber',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    accentColor: '#06C167',
    textColor: '#1a1a1a',
    fontFamily: "'Uber Move', 'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Moving People. Moving Culture. Moving the Conversation Forward.',
    partnerNote: 'From the Uber Villa to the Power House — the natural next conversation for Cannes 2026.',
    logo: 'UBER × POWER HOUSE',
  },
  tubi: {
    name: 'Tubi',
    primaryColor: '#FA2D48',
    secondaryColor: '#FFFFFF',
    accentColor: '#0D0D0D',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Free Streaming. Fearless Creativity.',
    partnerNote: 'The villa for the brand proving that free and premium are not opposites.',
    logo: 'TUBI × POWER HOUSE',
  },
  mccann: {
    name: 'McCann',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    accentColor: '#1a1a1a',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Truth Well Told. In the Room That Matters.',
    partnerNote: 'A creative leaders session for the agency whose work keeps proving what genuine courage looks like.',
    logo: 'McCANN × POWER HOUSE',
  },
  amex: {
    name: 'American Express',
    primaryColor: '#016FD0',
    secondaryColor: '#FFFFFF',
    accentColor: '#C8A84B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Don\'t Leave Cannes Without It.',
    partnerNote: 'A Priceless dinner for the CMOs and creative leaders who make the decisions that matter.',
    logo: 'AMEX × POWER HOUSE',
  },
  adweek: {
    name: 'Adweek',
    primaryColor: '#1A1A2E',
    secondaryColor: '#FFFFFF',
    accentColor: '#E8B84B',
    textColor: '#1a1a1a',
    fontFamily: "Georgia, serif",
    heroTagline: 'The Editorial Voice of Cannes. Inside the Room.',
    partnerNote: 'A media partnership that puts Adweek editorial at the centre of the most important creative conversations at Cannes.',
    logo: 'ADWEEK × POWER HOUSE',
  },
  equativ: {
    name: 'Equativ',
    primaryColor: '#1B2B5E',
    secondaryColor: '#FFFFFF',
    accentColor: '#00D4AA',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Principled Advertising. Powerful Conversations.',
    partnerNote: 'A lunch for the leaders building the ethical future of digital advertising.',
    logo: 'EQUATIV × POWER HOUSE',
  },
  reddit: {
    name: 'Reddit',
    primaryColor: '#FF4500',
    secondaryColor: '#FFFFFF',
    accentColor: '#1A1A1B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Front Page of Culture. The Back Room of Cannes.',
    partnerNote: 'A mixer for the brand proving that the most honest conversations drive the most effective advertising.',
    logo: 'REDDIT × POWER HOUSE',
  },
  nielsen: {
    name: 'Nielsen',
    primaryColor: '#003087',
    secondaryColor: '#FFFFFF',
    accentColor: '#00A3E0',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Data Behind Every Great Creative Decision.',
    partnerNote: 'A breakfast briefing where the numbers behind the industry\'s biggest creative bets get a proper airing.',
    logo: 'NIELSEN × POWER HOUSE',
  },
  tiktok: {
    name: 'TikTok',
    primaryColor: '#010101',
    secondaryColor: '#FFFFFF',
    accentColor: '#FE2C55',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Where Culture Is Made. Where Brands Get Real.',
    partnerNote: 'A session for the platform that redefined what it means for a brand to move at the speed of culture.',
    logo: 'TIKTOK × POWER HOUSE',
  },
  wpp: {
    name: 'WPP',
    primaryColor: '#1A1A2E',
    secondaryColor: '#FFFFFF',
    accentColor: '#E8B84B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Creative Transformation Company. In the Room.',
    partnerNote: 'A creative leadership lunch for the holding company that is redefining what scale and creative ambition look like together.',
    logo: 'WPP × POWER HOUSE',
  },
  brandinnovators: {
    name: 'Brand Innovators',
    primaryColor: '#0A2540',
    secondaryColor: '#FFFFFF',
    accentColor: '#00A3FF',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Where Brand Leaders Go to Think.',
    partnerNote: 'Bringing the Brand Innovators community into the most curated room at Cannes Lions 2026.',
    logo: 'BRAND INNOVATORS × POWER HOUSE',
  },
  wetransfer: {
    name: 'WeTransfer',
    primaryColor: '#0C0C0C',
    secondaryColor: '#FFFFFF',
    accentColor: '#7B68EE',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Creative Internet. The Creative Conversation.',
    partnerNote: 'A creative lunch for the platform that has always understood what it means to build for makers first.',
    logo: 'WETRANSFER × POWER HOUSE',
  },
  microsoft: {
    name: 'Microsoft Advertising',
    primaryColor: '#0078D4',
    secondaryColor: '#FFFFFF',
    accentColor: '#50E6FF',
    textColor: '#1a1a1a',
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'AI as a Creative Companion. In the Room That Decides.',
    partnerNote: 'A breakfast session for the leaders who need to hear the honest version of where AI and creativity are going together.',
    logo: 'MICROSOFT × POWER HOUSE',
  },
  ft: {
    name: 'Financial Times',
    primaryColor: '#FFF1E5',
    secondaryColor: '#1A1A1A',
    accentColor: '#CC0000',
    textColor: '#1a1a1a',
    fontFamily: "Georgia, 'Times New Roman', serif",
    heroTagline: 'The Morning Briefing That Sets the Week\'s Agenda.',
    partnerNote: 'An FT-hosted breakfast briefing inside the villa — your editorial, our room, the right people.',
    logo: 'FINANCIAL TIMES × POWER HOUSE',
  },
  mastercard: {
    name: 'Mastercard',
    primaryColor: '#1A1A1A',
    secondaryColor: '#FFFFFF',
    accentColor: '#EB001B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Priceless. Full Stop.',
    partnerNote: 'A private dinner for the brand that turns every experience into a moment worth remembering.',
    logo: 'MASTERCARD × POWER HOUSE',
  },
  visa: {
    name: 'Visa',
    primaryColor: '#1A1F71',
    secondaryColor: '#FFFFFF',
    accentColor: '#F7B600',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Everywhere You Want to Be. Including This Room.',
    partnerNote: 'An exclusive dinner for the brand embedded into the fabric of how Cannes works.',
    logo: 'VISA × POWER HOUSE',
  },
  yahoo: {
    name: 'Yahoo',
    primaryColor: '#6001D2',
    secondaryColor: '#FFFFFF',
    accentColor: '#FF0080',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Still Here. Still Relevant. Proving It.',
    partnerNote: 'A co-hosted session for the comeback brand that understands how to own cultural conversation in 2026.',
    logo: 'YAHOO × POWER HOUSE',
  },
  stagwell: {
    name: 'Stagwell',
    primaryColor: '#0A1628',
    secondaryColor: '#FFFFFF',
    accentColor: '#4FC3F7',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Sport. Culture. Creative Leadership.',
    partnerNote: 'Where Sport Beach meets the most intimate creative conversation at Cannes Lions 2026.',
    logo: 'STAGWELL × POWER HOUSE',
  },
  freewheel: {
    name: 'FreeWheel',
    primaryColor: '#0D1B2A',
    secondaryColor: '#FFFFFF',
    accentColor: '#00C9A7',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Future of Premium Video. In the Right Room.',
    partnerNote: 'A closed-door session on the next chapter of premium video for the leaders making the investment decisions.',
    logo: 'FREEWHEEL × POWER HOUSE',
  },
  dentsu: {
    name: 'Dentsu',
    primaryColor: '#E4002B',
    secondaryColor: '#FFFFFF',
    accentColor: '#1A1A1A',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: '26 Lions. 7 Gold. The Conversation Continues.',
    partnerNote: 'A creative leaders panel for the agency that backed its Cannes year with the work to prove it.',
    logo: 'DENTSU × POWER HOUSE',
  },
  havas: {
    name: 'Havas',
    primaryColor: '#E4002B',
    secondaryColor: '#FFFFFF',
    accentColor: '#1A1A1A',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Nearly 20 Years at Cannes. The Villa Is Next.',
    partnerNote: 'The spirit of the Havas Café — in a more intimate setting, with the most important room at Cannes.',
    logo: 'HAVAS × POWER HOUSE',
  },
  dept: {
    name: 'DEPT',
    primaryColor: '#0D0D0D',
    secondaryColor: '#FFFFFF',
    accentColor: '#C8F04B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Bringing the Noise Down. Bringing the Level Up.',
    partnerNote: 'A creative leaders panel for the agency redefining what digital transformation looks like at scale.',
    logo: 'DEPT × POWER HOUSE',
  },
  pinterest: {
    name: 'Pinterest',
    primaryColor: '#E60023',
    secondaryColor: '#FFFFFF',
    accentColor: '#0D0D0D',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Making It Real. In the Room That Makes Things Happen.',
    partnerNote: 'A co-hosted session on what happens when the most positively-positioned platform meets the most senior creative room at Cannes.',
    logo: 'PINTEREST × POWER HOUSE',
  },
  // ─── BATCH 4 ─────────────────────────────────────────────────────────────
  google: {
    name: 'Google',
    primaryColor: '#1A73E8',
    secondaryColor: '#FFFFFF',
    accentColor: '#FBBC04',
    textColor: '#1a1a1a',
    fontFamily: "'Google Sans', 'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'AI Creativity. Human Leadership. One Room.',
    partnerNote: 'A closed-door session for the creative and marketing leaders shaping what AI-powered brand work looks like in practice.',
    logo: 'GOOGLE × POWER HOUSE',
  },
  canva: {
    name: 'Canva',
    primaryColor: '#7D2AE8',
    secondaryColor: '#FFFFFF',
    accentColor: '#00C4CC',
    textColor: '#1a1a1a',
    fontFamily: "'Canva Sans', 'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Creativity at Scale. In the Room That Sets the Agenda.',
    partnerNote: 'A co-hosted session on what it means to democratise design — and what senior brand leaders should be doing about it.',
    logo: 'CANVA × POWER HOUSE',
  },
  acast: {
    name: 'Acast',
    primaryColor: '#1C1C1C',
    secondaryColor: '#FFFFFF',
    accentColor: '#FF6B35',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Creator Economy of Audio. The Room That Invests in It.',
    partnerNote: 'A co-hosted session on what podcast advertising and the independent creator economy means for brand strategy in 2026.',
    logo: 'ACAST × POWER HOUSE',
  },
  rocnation: {
    name: 'Roc Nation',
    primaryColor: '#0D0D0D',
    secondaryColor: '#FFFFFF',
    accentColor: '#C8A84B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Music. Sport. Culture. The Room That Understands All Three.',
    partnerNote: 'A partnership rooted in cultural credibility — bringing Roc Nation\'s influence into the most curated room at Cannes Lions 2026.',
    logo: 'ROC NATION × POWER HOUSE',
  },
  sonymusic: {
    name: 'Sony Music',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    accentColor: '#E4002B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Where Music Culture Meets Brand Strategy.',
    partnerNote: 'A co-hosted session for the label that understands what genuine artist-brand collaboration looks like at global scale.',
    logo: 'SONY MUSIC × POWER HOUSE',
  },
  epidemicsound: {
    name: 'Epidemic Sound',
    primaryColor: '#0D0D0D',
    secondaryColor: '#FFFFFF',
    accentColor: '#A8FF3E',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Sound of the Creator Economy. In the Room That Funds It.',
    partnerNote: 'A co-hosted session on music licensing, brand content, and what the creator economy needs from audio in 2026.',
    logo: 'EPIDEMIC SOUND × POWER HOUSE',
  },
  billiondollarboy: {
    name: 'Billion Dollar Boy',
    primaryColor: '#0A0A0A',
    secondaryColor: '#FFFFFF',
    accentColor: '#FFD700',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Creator Economy Conversation the Industry Needs.',
    partnerNote: 'A co-hosted session on creator-led brand strategy — with the CMOs and brand leaders who are making the investment decisions.',
    logo: 'BILLION DOLLAR BOY × POWER HOUSE',
  },
  inkwellbeach: {
    name: 'Inkwell Beach',
    primaryColor: '#1A3A5C',
    secondaryColor: '#FFFFFF',
    accentColor: '#F5C842',
    textColor: '#1a1a1a',
    fontFamily: "Georgia, 'Times New Roman', serif",
    heroTagline: 'Inclusion. Excellence. The Room Where Both Matter.',
    partnerNote: 'A partnership celebrating diverse creative talent — and a natural home for the Inkwell Beach community at Cannes Lions 2026.',
    logo: 'INKWELL BEACH × POWER HOUSE',
  },
  sixteengroup: {
    name: '614 Group',
    primaryColor: '#003087',
    secondaryColor: '#FFFFFF',
    accentColor: '#E8B84B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Brand Safety. Senior Leaders. One Room.',
    partnerNote: 'A co-hosted session on brand safety and responsible digital advertising — with the CMOs making the decisions that matter.',
    logo: '614 GROUP × POWER HOUSE',
  },
  propellergroup: {
    name: 'Propeller Group',
    primaryColor: '#1A1A2E',
    secondaryColor: '#FFFFFF',
    accentColor: '#00D4AA',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'From the Croisette to the Villa. Built for the Right Conversations.',
    partnerNote: 'A partnership for the experiential events specialists who understand that the best brand moments are felt, not just seen.',
    logo: 'PROPELLER GROUP × POWER HOUSE',
  },
  epicgames: {
    name: 'Epic Games',
    primaryColor: '#0D0D0D',
    secondaryColor: '#FFFFFF',
    accentColor: '#0AC8B9',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Gaming Culture. Brand Strategy. The Room That Decides.',
    partnerNote: 'A co-hosted session for the creative leaders whose budgets and briefs will shape what brand collaboration in gaming looks like next.',
    logo: 'EPIC GAMES × POWER HOUSE',
  },
  roblox: {
    name: 'Roblox',
    primaryColor: '#E2231A',
    secondaryColor: '#FFFFFF',
    accentColor: '#00A2FF',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Gen Z. Creator Economy. The Brands That Get It.',
    partnerNote: 'A co-hosted session on what authentic brand engagement inside a creator-driven platform really looks like — with the CMOs making the call.',
    logo: 'ROBLOX × POWER HOUSE',
  },
  openai: {
    name: 'OpenAI',
    primaryColor: '#0D0D0D',
    secondaryColor: '#FFFFFF',
    accentColor: '#10A37F',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Real AI and Creativity Conversation.',
    partnerNote: 'A closed-door session where the most senior creative and marketing leaders ask the questions about AI they cannot ask on a panel.',
    logo: 'OPENAI × POWER HOUSE',
  },
  deezer: {
    name: 'Deezer',
    primaryColor: '#A238FF',
    secondaryColor: '#FFFFFF',
    accentColor: '#FF6B6B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Audio Culture. Brand Investment. The Right Room.',
    partnerNote: 'A co-hosted session on music streaming, artist partnerships, and what authentic cultural positioning means for brands in 2026.',
    logo: 'DEEZER × POWER HOUSE',
  },
  // ─── BATCH 5 ─────────────────────────────────────────────────────────────
  abinbev: {
    name: 'AB InBev',
    primaryColor: '#1A1A2E',
    secondaryColor: '#FFFFFF',
    accentColor: '#E8B84B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Creative Brand Leadership. In the Room That Earns It.',
    partnerNote: 'A co-hosted session on what it takes to sustain creative ambition at scale — with a brand whose Cannes record speaks for itself.',
    logo: 'AB InBev × POWER HOUSE',
  },
  heineken: {
    name: 'Heineken',
    primaryColor: '#006233',
    secondaryColor: '#FFFFFF',
    accentColor: '#C8A84B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Best Ads in the Business. In the Right Room.',
    partnerNote: 'A co-hosted session on brand positioning, cultural relevance, and what it takes to stay genuinely interesting to the next generation.',
    logo: 'HEINEKEN × POWER HOUSE',
  },
  unilever: {
    name: 'Unilever',
    primaryColor: '#1F36C7',
    secondaryColor: '#FFFFFF',
    accentColor: '#EE3524',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Purpose-Led Creativity. At the Highest Level.',
    partnerNote: 'A co-hosted session on what purpose-led marketing looks like in practice — and where it goes next for a brand portfolio of this scale.',
    logo: 'UNILEVER × POWER HOUSE',
  },
  loreal: {
    name: "L'Oreal",
    primaryColor: '#1A1A1A',
    secondaryColor: '#FFFFFF',
    accentColor: '#C8A84B',
    textColor: '#1a1a1a',
    fontFamily: "Georgia, 'Times New Roman', serif",
    heroTagline: 'Beauty. Innovation. The Room That Sets the Standard.',
    partnerNote: 'A co-hosted session on beauty, AI, and the intersection of technology and human creativity in the world\'s most personal category.',
    logo: "L'OREAL × POWER HOUSE",
  },
  adidas: {
    name: 'Adidas',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    accentColor: '#E8B84B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Culture. Sport. Collaboration. The Room That Understands All Three.',
    partnerNote: 'A co-hosted session on cultural partnerships and what it means to build brand relevance through collaboration at the level Adidas Originals operates.',
    logo: 'ADIDAS × POWER HOUSE',
  },
  nike: {
    name: 'Nike',
    primaryColor: '#111111',
    secondaryColor: '#FFFFFF',
    accentColor: '#FA5400',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Sport Culture. Brand Truth. The Room That Gets It.',
    partnerNote: 'A co-hosted session on sport culture and authentic brand storytelling — with the creative leaders whose work sets the industry standard.',
    logo: 'NIKE × POWER HOUSE',
  },
  clearchannel: {
    name: 'Clear Channel',
    primaryColor: '#E4002B',
    secondaryColor: '#FFFFFF',
    accentColor: '#1A1A1A',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'OOH Is Not Dead. It Is Smarter Than Ever.',
    partnerNote: 'A co-hosted session on the future of data-driven outdoor and what it means for brand strategy at the level our residents operate.',
    logo: 'CLEAR CHANNEL × POWER HOUSE',
  },
  // ─── BATCH 6 ─────────────────────────────────────────────────────────────
  gucci: {
    name: 'Gucci',
    primaryColor: '#1A1A1A',
    secondaryColor: '#F5F0E8',
    accentColor: '#C8A84B',
    textColor: '#1a1a1a',
    fontFamily: "Georgia, 'Times New Roman', serif",
    heroTagline: 'Luxury Culture. Creative Leadership. One Room.',
    partnerNote: 'A partnership for a house that has always understood how to engage culture without losing what makes it desirable.',
    logo: 'GUCCI × POWER HOUSE',
  },
  chanel: {
    name: 'Chanel',
    primaryColor: '#1A1A1A',
    secondaryColor: '#FFFFFF',
    accentColor: '#C8A84B',
    textColor: '#1a1a1a',
    fontFamily: "Georgia, 'Times New Roman', serif",
    heroTagline: 'Heritage. Precision. The Conversation That Lasts.',
    partnerNote: 'A partnership for the house that has never needed to follow a trend to remain the most relevant name in luxury.',
    logo: 'CHANEL × POWER HOUSE',
  },
  prada: {
    name: 'Prada',
    primaryColor: '#1A1A1A',
    secondaryColor: '#FFFFFF',
    accentColor: '#E8E0D0',
    textColor: '#1a1a1a',
    fontFamily: "Georgia, 'Times New Roman', serif",
    heroTagline: 'Intellectual Rigour. Cultural Seriousness. The Right Room.',
    partnerNote: 'A partnership for a house that treats culture as patronage, not sponsorship — and earns the distinction every time.',
    logo: 'PRADA × POWER HOUSE',
  },
  ritzcarlton: {
    name: 'Ritz-Carlton',
    primaryColor: '#1A1A2E',
    secondaryColor: '#F5F0E8',
    accentColor: '#C8A84B',
    textColor: '#1a1a1a',
    fontFamily: "Georgia, 'Times New Roman', serif",
    heroTagline: 'The Experience Is the Brand. In Every Detail.',
    partnerNote: 'A branded hospitality partnership for the team that understands that luxury is experienced, not just communicated.',
    logo: 'RITZ-CARLTON × POWER HOUSE',
  },
  rosewood: {
    name: 'Rosewood Hotels',
    primaryColor: '#2C1810',
    secondaryColor: '#F5F0E8',
    accentColor: '#C8A84B',
    textColor: '#1a1a1a',
    fontFamily: "Georgia, 'Times New Roman', serif",
    heroTagline: 'Ultra-Luxury. Cultural Programming. The Right Guests.',
    partnerNote: 'A partnership rooted in the same sensibility — curated, intentional, and entirely right for the people in the room.',
    logo: 'ROSEWOOD × POWER HOUSE',
  },
  philippplein: {
    name: 'Philipp Plein',
    primaryColor: '#0D0D0D',
    secondaryColor: '#FFFFFF',
    accentColor: '#C8A84B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Bold. Unapologetic. The Boldest Room at the Festival.',
    partnerNote: 'A partnership for a brand that has always known that the most memorable activations are the ones that take a position.',
    logo: 'PHILIPP PLEIN × POWER HOUSE',
  },
  revolut: {
    name: 'Revolut',
    primaryColor: '#0D0D0D',
    secondaryColor: '#FFFFFF',
    accentColor: '#7B68EE',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Challenger Brand That Became the Standard.',
    partnerNote: 'A co-hosted session on challenger brand positioning and what building genuine brand trust at scale actually looks like.',
    logo: 'REVOLUT × POWER HOUSE',
  },
  jpmorgan: {
    name: 'JP Morgan',
    primaryColor: '#1A1A2E',
    secondaryColor: '#FFFFFF',
    accentColor: '#C8A84B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Financial Leadership. Creative Investment. One Conversation.',
    partnerNote: 'A co-hosted dinner connecting JP Morgan\'s network with the most senior creative and marketing leaders at Cannes Lions 2026.',
    logo: 'JP MORGAN × POWER HOUSE',
  },
  stripe: {
    name: 'Stripe',
    primaryColor: '#635BFF',
    secondaryColor: '#FFFFFF',
    accentColor: '#00D4FF',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Infrastructure of the Creative Economy. In the Room.',
    partnerNote: 'A co-hosted session on the intersection of developer culture, creative entrepreneurship, and what the data tells us about where it is going.',
    logo: 'STRIPE × POWER HOUSE',
  },
  bmw: {
    name: 'BMW',
    primaryColor: '#1A1A1A',
    secondaryColor: '#FFFFFF',
    accentColor: '#0166B1',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Luxury Mobility. Cultural Credibility. The Right Room.',
    partnerNote: 'A partnership for the brand whose history with creative culture runs deeper than any other in automotive.',
    logo: 'BMW × POWER HOUSE',
  },
  mercedes: {
    name: 'Mercedes-Benz',
    primaryColor: '#1A1A1A',
    secondaryColor: '#FFFFFF',
    accentColor: '#C0C0C0',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Future of Luxury Mobility. In the Most Forward-Looking Room at Cannes.',
    partnerNote: 'A co-hosted session on luxury, the EV transition, and what premium brand storytelling looks like when the category is changing this fast.',
    logo: 'MERCEDES-BENZ × POWER HOUSE',
  },

  // ─── BATCH 7 THEMES ──────────────────────────────────────────────────────

  apple: {
    name: 'Apple',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    accentColor: '#0071E3',
    textColor: '#1a1a1a',
    fontFamily: "-apple-system, 'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Where Creative Leadership Meets Radical Simplicity.',
    partnerNote: 'A partnership for the brand that has shaped how the creative industry thinks about design, story, and what technology should feel like.',
    logo: 'APPLE × POWER HOUSE',
  },
  aws: {
    name: 'AWS',
    primaryColor: '#232F3E',
    secondaryColor: '#FFFFFF',
    accentColor: '#FF9900',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Infrastructure Behind Every Bold Creative Idea.',
    partnerNote: 'A co-hosted session on how cloud, AI, and data are reshaping creative production and marketing at the highest level.',
    logo: 'AWS × POWER HOUSE',
  },
  bbc: {
    name: 'BBC Studios',
    primaryColor: '#BB1919',
    secondaryColor: '#FFFFFF',
    accentColor: '#FFCC00',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Global Storytelling. The Right Room.',
    partnerNote: 'A partnership for the most trusted creative brand in the world and the most senior creative leaders at Cannes.',
    logo: 'BBC STUDIOS × POWER HOUSE',
  },
  bloomberg: {
    name: 'Bloomberg Media',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    accentColor: '#F26522',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Business of Creativity. At the Highest Level.',
    partnerNote: 'A co-hosted session on the intersection of finance, media, and creative leadership for the people who set the agenda.',
    logo: 'BLOOMBERG MEDIA × POWER HOUSE',
  },
  nbcuniversal: {
    name: 'NBCUniversal',
    primaryColor: '#0C0C8A',
    secondaryColor: '#FFFFFF',
    accentColor: '#FFC72C',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Premium Content. Premium Conversations.',
    partnerNote: 'A partnership for the media company bringing the most premium content audiences to the most senior creative room at Cannes.',
    logo: 'NBCUNIVERSAL × POWER HOUSE',
  },
  nvidia: {
    name: 'NVIDIA',
    primaryColor: '#1A1A1A',
    secondaryColor: '#FFFFFF',
    accentColor: '#76B900',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Engine of the Creative AI Revolution.',
    partnerNote: 'A co-hosted session on what generative AI means for creative production, brand building, and the future of the industry.',
    logo: 'NVIDIA × POWER HOUSE',
  },
  salesforce: {
    name: 'Salesforce',
    primaryColor: '#00A1E0',
    secondaryColor: '#FFFFFF',
    accentColor: '#032D60',
    textColor: '#1a1a1a',
    fontFamily: "'Salesforce Sans', 'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Customer Relationships. Creative Leadership.',
    partnerNote: 'A co-hosted session on how AI and CRM are reshaping the way brands build genuine relationships at scale.',
    logo: 'SALESFORCE × POWER HOUSE',
  },
  shopify: {
    name: 'Shopify',
    primaryColor: '#004C3F',
    secondaryColor: '#FFFFFF',
    accentColor: '#95BF47',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Commerce is Culture.',
    partnerNote: 'A partnership for the platform powering the next generation of creative entrepreneurs and the CMOs watching them closely.',
    logo: 'SHOPIFY × POWER HOUSE',
  },
  edelman: {
    name: 'Edelman',
    primaryColor: '#003087',
    secondaryColor: '#FFFFFF',
    accentColor: '#E4002B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Trust is the New Brand Currency.',
    partnerNote: 'A co-hosted session on how earned trust shapes creative effectiveness for the senior leaders who are rebuilding confidence in brand.',
    logo: 'EDELMAN × POWER HOUSE',
  },
  omnicom: {
    name: 'Omnicom',
    primaryColor: '#0033A0',
    secondaryColor: '#FFFFFF',
    accentColor: '#E4002B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Scale Meets Craft. Inside the Most Senior Room at Cannes.',
    partnerNote: 'A co-hosted session on creative effectiveness, talent, and what the next generation of agency leadership looks like.',
    logo: 'OMNICOM × POWER HOUSE',
  },
  vml: {
    name: 'VML',
    primaryColor: '#1D1D1B',
    secondaryColor: '#FFFFFF',
    accentColor: '#E4002B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Connected Creativity at the Highest Level.',
    partnerNote: 'A partnership for the agency built to connect commerce, experience, and creativity in a room full of the people who commission it.',
    logo: 'VML × POWER HOUSE',
  },
  whalar: {
    name: 'Whalar',
    primaryColor: '#1A1A1A',
    secondaryColor: '#FFFFFF',
    accentColor: '#7B2D8B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Creator Economy. Senior Room.',
    partnerNote: 'A co-hosted session on what the creator economy means for brand strategy when the CMOs and creators are finally in the same room.',
    logo: 'WHALAR × POWER HOUSE',
  },
  jcdecaux: {
    name: 'JCDecaux',
    primaryColor: '#003087',
    secondaryColor: '#FFFFFF',
    accentColor: '#E4002B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The World\'s Most Iconic Outdoor Brand. At the Most Senior Table.',
    partnerNote: 'A partnership for the outdoor media leader and the creative decision-makers shaping the future of brand presence in public space.',
    logo: 'JCDECAUX × POWER HOUSE',
  },
  siriusxm: {
    name: 'SiriusXM',
    primaryColor: '#0000AC',
    secondaryColor: '#FFFFFF',
    accentColor: '#00C8FF',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Audio is Back. In the Best Room.',
    partnerNote: 'A co-hosted session on the resurgence of audio and what it means for brand strategy when listeners are this engaged.',
    logo: 'SIRIUSXM × POWER HOUSE',
  },
  deloitte: {
    name: 'Deloitte',
    primaryColor: '#86BC25',
    secondaryColor: '#FFFFFF',
    accentColor: '#00A3E0',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Where Strategy Meets Creative Ambition.',
    partnerNote: 'A co-hosted session on the business case for creative excellence for the CMOs and brand leaders who are already making that argument internally.',
    logo: 'DELOITTE × POWER HOUSE',
  },
  ibm: {
    name: 'IBM',
    primaryColor: '#0530AD',
    secondaryColor: '#FFFFFF',
    accentColor: '#00BCF8',
    textColor: '#1a1a1a',
    fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'AI for Business. In the Room Where Business Gets Made.',
    partnerNote: 'A co-hosted session on how enterprise AI is reshaping the creative and marketing functions for the leaders navigating that shift right now.',
    logo: 'IBM × POWER HOUSE',
  },
  paramount: {
    name: 'Paramount Advertising',
    primaryColor: '#003087',
    secondaryColor: '#FFFFFF',
    accentColor: '#FFC72C',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Premium Audiences. Premium Partnerships.',
    partnerNote: 'A partnership connecting Paramount\'s premium content audiences with the most senior creative and brand leaders at Cannes.',
    logo: 'PARAMOUNT × POWER HOUSE',
  },
  discord: {
    name: 'Discord',
    primaryColor: '#5865F2',
    secondaryColor: '#FFFFFF',
    accentColor: '#FEE75C',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Where Community Becomes Culture.',
    partnerNote: 'A co-hosted session on the role of platform community in brand building for the CMOs whose audiences live there.',
    logo: 'DISCORD × POWER HOUSE',
  },
  taboola: {
    name: 'Taboola',
    primaryColor: '#0078D4',
    secondaryColor: '#FFFFFF',
    accentColor: '#FF6B35',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Open Web Advertising. Senior Conversations.',
    partnerNote: 'A co-hosted session on the open web opportunity for the brand leaders and agency heads deciding where attention budgets go next.',
    logo: 'TABOOLA × POWER HOUSE',
  },
  teads: {
    name: 'Teads',
    primaryColor: '#1A1A2E',
    secondaryColor: '#FFFFFF',
    accentColor: '#00D4AA',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Global Media Platform. In the Best Room.',
    partnerNote: 'A partnership for the premium video advertising leader and the senior marketing leaders whose investment decisions shape the open web.',
    logo: 'TEADS × POWER HOUSE',
  },
  groupblack: {
    name: 'Group Black',
    primaryColor: '#1A1A1A',
    secondaryColor: '#FFFFFF',
    accentColor: '#C8A96E',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Black Ownership. Cultural Authority. The Right Room.',
    partnerNote: 'A co-hosted session at the Diaspora Dinner and inside the Power House on what equitable media investment actually looks like when the most senior decision-makers are in the room.',
    logo: 'GROUP BLACK × POWER HOUSE',
  },
  rtl: {
    name: 'RTL',
    primaryColor: '#E4002B',
    secondaryColor: '#FFFFFF',
    accentColor: '#1A1A1A',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Europe\'s Largest Broadcaster. In the Most Senior Room at Cannes.',
    partnerNote: 'A co-hosted session on European broadcast, streaming, and what premium video means for brand investment across the continent.',
    logo: 'RTL × POWER HOUSE',
  },
  samsung: {
    name: 'Samsung Ads',
    primaryColor: '#1428A0',
    secondaryColor: '#FFFFFF',
    accentColor: '#03C75A',
    textColor: '#1a1a1a',
    fontFamily: "'Samsung One', 'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Connected TV. At the Centre of the Conversation.',
    partnerNote: 'A co-hosted session on smart TV advertising and what CTV means for brand strategy when the audience is this addressable.',
    logo: 'SAMSUNG ADS × POWER HOUSE',
  },
  tmobile: {
    name: 'T-Mobile Advertising Solutions',
    primaryColor: '#E20074',
    secondaryColor: '#FFFFFF',
    accentColor: '#1A1A1A',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'The Un-carrier. In the Most Senior Room at Cannes.',
    partnerNote: 'A co-hosted session on connectivity, 5G, and what mobile-first brand strategy looks like when the CMOs making those decisions are in the room.',
    logo: 'T-MOBILE × POWER HOUSE',
  },
  horizonmedia: {
    name: 'Horizon Media',
    primaryColor: '#FF6200',
    secondaryColor: '#FFFFFF',
    accentColor: '#1A1A1A',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Independent Media. Senior Conversations.',
    partnerNote: 'A partnership for the largest independent media agency in the US and the brand leaders whose decisions they influence.',
    logo: 'HORIZON MEDIA × POWER HOUSE',
  },
  doubleverify: {
    name: 'DoubleVerify',
    primaryColor: '#0033A0',
    secondaryColor: '#FFFFFF',
    accentColor: '#00C8FF',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Media Quality. In the Room That Demands It.',
    partnerNote: 'A co-hosted session on brand safety, media quality, and what responsible advertising investment looks like for the CMOs who are accountable for it.',
    logo: 'DOUBLEVERIFY × POWER HOUSE',
  },
};

function buildDeckHtml(slug: string, theme: BrandTheme): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Indvstry Power House × ${theme.name} — Cannes Lions 2026</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: ${theme.fontFamily};
    color: ${theme.textColor};
    background: #f8f8f6;
    line-height: 1.6;
  }

  /* HERO */
  .hero {
    background: ${theme.primaryColor};
    color: ${theme.secondaryColor};
    padding: 80px 40px 60px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: ${theme.accentColor};
    opacity: 0.12;
  }
  .hero-logo {
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    opacity: 0.7;
    margin-bottom: 28px;
  }
  .hero h1 {
    font-size: clamp(28px, 5vw, 48px);
    font-weight: 900;
    letter-spacing: -0.5px;
    margin-bottom: 16px;
    line-height: 1.15;
  }
  .hero h1 span { color: ${theme.accentColor}; }
  .hero-tagline {
    font-size: 18px;
    opacity: 0.85;
    max-width: 560px;
    margin: 0 auto 32px;
  }
  .hero-badge {
    display: inline-block;
    background: ${theme.accentColor};
    color: ${theme.primaryColor === '#0A0A0A' ? '#fff' : theme.primaryColor};
    padding: 10px 28px;
    border-radius: 32px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  /* STATS */
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0;
    background: ${theme.primaryColor};
    border-top: 1px solid rgba(255,255,255,0.1);
  }
  .stat {
    padding: 32px 20px;
    text-align: center;
    color: ${theme.secondaryColor};
    border-right: 1px solid rgba(255,255,255,0.1);
  }
  .stat:last-child { border-right: none; }
  .stat-num {
    font-size: 36px;
    font-weight: 900;
    color: ${theme.accentColor};
    display: block;
    line-height: 1;
    margin-bottom: 6px;
  }
  .stat-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 2px;
    opacity: 0.7;
  }

  /* CONTENT */
  .section {
    padding: 64px 40px;
    max-width: 900px;
    margin: 0 auto;
  }
  .section + .section {
    padding-top: 0;
  }
  .section-tag {
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: ${theme.accentColor};
    font-weight: 700;
    margin-bottom: 12px;
    display: block;
  }
  .section h2 {
    font-size: 32px;
    font-weight: 800;
    color: ${theme.primaryColor};
    margin-bottom: 20px;
    line-height: 1.2;
  }
  .section p {
    font-size: 16px;
    color: #444;
    margin-bottom: 16px;
    max-width: 700px;
  }
  .highlight-box {
    background: ${theme.primaryColor};
    color: ${theme.secondaryColor};
    border-radius: 12px;
    padding: 32px 36px;
    margin: 32px 0;
  }
  .highlight-box p {
    color: rgba(255,255,255,0.85);
    margin: 0;
    font-size: 17px;
    font-style: italic;
  }

  /* ACTIVATION OPTIONS */
  .activations {
    background: #fff;
    padding: 64px 40px;
    border-top: 4px solid ${theme.accentColor};
  }
  .activations .inner { max-width: 900px; margin: 0 auto; }
  .activation-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 32px;
  }
  .activation-card {
    border: 2px solid ${theme.accentColor};
    border-radius: 10px;
    padding: 28px 24px;
  }
  .activation-card h3 {
    font-size: 15px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${theme.primaryColor};
    margin-bottom: 8px;
  }
  .activation-card .price {
    font-size: 22px;
    font-weight: 900;
    color: ${theme.accentColor};
    margin-bottom: 12px;
  }
  .activation-card p {
    font-size: 13px;
    color: #666;
    margin: 0;
  }

  /* TIERS */
  .tiers {
    padding: 64px 40px;
    background: ${theme.primaryColor};
  }
  .tiers .inner { max-width: 900px; margin: 0 auto; }
  .tiers .section-tag, .tiers h2 { color: ${theme.secondaryColor}; }
  .tiers h2 { margin-bottom: 32px; }
  .tier-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  }
  .tier-card {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 10px;
    padding: 28px 20px;
    text-align: center;
    color: ${theme.secondaryColor};
  }
  .tier-card.featured {
    background: ${theme.accentColor};
    border-color: ${theme.accentColor};
    color: ${theme.primaryColor === '#0A0A0A' || theme.primaryColor === '#1B0A3D' ? '#fff' : theme.primaryColor};
  }
  .tier-name {
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    opacity: 0.7;
    margin-bottom: 12px;
    display: block;
  }
  .tier-price {
    font-size: 28px;
    font-weight: 900;
    margin-bottom: 8px;
  }
  .tier-desc {
    font-size: 12px;
    opacity: 0.75;
  }

  /* VILLA */
  .villa {
    padding: 64px 40px;
    background: #fff;
  }
  .villa .inner { max-width: 900px; margin: 0 auto; }
  .villa-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-top: 32px;
  }
  .villa-feature {
    padding: 20px;
    background: #f8f8f6;
    border-radius: 8px;
    border-left: 4px solid ${theme.accentColor};
  }
  .villa-feature h4 {
    font-size: 14px;
    font-weight: 700;
    color: ${theme.primaryColor};
    margin-bottom: 4px;
  }
  .villa-feature p {
    font-size: 13px;
    color: #666;
    margin: 0;
  }

  /* PARTNER NOTE */
  .partner-note {
    padding: 64px 40px;
    text-align: center;
    background: #f0ece4;
  }
  .partner-note .inner { max-width: 680px; margin: 0 auto; }
  .partner-note h2 {
    font-size: 28px;
    font-weight: 800;
    color: ${theme.primaryColor};
    margin-bottom: 16px;
  }
  .partner-note p {
    font-size: 16px;
    color: #555;
    margin-bottom: 28px;
  }

  /* CTA */
  .cta-button {
    display: inline-block;
    background: ${theme.primaryColor};
    color: ${theme.secondaryColor};
    padding: 16px 40px;
    border-radius: 4px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .cta-button:hover { opacity: 0.85; }

  /* FOOTER */
  footer {
    padding: 32px 40px;
    background: #111;
    color: #888;
    text-align: center;
    font-size: 12px;
  }
  footer strong { color: #fff; }

  @media (max-width: 600px) {
    .hero { padding: 48px 20px 40px; }
    .section { padding: 40px 20px; }
    .activations { padding: 40px 20px; }
    .tiers { padding: 40px 20px; }
    .villa { padding: 40px 20px; }
    .partner-note { padding: 40px 20px; }
  }
</style>
</head>
<body>

<!-- HERO -->
<section class="hero">
  <div class="hero-logo">${theme.logo}</div>
  <h1>Indvstry <span>Power House</span><br>Cannes Lions 2026</h1>
  <p class="hero-tagline">${theme.heroTagline}</p>
  <span class="hero-badge">Cannes &nbsp;·&nbsp; 16–22 June 2026</span>
</section>

<!-- STATS BAR -->
<div class="stats">
  <div class="stat"><span class="stat-num">€75K+</span><span class="stat-label">Delegate Passes</span></div>
  <div class="stat"><span class="stat-num">30</span><span class="stat-label">Senior Leaders</span></div>
  <div class="stat"><span class="stat-num">7</span><span class="stat-label">Bedroom Villa</span></div>
  <div class="stat"><span class="stat-num">5</span><span class="stat-label">Days Activation</span></div>
</div>

<!-- ABOUT -->
<div class="section">
  <span class="section-tag">About</span>
  <h2>The Power House</h2>
  <p>
    Indvstry Power House is a private villa activation running alongside Cannes Lions 2026 — a curated residence
    hosting 30 of the most senior creative, marketing, and cultural leaders in the industry for five days of
    closed-door conversation, shared meals, and genuine connection.
  </p>
  <p>
    We hold over <strong>€75,000 in Cannes Lions delegate passes</strong> and are intentional about who gets
    access. The villa is 30 minutes from the festival by car — far enough from the noise,
    close enough to the action.
  </p>
  <div class="highlight-box">
    <p>"This is not another beach event. It is the room where the industry's most important conversations
    happen — privately, honestly, and away from the agenda."<br><br>
    — George Guise, Founder, Indvstry Clvb</p>
  </div>
  <p>
    ${theme.partnerNote}
  </p>
</div>

<!-- ACTIVATION OPTIONS -->
<div class="activations">
  <div class="inner">
    <span class="section-tag">Partnership Formats</span>
    <h2>What We Can Build Together</h2>
    <div class="activation-grid">
      <div class="activation-card">
        <h3>Branded Panel</h3>
        <div class="price">€20K–€30K</div>
        <p>Host a closed-door panel inside the villa with our 30 senior residents. Your brand leads the conversation.</p>
      </div>
      <div class="activation-card">
        <h3>Diaspora Dinner</h3>
        <div class="price">€25K–€35K</div>
        <p>An intimate dinner at Epi Beach (June 23) celebrating diverse creative talent. 50 curated guests. Your brand owns the moment.</p>
      </div>
      <div class="activation-card">
        <h3>Poolside Mixer</h3>
        <div class="price">€15K–€20K</div>
        <p>An evening at the villa for senior leaders from across Cannes. Relaxed, memorable, high-value networking.</p>
      </div>
      <div class="activation-card">
        <h3>Villa Raffle</h3>
        <div class="price">€25K–€35K</div>
        <p>Award one night in the villa to a rising creative. Massive goodwill, massive reach. Tied to your brand.</p>
      </div>
    </div>
  </div>
</div>

<!-- TIERS -->
<div class="tiers">
  <div class="inner">
    <span class="section-tag">Investment</span>
    <h2>Partnership Tiers</h2>
    <div class="tier-grid">
      <div class="tier-card">
        <span class="tier-name">Supporting</span>
        <div class="tier-price">€25K</div>
        <div class="tier-desc">Brand presence + access to curated sessions</div>
      </div>
      <div class="tier-card featured">
        <span class="tier-name">Silver</span>
        <div class="tier-price">€50K</div>
        <div class="tier-desc">Hosted activation + delegate passes included</div>
      </div>
      <div class="tier-card">
        <span class="tier-name">Gold</span>
        <div class="tier-price">€100K</div>
        <div class="tier-desc">Full programme co-hosting + media coverage</div>
      </div>
      <div class="tier-card">
        <span class="tier-name">Headline</span>
        <div class="tier-price">€200K+</div>
        <div class="tier-desc">Exclusive naming rights + bespoke activation design</div>
      </div>
    </div>
  </div>
</div>

<!-- VILLA SPECS -->
<div class="villa">
  <div class="inner">
    <span class="section-tag">The Venue</span>
    <h2>Private Villa, Côte d'Azur</h2>
    <p>Our residence for the week — a 7-bedroom private villa on the Côte d'Azur, 30 minutes from the festival by car.
       ERA (Extended Reality Agency) is our official venue partner.</p>
    <div class="villa-features">
      <div class="villa-feature">
        <h4>Location</h4>
        <p>Côte d'Azur — 30 min from the festival by car</p>
      </div>
      <div class="villa-feature">
        <h4>Capacity</h4>
        <p>7 bedrooms, full residential facilities, private pool</p>
      </div>
      <div class="villa-feature">
        <h4>Dates</h4>
        <p>16–22 June 2026, running alongside Cannes Lions</p>
      </div>
      <div class="villa-feature">
        <h4>Residents</h4>
        <p>30 senior creative, marketing &amp; cultural leaders</p>
      </div>
      <div class="villa-feature">
        <h4>Media Partner</h4>
        <p>TSB (900K+ Instagram following) — all activations covered</p>
      </div>
      <div class="villa-feature">
        <h4>Passes</h4>
        <p>€75,000+ in Cannes Lions delegate passes to distribute</p>
      </div>
    </div>
  </div>
</div>

<!-- PARTNER NOTE / CTA -->
<div class="partner-note">
  <div class="inner">
    <h2>Ready to talk?</h2>
    <p>
      We are building the most intentional activation at Cannes Lions 2026. If you want to be part of a
      conversation that actually moves the industry forward, let's get in a room.
    </p>
    <a class="cta-button" href="https://calendly.com/itsvisionnaire/30min">
      Book a call with George
    </a>
    <br><br>
    <p style="font-size:14px;color:#888;">
      Or email us at <a href="mailto:amber@indvstryclvb.com" style="color:${theme.primaryColor};">amber@indvstryclvb.com</a>
    </p>
  </div>
</div>

<!-- FOOTER -->
<footer>
  <strong>Indvstry Clvb</strong> &nbsp;·&nbsp; Power House Cannes Lions 2026 &nbsp;·&nbsp;
  <a href="https://powerhouse.indvstryclvb.com" style="color:${theme.accentColor};">powerhouse.indvstryclvb.com</a>
  <br><br>
  &copy; 2026 Indvstry Clvb. All rights reserved. This document is confidential and intended solely for ${theme.name}.
</footer>

</body>
</html>`;
}

// Register a route for each brand
Object.entries(themes).forEach(([slug, theme]) => {
  router.get(`/${slug}`, (_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(buildDeckHtml(slug, theme));
  });
});

// Index of all decks (admin only)
router.get('/', (_req, res) => {
  const links = Object.keys(themes)
    .map(s => `<li><a href="/deck/${s}">/deck/${s}</a></li>`)
    .join('');
  res.send(`<h2>Power House Decks</h2><ul>${links}</ul>`);
});

// Generic fallback — any unknown slug gets a clean Indvstry-branded deck
router.get('/:slug', (req, res) => {
  const slug = req.params.slug;
  const companyName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  const fallbackTheme: BrandTheme = {
    name: companyName,
    primaryColor: '#0D0D0D',
    secondaryColor: '#FFFFFF',
    accentColor: '#C8A84B',
    textColor: '#1a1a1a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    heroTagline: 'Where the Right Conversations Happen.',
    partnerNote: `A partnership built for ${companyName} — designed to put the right people in the right room at Cannes Lions 2026.`,
    logo: `${companyName.toUpperCase()} × POWER HOUSE`,
  };
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(buildDeckHtml(slug, fallbackTheme));
});

export default router;
