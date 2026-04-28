/**
 * lookup-cannes-batch5b.ts — retry with alternative domains
 * Run: npx ts-node --project tsconfig.json src/scripts/lookup-cannes-batch5b.ts
 */

import { findEmailsBatch } from '../integrations/email-waterfall';

const contacts = [
  // The Climb — try alternate domains
  { firstName: 'Ritchie',   lastName: 'Mehta',         domain: 'theclimb.club',      name: 'Ritchie Mehta (The Climb) v2' },
  { firstName: 'Mark',      lastName: 'Evans',          domain: 'theclimb.club',      name: 'Mark Evans (The Climb) v2' },
  // DAIVID
  { firstName: 'Ian',       lastName: 'Forrester',      domain: 'daivid.io',          name: 'Ian Forrester (DAIVID) v2' },
  // Heineken Mexico — try heineken.com.mx
  { firstName: 'Marta',     lastName: 'Garcia',         domain: 'heineken.com.mx',    name: 'Marta Garcia Alonso (Heineken MX) v2' },
  // Biolumina — McCann Health company
  { firstName: 'Laura',     lastName: 'Florence',       domain: 'mccannhealth.com',   name: 'Laura Florence (Biolumina/McCann) v2' },
  // Contagious — try different TLD
  { firstName: 'Alex',      lastName: 'Jenkins',        domain: 'contagious.io',      name: 'Alex Jenkins (Contagious) v2' },
  { firstName: 'Chloe',     lastName: 'Markowicz',      domain: 'contagious.io',      name: 'Chloe Markowicz (Contagious) v2' },
  // Smarts — try smartsgroup.com
  { firstName: 'Natalie',   lastName: 'Moores',         domain: 'smartsgroup.com',    name: 'Natalie Moores (Smarts) v2' },
  // Aaron Starkman — Rethink Canada
  { firstName: 'Aaron',     lastName: 'Starkman',       domain: 'rethinkcanada.com',  name: 'Aaron Starkman (Rethink) v2' },
  // Sian Proctor — astronaut, try personal domain
  { firstName: 'Sian',      lastName: 'Proctor',        domain: 'drsianproctor.com',  name: 'Dr Sian Proctor v2' },
  // UNOOSA — try unoosa.org
  { firstName: 'Aarti',     lastName: 'Holla-Maini',    domain: 'unoosa.org',         name: 'Aarti Holla-Maini (UNOOSA) v2' },
  // Marcus Collins — Michigan Ross
  { firstName: 'Marcus',    lastName: 'Collins',        domain: 'bus.umich.edu',      name: 'Marcus Collins (Michigan Ross) v2' },
  // e.l.f. Beauty — try elfcosmetics.com
  { firstName: 'Kory',      lastName: 'Marchisotto',    domain: 'elfcosmetics.com',   name: 'Kory Marchisotto (e.l.f.) v2' },
  { firstName: 'Tarang',    lastName: 'Amin',           domain: 'elfcosmetics.com',   name: 'Tarang Amin (e.l.f.) v2' },
  // AB InBev — try anheuserbuschinbev.com
  { firstName: 'Marcel',    lastName: 'Marcondes',      domain: 'anheuser-busch.com', name: 'Marcel Marcondes (AB InBev) v2' },
  // Mindscapes — try mindscapes.com
  { firstName: 'Ravid',     lastName: 'Kuperberg',      domain: 'mindscapes.com',     name: 'Ravid Kuperberg (Mindscapes) v2' },
  // Polaroid
  { firstName: 'Patricia',  lastName: 'Varella',        domain: 'polaroid.com',       name: 'Patricia Varella (Polaroid) v2' },
  // Estée Lauder — try elcompanies.com
  { firstName: 'Aude',      lastName: 'Gandon',         domain: 'elcompanies.com',    name: 'Aude Gandon (ELC) v2' },
  // Accenture Song — accenture emails
  { firstName: 'Hiroyuki',  lastName: 'Yokoi',          domain: 'accenture.com',      name: 'Hiroyuki Yokoi (Accenture) v2' },
];

findEmailsBatch(contacts).then(results => {
  console.log('\n=== SUMMARY ===');
  const found = results.filter(r => r.email);
  const notFound = results.filter(r => !r.email);
  console.log(`Found: ${found.length}/${results.length}`);
  found.forEach(r => console.log(`  FOUND  ${r.name}: ${r.email} (${r.source}, ${r.confidence}%)`));
  console.log(`Not found: ${notFound.length}`);
  notFound.forEach(r => console.log(`  MISS   ${r.name}`));
}).catch(console.error);
