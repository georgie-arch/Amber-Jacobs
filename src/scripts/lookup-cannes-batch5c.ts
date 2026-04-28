/**
 * lookup-cannes-batch5c.ts — third-pass with fresh domain variants
 * Run: npx ts-node --project tsconfig.json src/scripts/lookup-cannes-batch5c.ts
 */

import { findEmailsBatch } from '../integrations/email-waterfall';

const contacts = [
  // The Climb Marketing Club — try theclimb.co.uk and climbmktg.com
  { firstName: 'Ritchie', lastName: 'Mehta',       domain: 'theclimb.co.uk',        name: 'Ritchie Mehta (The Climb) v3' },
  { firstName: 'Mark',    lastName: 'Evans',        domain: 'theclimb.co.uk',        name: 'Mark Evans (The Climb) v3' },
  // DAIVID — try company LinkedIn-linked domain
  { firstName: 'Ian',     lastName: 'Forrester',    domain: 'wearedaivid.com',       name: 'Ian Forrester (DAIVID) v3' },
  // Heineken Mexico
  { firstName: 'Marta',   lastName: 'Garcia',       domain: 'heineken.mx',           name: 'Marta Garcia Alonso (Heineken) v3' },
  // Biolumina — IPG/McCann healthcare network
  { firstName: 'Laura',   lastName: 'Florence',     domain: 'biolumina-oncology.com',name: 'Laura Florence (Biolumina) v3' },
  // Contagious — their actual domain
  { firstName: 'Alex',    lastName: 'Jenkins',      domain: 'contagious.com',        name: 'Alex Jenkins (Contagious) v3' },
  { firstName: 'Chloe',   lastName: 'Markowicz',    domain: 'contagious.com',        name: 'Chloe Markowicz (Contagious) v3' },
  // Smarts — Irish creative agency
  { firstName: 'Natalie', lastName: 'Moores',       domain: 'smarts.agency',         name: 'Natalie Moores (Smarts) v3' },
  // Rethink — try rethink.com
  { firstName: 'Aaron',   lastName: 'Starkman',     domain: 'rethink.com',           name: 'Aaron Starkman (Rethink) v3' },
  // Sian Proctor — NASA/astronaut personal
  { firstName: 'Sian',    lastName: 'Proctor',      domain: 'sianproctor.com',       name: 'Dr Sian Proctor v3' },
  // UNOOSA — Vienna-based UN office
  { firstName: 'Aarti',   lastName: 'Holla-Maini',  domain: 'unvienna.org',          name: 'Aarti Holla-Maini (UNOOSA) v3' },
  // Marcus Collins — Michigan Ross business school
  { firstName: 'Marcus',  lastName: 'Collins',      domain: 'umich.edu',             name: 'Marcus Collins (UMich) v3' },
  // e.l.f. Beauty — try e.l.f. domain variants
  { firstName: 'Kory',    lastName: 'Marchisotto',  domain: 'elf.com',               name: 'Kory Marchisotto (e.l.f.) v3' },
  { firstName: 'Tarang',  lastName: 'Amin',         domain: 'elf.com',               name: 'Tarang Amin (e.l.f.) v3' },
  // AB InBev — try global HQ domain
  { firstName: 'Marcel',  lastName: 'Marcondes',    domain: 'ab-inbev.com',          name: 'Marcel Marcondes (AB InBev) v3' },
  // Mindscapes — try mindscapesgroup.com
  { firstName: 'Ravid',   lastName: 'Kuperberg',    domain: 'mindscapesgroup.com',   name: 'Ravid Kuperberg (Mindscapes) v3' },
  // Polaroid — part of Polaroid Originals / IMPOSSIBLE group
  { firstName: 'Patricia',lastName: 'Varella',      domain: 'polaroidoriginals.com', name: 'Patricia Varella (Polaroid) v3' },
  // Estée Lauder Companies
  { firstName: 'Aude',    lastName: 'Gandon',       domain: 'esteelauder.com',       name: 'Aude Gandon (ELC) v3' },
  // Accenture Song — try song.accenture.com style
  { firstName: 'Hiroyuki',lastName: 'Yokoi',        domain: 'accenture.com',         name: 'Hiroyuki Yokoi (Accenture Song) v3' },
  // Kateryna Sadurska — try personal/freediving domain
  { firstName: 'Kateryna',lastName: 'Sadurska',     domain: 'katerynadives.com',     name: 'Kateryna Sadurska (Freediver) v3' },
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
