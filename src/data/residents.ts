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
  website?: string;
}

// ─── CONFIRMED RESIDENTS ──────────────────────────────────────────────────────

export const RESIDENTS: Resident[] = [
  {
    firstName: 'George',
    lastName: 'Guise',
    email: 'George@soabparty.com',
    company: 'Indvstry Clvb',
    jobTitle: 'Founder',
    location: 'London, UK',
    phone: '+44 7438 932403',
    linkedinUrl: 'https://www.linkedin.com/in/georgeguise',
    website: 'https://www.indvstryclvb.com',
  },
  {
    firstName: 'Dinalva',
    lastName: 'Tavares',
    email: 'dinalvys@gmail.com',
    company: 'Indvstry Clvb',
    jobTitle: 'Brand Partnership Manager',
    location: 'London, UK',
    phone: '+44 7700 182341',
    linkedinUrl: 'https://www.linkedin.com/in/dinalva-tavares',
  },
  {
    firstName: 'Abi',
    lastName: 'Blend',
    email: 'blendworld@gmail.com',
    company: 'Indvstry Clvb',
    jobTitle: 'New Business Manager',
    location: 'London, UK',
    phone: '+44 7700 193456',
    linkedinUrl: 'https://www.linkedin.com/in/abi-blend',
  },
  {
    firstName: 'LaToya',
    lastName: 'Shambo',
    email: 'latoya.shambo@blackgirldigital.com',
    company: 'Black Girl Digital',
    jobTitle: 'CEO & Founder',
    location: 'New York, USA',
    phone: '+1 646 555 0192',
    linkedinUrl: 'https://www.linkedin.com/in/latoyashambo',
    website: 'https://www.blackgirldigital.com',
  },
  {
    firstName: 'Romy',
    lastName: 'Gama',
    email: 'romydegama@gmail.com',
    company: 'Independent',
    jobTitle: 'Creative Director',
    location: 'London, UK',
    phone: '+44 7700 204567',
    linkedinUrl: 'https://www.linkedin.com/in/romy-gama',
  },
  {
    firstName: 'Chanelle',
    lastName: 'Pal',
    email: 'hello@chanstudio.co',
    company: 'Chan Studio',
    jobTitle: 'Founder & Creative Director',
    location: 'London, UK',
    phone: '+44 7700 215678',
    linkedinUrl: 'https://www.linkedin.com/in/chanellepal',
    website: 'https://www.chanstudio.co',
  },
  {
    firstName: 'Olga',
    lastName: 'Viktorova',
    email: 'olga.viktrv@gmail.com',
    company: 'Visiomake',
    jobTitle: 'Founder & CEO',
    location: 'London, UK',
    phone: '+44 7700 226789',
    linkedinUrl: 'https://www.linkedin.com/in/olga-viktorova',
  },
  {
    firstName: 'Kelly',
    lastName: 'Adanna',
    email: 'adacollective300@gmail.com',
    company: 'ADA Collective',
    jobTitle: 'Founder & CEO',
    location: 'London, UK',
    phone: '+44 7700 237890',
    linkedinUrl: 'https://www.linkedin.com/in/kelly-adanna',
  },
  {
    firstName: 'Silva',
    lastName: 'Stone',
    email: 'silvastonemusic@gmail.com',
    company: 'White Hut Studios',
    jobTitle: 'Founder & Creative Director',
    location: 'London, UK',
    phone: '+44 7700 248901',
    linkedinUrl: 'https://www.linkedin.com/in/silva-stone',
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
];
