/**
 * lookup-cannes-batch5.ts — waterfall email lookup for batch 5 contacts
 * Run: npx ts-node --project tsconfig.json src/scripts/lookup-cannes-batch5.ts
 */

import { findEmailsBatch } from '../integrations/email-waterfall';

const contacts = [
  { firstName: 'Ritchie',   lastName: 'Mehta',         domain: 'theclimbmarketingclub.com', name: 'Ritchie Mehta (The Climb)' },
  { firstName: 'Mark',      lastName: 'Evans',          domain: 'theclimbmarketingclub.com', name: 'Mark Evans (The Climb)' },
  { firstName: 'Julia',     lastName: 'Holtback Yeter', domain: 'fbo.com',                  name: 'Julia Holtback Yeter (Forsman & Bodenfors)' },
  { firstName: 'Ian',       lastName: 'Forrester',      domain: 'daivid.com',               name: 'Ian Forrester (DAIVID)' },
  { firstName: 'Marta',     lastName: 'Garcia',         domain: 'heineken.com',             name: 'Marta Garcia Alonso (Heineken Mexico)' },
  { firstName: 'Laura',     lastName: 'Florence',       domain: 'biolumina.com',            name: 'Laura Florence (Biolumina)' },
  { firstName: 'Alex',      lastName: 'Jenkins',        domain: 'contagious.com',           name: 'Alex Jenkins (Contagious)' },
  { firstName: 'Chloe',     lastName: 'Markowicz',      domain: 'contagious.com',           name: 'Chloe Markowicz (Contagious)' },
  { firstName: 'Natalie',   lastName: 'Moores',         domain: 'smartscomms.com',          name: 'Natalie Moores (Smarts)' },
  { firstName: 'Kateryna',  lastName: 'Sadurska',       domain: 'space2inspire.com',        name: 'Kateryna Sadurska (Athlete/Freediver)' },
  { firstName: 'Aaron',     lastName: 'Starkman',       domain: 'rethinkideas.com',         name: 'Aaron Starkman (Rethink)' },
  { firstName: 'Sian',      lastName: 'Proctor',        domain: 'space2inspire.com',        name: 'Dr Sian Proctor (Space2inspire)' },
  { firstName: 'Aarti',     lastName: 'Holla-Maini',    domain: 'un.org',                  name: 'Aarti Holla-Maini (UNOOSA)' },
  { firstName: 'Marcus',    lastName: 'Collins',        domain: 'umich.edu',               name: 'Marcus Collins (University of Michigan)' },
  { firstName: 'Kory',      lastName: 'Marchisotto',    domain: 'elfbeauty.com',           name: 'Kory Marchisotto (e.l.f. Beauty)' },
  { firstName: 'Tarang',    lastName: 'Amin',           domain: 'elfbeauty.com',           name: 'Tarang Amin (e.l.f. Beauty)' },
  { firstName: 'Marcel',    lastName: 'Marcondes',      domain: 'ab-inbev.com',            name: 'Marcel Marcondes (AB InBev)' },
  { firstName: 'Ravid',     lastName: 'Kuperberg',      domain: 'mindscapes.co.il',        name: 'Ravid Kuperberg (Mindscapes)' },
  { firstName: 'Patricia',  lastName: 'Varella',        domain: 'polaroid.com',            name: 'Patricia Varella (Polaroid)' },
  { firstName: 'Aude',      lastName: 'Gandon',         domain: 'esteelauder.com',         name: 'Aude Gandon (Estée Lauder)' },
  { firstName: 'Hiroyuki',  lastName: 'Yokoi',          domain: 'accenture.com',           name: 'Hiroyuki Yokoi (Accenture Song)' },
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
