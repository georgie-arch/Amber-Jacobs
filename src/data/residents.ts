/**
 * residents.ts
 *
 * Confirmed Indvstry Power House villa residents for Cannes Lions 2026.
 *
 * THIS IS THE SINGLE SOURCE OF TRUTH — update this file to add/remove residents.
 * All event registration scripts import from here.
 *
 * To add a resident: copy the object template below and add to RESIDENTS array.
 * To register everyone for a new event:
 *   npm run events:sync
 *
 * Event registration status is tracked in src/data/event-registrations.json.
 */

export interface Resident {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  location: string;
  phone: string;
  linkedinUrl: string;
  instagramUrl?: string;
  website?: string;
}

// ─── CONFIRMED RESIDENTS ──────────────────────────────────────────────────────

export const RESIDENTS: Resident[] = [
  {
    firstName: 'George',
    lastName: 'Guise',
    email: 'George@soabparty.com',
    company: 'Soab Party',
    jobTitle: 'Founder',
    location: 'London, UK',
    phone: '+44 7438 932403',
    linkedinUrl: 'https://www.linkedin.com/in/george-guise-0377961a9/',
    website: 'https://www.indvstryclvb.com',
  },
  {
    firstName: 'Dinalva',
    lastName: 'Tavares',
    email: 'contact@missdinalva.com',
    company: 'Miss Dinalva',
    jobTitle: 'Brand Partnerships & Events Manager',
    location: 'London, UK',
    phone: '+44 7700 182341',
    linkedinUrl: 'https://www.linkedin.com/in/dinalvatavares/',
  },
  {
    firstName: 'Anthony',
    lastName: 'Okoro',
    email: 'aokoro@ebay.com',
    company: 'eBay',
    jobTitle: 'Senior Director, Ads New Ventures',
    location: 'Unknown',
    phone: '+1 (408) 398-6221',
    linkedinUrl: 'https://www.linkedin.com/in/anthonyokoro/',
    website: 'https://www.ebay.com',
  },
  {
    firstName: 'Kelly',
    lastName: 'Adanna',
    email: 'Kelly@indvstryclvb.com',
    company: 'ADA Collective',
    jobTitle: 'Talent Manager',
    location: 'London, UK',
    phone: '+447741687451',
    linkedinUrl: 'https://www.linkedin.com/in/kelly-adanna/',
    instagramUrl: 'https://www.instagram.com/kellyadanna/',
  },
  {
    firstName: 'LaToya',
    lastName: 'Shambo',
    email: 'latoya.shambo@blackgirldigital.com',
    company: 'Black Girl Digital',
    jobTitle: 'CEO & Founder',
    location: 'New York, USA',
    phone: '+13475853876',
    linkedinUrl: 'https://www.linkedin.com/in/latoyashambo/',
    website: 'https://www.blackgirldigital.com',
  },
  {
    firstName: 'Olga',
    lastName: 'Viktorova',
    email: 'info@framrlab.com',
    company: 'Framr Lab',
    jobTitle: 'Founder & CEO',
    location: 'London, UK',
    phone: '+31 6 21394449',
    linkedinUrl: 'https://www.linkedin.com/in/olgaviktrv/',
  },
  {
    firstName: 'Chanelle',
    lastName: 'Pal',
    email: 'hello@chanstudio.co',
    company: 'Chan Studio',
    jobTitle: 'Founder & Creative Director',
    location: 'London, UK',
    phone: '+447366389012',
    linkedinUrl: 'https://www.linkedin.com/in/chanellepal/',
    website: 'https://www.chanstudio.co',
  },
  {
    firstName: 'Romy',
    lastName: 'Gama',
    email: 'romy@indvstryclvb.com',
    company: 'Indvstry Clvb',
    jobTitle: 'Creative Director',
    location: 'London, UK',
    phone: '+44 7754 763362',
    linkedinUrl: 'https://www.linkedin.com/in/romy-gama-82663a182/',
  },
  {
    firstName: 'Silva',
    lastName: 'Stone',
    email: 'Me@silvastonemusic.com',
    company: 'White Hut Studios',
    jobTitle: 'Recording Studio Owner',
    location: 'London, UK',
    phone: '+447985425105',
    linkedinUrl: 'https://www.linkedin.com/in/davidson-lynch-shyllon-a3583a34/',
  },
  {
    firstName: 'Abi',
    lastName: 'Blend',
    email: 'Abi@cr8focus.com',
    company: 'Cr8 Focus',
    jobTitle: 'New Business Manager',
    location: 'London, UK',
    phone: '+44 7700 193456',
    linkedinUrl: 'https://www.linkedin.com/in/mrblend/',
  },
];

// ─── EVENT REGISTRATION LOG ───────────────────────────────────────────────────
// Runtime status is tracked in src/data/event-registrations.json.
// This static log is kept for reference only.

export interface EventRegistration {
  eventName: string;
  eventUrl: string;
  date: string;           // ISO date registration was completed
  registeredResidents: string[]; // firstName + lastName of who was registered
  notes?: string;
}

export const REGISTERED_EVENTS: EventRegistration[] = [
  {
    eventName: 'FQ Beach @ Cannes Lions 2026',
    eventUrl: 'https://events.thefemalequotient.com/canneslions26',
    date: '2026-04-05',
    registeredResidents: ['George Guise'],
    notes: 'Test run — George only. Full sync pending.',
  },
  {
    eventName: 'Opening Red Carpet Celebration of Women in Creativity',
    eventUrl: 'https://worldwomanfoundation.com/cannes2026/open-mic/',
    date: '2026-05-10',
    registeredResidents: [
      'George Guise',
      'Dinalva Tavares',
      'Anthony Okoro',
      'Kelly Adanna',
      'LaToya Shambo',
      'Olga Viktorova',
      'Chanelle Pal',
      'Romy Gama',
      'Silva Stone',
      'Abi Blend',
    ],
    notes: 'All 10 residents successfully signed up for Event 1: Opening Red Carpet Celebration of Women in Creativity, June 22, 2026, 7:00-10:00 PM, La Scène des Artistes at the World Woman Cannes Agenda.',
  },
];
