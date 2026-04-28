/**
 * lookup-cannes-judges-all.ts
 *
 * Waterfall email lookup for all Cannes Lions 2026 judges / programme speakers
 * who do not yet have a confirmed email address.
 *
 * Skips the 16 contacts already covered in email-cannes-judges-batch1.ts.
 * Saves results to src/data/cannes-judges-lookup-results.json.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/lookup-cannes-judges-all.ts
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { findEmail } from '../integrations/email-waterfall';

interface Contact {
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  domain: string;
  linkedin: string;
}

interface LookupRecord {
  name: string;
  title: string;
  company: string;
  domain: string;
  linkedin: string;
  email: string | null;
  confidence: number;
  source: string;
}

const RESULTS_FILE = path.resolve(__dirname, '../data/cannes-judges-lookup-results.json');

// ─── CONTACTS TO LOOK UP ──────────────────────────────────────────────────────
// Sorted by domain so providers with pattern caching get max benefit.
// Contacts with no guessable domain are omitted — send to LinkedIn list instead.

const CONTACTS: Contact[] = [
  // ── 72andSunny ──
  { name: 'Matt Murphy',               firstName: 'Matt',      lastName: 'Murphy',              title: 'Global CCO',                             company: '72andSunny',                        domain: '72andsunny.com',          linkedin: 'https://www.linkedin.com/in/mattmurphy/' },

  // ── Accenture Song / Droga5 ──
  { name: 'Pelle Sjoenell',            firstName: 'Pelle',     lastName: 'Sjoenell',            title: 'Former Worldwide CCO (Droga5)',           company: 'Accenture Song',                    domain: 'accenture.com',           linkedin: 'https://www.linkedin.com/in/pellesjoenell/' },
  { name: 'Danni Pinch',               firstName: 'Danni',     lastName: 'Pinch',               title: 'Executive Creative Director',            company: 'Accenture Song',                    domain: 'accenture.com',           linkedin: 'https://www.linkedin.com/in/dannipinch/' },
  { name: 'Ikuko Ohta',                firstName: 'Ikuko',     lastName: 'Ohta',                title: 'Chief Strategy Officer',                 company: 'Droga5 Tokyo (Accenture Song)',      domain: 'accenture.com',           linkedin: 'https://www.linkedin.com/in/ikuko-ohta-33161320/' },
  { name: 'Damon Stapleton',           firstName: 'Damon',     lastName: 'Stapleton',           title: 'Chief Creative Officer',                 company: 'Droga5 ANZ',                        domain: 'droga5.com',              linkedin: 'https://www.linkedin.com/in/damonstapleton/' },
  { name: 'Brisa Vicente',             firstName: 'Brisa',     lastName: 'Vicente',             title: 'Co-CEO',                                 company: 'Droga5 São Paulo',                  domain: 'droga5.com',              linkedin: 'https://www.linkedin.com/in/brisavicente/' },

  // ── AKQA ──
  { name: 'Tim Devine',                firstName: 'Tim',       lastName: 'Devine',              title: 'Chief Invention Officer',                company: 'AKQA',                              domain: 'akqa.com',                linkedin: 'https://www.linkedin.com/in/timdevine/' },

  // ── AB InBev ──
  { name: 'Marcel Marcondes',          firstName: 'Marcel',    lastName: 'Marcondes',           title: 'Global CMO',                             company: 'AB InBev',                          domain: 'ab-inbev.com',            linkedin: 'https://www.linkedin.com/in/marcel-marcondes/' },

  // ── AXA ──
  { name: 'Virginie Bercot',           firstName: 'Virginie',  lastName: 'Bercot',              title: 'Global Brand Director',                  company: 'AXA',                               domain: 'axa.com',                 linkedin: 'https://www.linkedin.com/in/virginiebercot/' },

  // ── BBDO ──
  { name: 'Chris Beresford-Hill',      firstName: 'Chris',     lastName: 'Beresford-Hill',      title: 'Worldwide CCO',                          company: 'BBDO Worldwide',                    domain: 'bbdo.com',                linkedin: 'https://www.linkedin.com/in/chrisberesfordhill/' },
  { name: 'Josh Gross',                firstName: 'Josh',      lastName: 'Gross',               title: 'Chief Creative Officer',                 company: 'BBDO Chicago',                      domain: 'bbdo.com',                linkedin: 'https://www.linkedin.com/in/joshgross/' },
  { name: 'Rana Sadek',                firstName: 'Rana',      lastName: 'Sadek',               title: 'Senior Creative Director',               company: 'Impact BBDO Dubai',                 domain: 'impact-bbdo.com',         linkedin: 'https://www.linkedin.com/in/ranasadek/' },

  // ── BETC / Havas Creative Network ──
  { name: 'Bertille Toledano',         firstName: 'Bertille',  lastName: 'Toledano',            title: 'CEO & President',                        company: 'BETC and Havas Creative Network',   domain: 'betc.com',                linkedin: 'https://www.linkedin.com/in/bertille-toledano-63303623/' },
  { name: 'Emma Lax',                  firstName: 'Emma',      lastName: 'Lax',                 title: 'Global Head of Intelligence & Innovation', company: 'Havas Creative Network',          domain: 'havas.com',               linkedin: 'https://www.linkedin.com/in/emmalax/' },

  // ── Cheil ──
  { name: 'Lili Jiang',                firstName: 'Lili',      lastName: 'Jiang',               title: 'Executive Creative Director',            company: 'Cheil Hong Kong',                   domain: 'cheil.com',               linkedin: 'https://www.linkedin.com/in/lilijiang/' },

  // ── Clemenger BBDO ──
  { name: 'Amy Weston',                firstName: 'Amy',       lastName: 'Weston',              title: 'Executive Creative Director',            company: 'Clemenger BBDO',                    domain: 'clemengerbbdo.com.au',    linkedin: 'https://www.linkedin.com/in/amy-weston-8588521/' },

  // ── Coca-Cola ──
  { name: 'Islam ElDessouky',          firstName: 'Islam',     lastName: 'ElDessouky',          title: 'Global VP Creative',                     company: 'The Coca-Cola Company',             domain: 'coca-cola.com',           linkedin: 'https://www.linkedin.com/in/islameldessouky/' },
  { name: 'AP Chaney',                 firstName: 'AP',        lastName: 'Chaney',              title: 'Senior Director, Creative',              company: 'The Coca-Cola Company',             domain: 'coca-cola.com',           linkedin: 'https://www.linkedin.com/in/apchaney/' },

  // ── Colenso BBDO (already in batch1, skip) ──

  // ── DDB ──
  { name: 'Matt Gay',                  firstName: 'Matt',      lastName: 'Gay',                 title: 'Executive Creative Director',            company: 'adam&eveDDB',                       domain: 'adamandevebdo.co.uk',     linkedin: 'https://www.linkedin.com/in/mattgay/' },
  { name: 'Lorena Berges',             firstName: 'Lorena',    lastName: 'Berges',              title: 'Creative Director',                      company: 'DDB Latina Puerto Rico',            domain: 'ddb.com',                 linkedin: 'https://www.linkedin.com/in/lorenaberges/' },
  { name: 'Sergio Franco Tosso',       firstName: 'Sergio',    lastName: 'Franco',              title: 'Chief Creative Officer',                 company: 'Fahrenheit DDB',                    domain: 'fahrenheitddb.com',       linkedin: 'https://www.linkedin.com/in/sergiofrancotosso/' },

  // ── Deloitte ──
  { name: 'Virginie Briand',           firstName: 'Virginie',  lastName: 'Briand',              title: 'Partner',                                company: 'Deloitte',                          domain: 'deloitte.com',            linkedin: 'https://www.linkedin.com/in/virginiebriand/' },

  // ── Dentsu ──
  { name: 'Kazuhiro Shimura',          firstName: 'Kazuhiro',  lastName: 'Shimura',             title: 'Executive Creative Director',            company: 'Dentsu Inc.',                       domain: 'dentsu.com',              linkedin: 'https://www.linkedin.com/in/kazuhiro-shimura-99321526/' },
  { name: 'Jean Lin',                  firstName: 'Jean',      lastName: 'Lin',                 title: 'Global Chief Brand Officer',             company: 'Dentsu Group Inc.',                 domain: 'dentsu.com',              linkedin: 'https://www.linkedin.com/in/jean-lin-24329215/' },
  { name: 'Andres Arlia',              firstName: 'Andres',    lastName: 'Arlia',               title: 'Executive Creative Director',            company: 'Dentsu Creative',                   domain: 'dentsu.com',              linkedin: 'https://www.linkedin.com/in/andresarlia/' },
  { name: 'Defri Dwipaputra',          firstName: 'Defri',     lastName: 'Dwipaputra',          title: 'Chief Creative Experience Officer',      company: 'Dentsu Creative',                   domain: 'dentsu.com',              linkedin: 'https://www.linkedin.com/in/defridwipaputra/' },
  { name: 'Gurbaksh Singh',            firstName: 'Gurbaksh',  lastName: 'Singh',               title: 'Chief Creative Officer',                 company: 'Dentsu Creative',                   domain: 'dentsu.com',              linkedin: 'https://www.linkedin.com/in/gurbakshsingh/' },
  { name: 'Alice Chou',                firstName: 'Alice',     lastName: 'Chou',                title: 'Chief Creative Officer',                 company: 'Dentsu Creative Taiwan',            domain: 'dentsu.com',              linkedin: 'https://www.linkedin.com/in/alicechou/' },
  { name: 'Boris Nihom',               firstName: 'Boris',     lastName: 'Nihom',               title: 'CEO',                                    company: 'Dentsu Benelux',                    domain: 'dentsu.com',              linkedin: 'https://www.linkedin.com/in/borisnihom/' },
  { name: 'Ayu Sasaki',                firstName: 'Ayu',       lastName: 'Sasaki',              title: 'Executive Creative Director',            company: 'Dentsu Inc.',                       domain: 'dentsu.com',              linkedin: 'https://www.linkedin.com/in/ayu-sasaki-33161320/' },
  { name: 'Hiroyuki Kato',             firstName: 'Hiroyuki',  lastName: 'Kato',                title: 'Creative Director',                      company: 'Dentsu Inc.',                       domain: 'dentsu.com',              linkedin: 'https://www.linkedin.com/in/hiroyukikato/' },
  { name: 'Melody Li',                 firstName: 'Melody',    lastName: 'Li',                  title: 'SVP Business Development',               company: 'Dentsu Sports International',       domain: 'dentsu.com',              linkedin: 'https://www.linkedin.com/in/melodyli8/' },

  // ── Design Bridge and Partners ──
  { name: 'Greg Quinton',              firstName: 'Greg',      lastName: 'Quinton',             title: 'Chief Creative Officer',                 company: 'Design Bridge and Partners',        domain: 'designbridgeandpartners.com', linkedin: 'https://www.linkedin.com/in/gregquinton/' },

  // ── Diageo ──
  { name: 'Sophie Kelly',              firstName: 'Sophie',    lastName: 'Kelly',               title: 'SVP, Global Tequila and Mezcal',         company: 'Diageo',                            domain: 'diageo.com',              linkedin: 'https://www.linkedin.com/in/sophiekelly/' },

  // ── Ecobank ──
  { name: 'Oriane Canfrin',            firstName: 'Oriane',    lastName: 'Canfrin',             title: 'Head of Marketing and Communication',    company: 'Ecobank',                           domain: 'ecobank.com',             linkedin: 'https://www.linkedin.com/in/orianecanfrin/' },

  // ── Essity ──
  { name: 'Tanja Grubner',             firstName: 'Tanja',     lastName: 'Grubner',             title: 'Global Marketing Director',              company: 'Essity',                            domain: 'essity.com',              linkedin: 'https://www.linkedin.com/in/tanjagrubner/' },

  // ── Flywheel ──
  { name: 'Phil Camarota',             firstName: 'Phil',      lastName: 'Camarota',            title: 'Chief Creative Officer',                 company: 'Flywheel',                          domain: 'goflywheel.com',          linkedin: 'https://www.linkedin.com/in/philcamarota/' },

  // ── Forsman & Bodenfors ──
  { name: 'Sophia Lindholm',           firstName: 'Sophia',    lastName: 'Lindholm',            title: 'Head of Creative',                       company: 'Forsman & Bodenfors Sweden',        domain: 'fb.se',                   linkedin: 'https://www.linkedin.com/in/sophialindholm/' },

  // ── Google ──
  { name: 'KK Walker',                 firstName: 'KK',        lastName: 'Walker',              title: 'Executive Creative Director',            company: 'Google',                            domain: 'google.com',              linkedin: 'https://www.linkedin.com/in/kkwalker/' },

  // ── Grab ──
  { name: 'Thanh Anh Nguyen',          firstName: 'Thanh',     lastName: 'Nguyen',              title: 'Head of Marketing and Commercial',       company: 'Grab',                              domain: 'grab.com',                linkedin: 'https://www.linkedin.com/in/thanhanhnguyen/' },

  // ── Grey ──
  { name: 'Helen Rhodes',              firstName: 'Helen',     lastName: 'Rhodes',              title: 'Chief Creative Officer',                 company: 'Grey London',                       domain: 'grey.com',                linkedin: 'https://www.linkedin.com/in/helen-rhodes-19195b1/' },
  { name: 'Alexis Ospina',             firstName: 'Alexis',    lastName: 'Ospina',              title: 'Chief Creative Officer',                 company: 'Grey Mexico',                       domain: 'grey.com',                linkedin: 'https://www.linkedin.com/in/alexis-ospina-81977028/' },

  // ── GUT ──
  { name: 'Joaquin Cubria',            firstName: 'Joaquin',   lastName: 'Cubria',              title: 'Chief Creative Officer',                 company: 'GUT',                               domain: 'gut.agency',              linkedin: 'https://www.linkedin.com/in/joaquincubria/' },
  { name: 'Tiago Abreu',               firstName: 'Tiago',     lastName: 'Abreu',               title: 'Chief Creative Officer',                 company: 'GUT São Paulo',                     domain: 'gut.agency',              linkedin: 'https://www.linkedin.com/in/tiagoabreu/' },

  // ── Hakuhodo ──
  { name: 'Satoshi Chikayama',         firstName: 'Satoshi',   lastName: 'Chikayama',           title: 'Executive Creative Director',            company: 'Hakuhodo',                          domain: 'hakuhodo.co.jp',          linkedin: 'https://www.linkedin.com/in/satoshi-chikayama-12b45620/' },
  { name: 'Asako Okuno',               firstName: 'Asako',     lastName: 'Okuno',               title: 'Global Creative Director',               company: 'Hakuhodo',                          domain: 'hakuhodo.co.jp',          linkedin: 'https://www.linkedin.com/in/asakookuno/' },

  // ── Havas ──
  { name: 'Mary Anne He',              firstName: 'Mary Anne', lastName: 'He',                  title: 'Head of Data & Insights',                company: 'Havas Middle East',                 domain: 'havas.com',               linkedin: 'https://www.linkedin.com/in/maryannehe/' },
  { name: 'Alejandro Fischer',         firstName: 'Alejandro', lastName: 'Fischer',             title: 'Chief Strategy Officer',                 company: 'Havas Middle East',                 domain: 'havas.com',               linkedin: 'https://www.linkedin.com/in/alejandrofischer/' },
  { name: 'Donevan Chew',              firstName: 'Donevan',   lastName: 'Chew',                title: 'Chief Creative Officer',                 company: 'Havas Malaysia',                    domain: 'havas.com',               linkedin: 'https://www.linkedin.com/in/donevanchew/' },
  { name: 'Ben Sun Erhei',             firstName: 'Ben',       lastName: 'Sun',                 title: 'CEO and CCO',                            company: 'Havas Creative China',              domain: 'havas.com',               linkedin: 'https://www.linkedin.com/in/erhei-sun-99321526/' },
  { name: 'Stephanie Mazingi',         firstName: 'Stephanie', lastName: 'Mazingi',             title: 'Creative Managing Director',             company: 'Havas South Africa',                domain: 'havas.com',               linkedin: 'https://www.linkedin.com/in/stephaniemazingi/' },
  { name: 'Melissa Tifrere',           firstName: 'Melissa',   lastName: 'Tifrere',             title: 'Chief Production Officer',               company: 'Havas',                             domain: 'havas.com',               linkedin: 'https://www.linkedin.com/in/melissatifrere/' },
  { name: 'Prachi Narayan',            firstName: 'Prachi',    lastName: 'Narayan',             title: 'Managing Partner',                       company: 'Havas Play',                        domain: 'havasplay.com',           linkedin: 'https://www.linkedin.com/in/prachinarayan/' },

  // ── Heineken ──
  { name: 'Marta Garcia Alonso',       firstName: 'Marta',     lastName: 'Garcia',              title: 'VP Marketing',                           company: 'Heineken',                          domain: 'heineken.com',            linkedin: 'https://www.linkedin.com/in/martagarciaalonso/' },

  // ── INNOCEAN ──
  { name: 'Jung A Kim',                firstName: 'Jung A',    lastName: 'Kim',                 title: 'CEO and CCO',                            company: 'INNOCEAN',                          domain: 'innocean.com',            linkedin: 'https://www.linkedin.com/in/jungakim/' },

  // ── JLL ──
  { name: 'Adelise Ashdown',           firstName: 'Adelise',   lastName: 'Ashdown',             title: 'Global Head of Brand and Client Experience', company: 'JLL',                          domain: 'jll.com',                 linkedin: 'https://www.linkedin.com/in/adeliseashdown/' },

  // ── Joe Public ──
  { name: 'Mpume Ngobese',             firstName: 'Mpume',     lastName: 'Ngobese',             title: 'Managing Director',                      company: 'Joe Public',                        domain: 'joepublic.co.za',         linkedin: 'https://www.linkedin.com/in/mpumengobese/' },

  // ── Kimberly-Clark ──
  { name: 'Marilia Zanoli',            firstName: 'Marilia',   lastName: 'Zanoli',              title: 'Chief Marketing Officer',                company: 'Kimberly-Clark Brazil',             domain: 'kimberly-clark.com',      linkedin: 'https://www.linkedin.com/in/mariliazanoli/' },

  // ── Landor ──
  { name: 'Lulu Raghavan',             firstName: 'Lulu',      lastName: 'Raghavan',            title: 'President APAC',                         company: 'Landor',                            domain: 'landor.com',              linkedin: 'https://www.linkedin.com/in/luluraghavan/' },

  // ── LEGO ──
  { name: 'Julia Goldin',              firstName: 'Julia',     lastName: 'Goldin',              title: 'Chief Product and Marketing Officer',    company: 'The LEGO Group',                    domain: 'lego.com',                linkedin: 'https://www.linkedin.com/in/juliagoldin/' },
  { name: 'Breana Auberry',            firstName: 'Breana',    lastName: 'Auberry',             title: 'Global Brand Director, Culture Marketing', company: 'The LEGO Group',                  domain: 'lego.com',                linkedin: 'https://www.linkedin.com/in/breana-auberry-8588521/' },

  // ── Leo ──
  { name: 'Clare Pickens',             firstName: 'Clare',     lastName: 'Pickens',             title: 'CEO',                                    company: 'Leo Australia',                     domain: 'leoburnettntt.com.au',    linkedin: 'https://www.linkedin.com/in/clarepickens/' },
  { name: 'Mark Elwood',               firstName: 'Mark',      lastName: 'Elwood',              title: 'Chief Creative Officer',                 company: 'Leo UK',                            domain: 'leolondon.com',           linkedin: 'https://www.linkedin.com/in/markelwood/' },
  { name: 'Amitesh Rao',               firstName: 'Amitesh',   lastName: 'Rao',                 title: 'CEO South Asia',                         company: 'Leo',                               domain: 'leoburnett.com',          linkedin: 'https://www.linkedin.com/in/amiteshrao/' },

  // ── LePub ──
  { name: 'Mihnea Gheorghiu',          firstName: 'Mihnea',    lastName: 'Gheorghiu',           title: 'Global CCO',                             company: 'LePub',                             domain: 'le.pub',                  linkedin: 'https://www.linkedin.com/in/mihneagheorghiu/' },
  { name: 'Ricardo Aviles',            firstName: 'Ricardo',   lastName: 'Aviles',              title: 'Chief Creative Officer',                 company: 'LePub México',                      domain: 'le.pub',                  linkedin: 'https://www.linkedin.com/in/ricardo-avil%C3%A9s-63110a11/' },
  { name: 'Jim Curtis',                firstName: 'Jim',        lastName: 'Curtis',              title: 'Chief Creative Officer',                 company: 'LePub NY',                          domain: 'le.pub',                  linkedin: 'https://www.linkedin.com/in/jim-curtis-🦒-2619b6b/' },

  // ── LinkedIn ──
  { name: 'Ty Heath',                  firstName: 'Ty',        lastName: 'Heath',               title: 'Global Director, Thought Leadership',    company: 'LinkedIn',                          domain: 'linkedin.com',            linkedin: 'https://www.linkedin.com/in/tyheath/' },

  // ── M+C Saatchi ──
  { name: 'Lolly Thomson',             firstName: 'Lolly',     lastName: 'Thomson',             title: 'Joint Global CCO',                       company: 'M+C Saatchi Group',                 domain: 'mcsaatchi.com',           linkedin: 'https://www.linkedin.com/in/lolly-thomson-052a3821/' },
  { name: 'Nadja Bellan-White',        firstName: 'Nadja',     lastName: 'Bellan-White',        title: 'Group CEO',                              company: 'M+C Saatchi North America',         domain: 'mcsaatchi.com',           linkedin: 'https://www.linkedin.com/in/nadjabellanwhite/' },

  // ── Machine_ ──
  { name: 'Jabulani Sigege',           firstName: 'Jabulani',  lastName: 'Sigege',              title: 'Group Executive Creative Director',      company: 'Machine_',                          domain: 'machine.co.za',           linkedin: 'https://www.linkedin.com/in/jabulanisigege/' },

  // ── McCann ──
  { name: 'Britt Nolan',               firstName: 'Britt',     lastName: 'Nolan',               title: 'Chief Creative Officer',                 company: 'McCann North America',              domain: 'mccann.com',              linkedin: 'https://www.linkedin.com/in/brittnolan/' },
  { name: 'Vitor Hugo Favero',         firstName: 'Vitor',     lastName: 'Favero',              title: 'Global Design Lead',                     company: 'McCann',                            domain: 'mccann.com',              linkedin: 'https://www.linkedin.com/in/vitorhugofavero/' },
  { name: 'Dheeraj Sinha',             firstName: 'Dheeraj',   lastName: 'Sinha',               title: 'CEO',                                    company: 'McCann',                            domain: 'mccann.com',              linkedin: 'https://www.linkedin.com/in/dheerajsinha/' },
  { name: 'Farah El Feghali',          firstName: 'Farah',     lastName: 'El Feghali',          title: 'Executive Creative Director',            company: 'McCann Paris',                      domain: 'mccann.com',              linkedin: 'https://www.linkedin.com/in/farahelfeghali/' },
  { name: 'John Bleeden',              firstName: 'John',      lastName: 'Bleeden',             title: 'SVP Global Executive Creative Development', company: 'McCann',                        domain: 'mccann.com',              linkedin: 'https://www.linkedin.com/in/johnbleeden/' },
  { name: 'Khethiwe Makhubo',          firstName: 'Khethiwe',  lastName: 'Makhubo',             title: 'Creative Group Head',                    company: 'McCann Joburg',                     domain: 'mccann.com',              linkedin: 'https://www.linkedin.com/in/khethiwemakhubo/' },
  { name: 'Tarek Miknas',              firstName: 'Tarek',     lastName: 'Miknas',              title: 'CEO',                                    company: 'FP7McCann MENAT',                   domain: 'fp7mccann.com',           linkedin: 'https://www.linkedin.com/in/tarekmiknas/' },

  // ── Mercado Libre ──
  { name: 'Sean Summers',              firstName: 'Sean',      lastName: 'Summers',             title: 'Chief Marketing Officer',                company: 'Mercado Libre',                     domain: 'mercadolibre.com',        linkedin: 'https://www.linkedin.com/in/sean-summers-529a3a1/' },

  // ── Meta ──
  { name: 'Julie Hogan',               firstName: 'Julie',     lastName: 'Hogan',               title: 'VP Global Brand Experiences',            company: 'Meta',                              domain: 'meta.com',                linkedin: 'https://www.linkedin.com/in/julie-hogan-3323083/' },
  { name: 'Andre Athayde',             firstName: 'Andre',     lastName: 'Athayde',             title: 'Agency Partner',                         company: 'Meta',                              domain: 'meta.com',                linkedin: 'https://www.linkedin.com/in/andreathayde/' },

  // ── Monks ──
  { name: 'Pablo Vitale',              firstName: 'Pablo',     lastName: 'Vitale',              title: 'SVP Executive Creative Director',        company: 'Monks Buenos Aires',                domain: 'monks.com',               linkedin: 'https://www.linkedin.com/in/pablovitale/' },

  // ── Mother New York ──
  { name: 'Oriel Davis-Lyons',         firstName: 'Oriel',     lastName: 'Davis-Lyons',         title: 'Chief Creative Officer',                 company: 'Mother New York',                   domain: 'mothernewyork.com',       linkedin: 'https://www.linkedin.com/in/oriel-davis-lyons-411a774b/' },

  // ── Motion Sickness ──
  { name: 'Sam Stuchbury',             firstName: 'Sam',       lastName: 'Stuchbury',           title: 'Executive Creative Director and Founder', company: 'Motion Sickness',                  domain: 'motionsickness.co.nz',    linkedin: 'https://www.linkedin.com/in/sam-stuchbury-014a4013/' },

  // ── MRM ──
  { name: 'Felix del Valle',           firstName: 'Felix',     lastName: 'del Valle',           title: 'Chief Creative Officer',                 company: 'MRM Spain',                         domain: 'mrm.com',                 linkedin: 'https://www.linkedin.com/in/felixdelvalle/' },

  // ── MullenLowe ──
  { name: 'Norkor Duah',               firstName: 'Norkor',    lastName: 'Duah',                title: 'CEO',                                    company: 'MullenLowe Accra',                  domain: 'mullenlowe.com',          linkedin: 'https://www.linkedin.com/in/norkorduah/' },

  // ── Nestle ──
  { name: 'Tracey Cooke',              firstName: 'Tracey',    lastName: 'Cooke',               title: 'Chief Marketing Officer SVP',            company: 'Nestle',                            domain: 'nestle.com',              linkedin: 'https://www.linkedin.com/in/tracey-cooke-58832a4/' },

  // ── Octagon ──
  { name: 'Guy Futcher',               firstName: 'Guy',       lastName: 'Futcher',             title: 'Regional Executive Creative Director',   company: 'Octagon APAC',                      domain: 'octagon.com',             linkedin: 'https://www.linkedin.com/in/guy-futcher-61405b22/' },

  // ── Ogilvy ──
  { name: 'Kainaz Karmakar',           firstName: 'Kainaz',    lastName: 'Karmakar',            title: 'Chief Creative Officer',                 company: 'Ogilvy',                            domain: 'ogilvy.com',              linkedin: 'https://www.linkedin.com/in/kainaz-karmakar-63110a11/' },
  { name: 'Gautam Wadher',             firstName: 'Gautam',    lastName: 'Wadher',              title: 'Chief Creative Officer',                 company: 'Memac Ogilvy',                      domain: 'ogilvy.com',              linkedin: 'https://www.linkedin.com/in/gautamwadher/' },
  { name: 'Giant Kung',                firstName: 'Giant',     lastName: 'Kung',                title: 'Chief Creative Officer',                 company: 'Ogilvy Taiwan',                     domain: 'ogilvy.com',              linkedin: 'https://www.linkedin.com/in/giantkung/' },
  { name: 'Neo Makhele',               firstName: 'Neo',       lastName: 'Makhele',             title: 'Chief Strategy Officer',                 company: 'Ogilvy South Africa',               domain: 'ogilvy.com',              linkedin: 'https://www.linkedin.com/in/neomakhele/' },
  { name: 'Juan Manuel Gaitan',        firstName: 'Juan',      lastName: 'Gaitan',              title: 'Chief Creative Officer',                 company: 'Ogilvy Dominican Republic',         domain: 'ogilvy.com',              linkedin: 'https://www.linkedin.com/in/juanmanuelgaitan/' },
  { name: 'Rafael Donato',             firstName: 'Rafael',    lastName: 'Donato',              title: 'Chief Creative Officer',                 company: 'Ogilvy Brasil',                     domain: 'ogilvy.com',              linkedin: 'https://www.linkedin.com/in/rafaeldonato/' },
  { name: 'Zoe Hamilton',              firstName: 'Zoe',       lastName: 'Hamilton',            title: 'Global Chief Strategy Officer for Unilever', company: 'Ogilvy',                       domain: 'ogilvy.com',              linkedin: 'https://www.linkedin.com/in/zoehamilton/' },

  // ── Omnicom ──
  { name: 'Susan Credle',              firstName: 'Susan',     lastName: 'Credle',              title: 'Global Creative Advisor',                company: 'Omnicom',                           domain: 'omnicomgroup.com',        linkedin: 'https://www.linkedin.com/in/susan-credle-a16086b/' },
  { name: 'Glen Lomas',                firstName: 'Glen',      lastName: 'Lomas',               title: 'CEO Europe',                             company: 'Omnicom Advertising',               domain: 'omnicomgroup.com',        linkedin: 'https://www.linkedin.com/in/glenlomas/' },
  { name: 'Allison Ceraso',            firstName: 'Allison',   lastName: 'Ceraso',              title: 'Chief Creative Officer',                 company: 'Digitas Health',                    domain: 'digitashealth.com',       linkedin: 'https://www.linkedin.com/in/allison-ceraso-9418654/' },
  { name: 'Amanda Fuller',             firstName: 'Amanda',    lastName: 'Fuller',              title: 'Managing Partner',                       company: 'Omnicom Health Oceania',            domain: 'omnicomhealth.com',       linkedin: 'https://www.linkedin.com/in/amanda-fuller-0857313/' },

  // ── Opella ──
  { name: 'Severine Autret',           firstName: 'Severine',  lastName: 'Autret',              title: 'Global Creative Excellence Lead',        company: 'Opella',                            domain: 'opella.com',              linkedin: 'https://www.linkedin.com/in/severineautret/' },

  // ── Overtime ──
  { name: 'Andre Gray',                firstName: 'Andre',     lastName: 'Gray',                title: 'Chief Brand Officer',                    company: 'Overtime',                          domain: 'overtime.tv',             linkedin: 'https://www.linkedin.com/in/andregray/' },

  // ── PepsiCo ──
  { name: 'Jane Wakely',               firstName: 'Jane',      lastName: 'Wakely',              title: 'EVP Chief Consumer & Marketing Officer', company: 'PepsiCo',                           domain: 'pepsico.com',             linkedin: 'https://www.linkedin.com/in/janewakely/' },

  // ── Publicis ──
  { name: 'Sarah Lemarie',             firstName: 'Sarah',     lastName: 'Lemarie',             title: 'Chief Strategy Officer',                 company: 'Publicis France',                   domain: 'publicis.com',            linkedin: 'https://www.linkedin.com/in/sarah-lemarie-a279312b/' },
  { name: 'Agathe Bousquet',           firstName: 'Agathe',    lastName: 'Bousquet',            title: 'President',                              company: 'Publicis Groupe France',            domain: 'publicis.com',            linkedin: 'https://www.linkedin.com/in/agathe-bousquet-63303623/' },
  { name: 'Ian Loon',                  firstName: 'Ian',       lastName: 'Loon',                title: 'CEO Media & Digital Singapore',          company: 'Publicis Groupe',                   domain: 'publicis.com',            linkedin: 'https://www.linkedin.com/in/ianloon/' },
  { name: 'Marcelo Vergara',           firstName: 'Marcelo',   lastName: 'Vergara',             title: 'Executive Creative Director',            company: 'Publicis Conseil',                  domain: 'publicis.com',            linkedin: 'https://www.linkedin.com/in/marcelo-vergara-052a3821/' },
  { name: 'Tato Bono',                 firstName: 'Tato',      lastName: 'Bono',                title: 'President',                              company: 'Publicis Production',               domain: 'publicis.com',            linkedin: 'https://www.linkedin.com/in/tatobono/' },
  { name: 'Jason Williams',            firstName: 'Jason',     lastName: 'Williams',            title: 'Head of Creative Excellence APAC',       company: 'Publicis Groupe',                   domain: 'publicis.com',            linkedin: 'https://www.linkedin.com/in/jasonwilliams/' },
  { name: 'Fizo Younis',               firstName: 'Fizo',      lastName: 'Younis',              title: 'Chief Creative Officer Middle East',     company: 'Publicis Groupe',                   domain: 'publicis.com',            linkedin: 'https://www.linkedin.com/in/fizoyounis/' },
  { name: 'Maud Robaglia',             firstName: 'Maud',      lastName: 'Robaglia',            title: 'Head of Art',                            company: 'Publicis Conseil',                  domain: 'publicis.com',            linkedin: 'https://www.linkedin.com/in/maudrobaglia/' },
  { name: 'Megha Dutta',               firstName: 'Megha',     lastName: 'Dutta',               title: 'Executive Creative Director',            company: 'The Partnership Africa / Publicis', domain: 'publicis.com',            linkedin: 'https://www.linkedin.com/in/meghadutta/' },

  // ── PwC ──
  { name: 'Koert Bakker',              firstName: 'Koert',     lastName: 'Bakker',              title: 'Head of Insights & Innovation',          company: 'PwC Netherlands',                   domain: 'pwc.com',                 linkedin: 'https://www.linkedin.com/in/koertbakker/' },

  // ── R/GA ──
  { name: 'Ben Miles',                 firstName: 'Ben',       lastName: 'Miles',               title: 'Chief Design Officer',                   company: 'R/GA',                              domain: 'rga.com',                 linkedin: 'https://www.linkedin.com/in/ben-miles-8588521/' },

  // ── Rethink ──
  { name: 'Aaron Starkman',            firstName: 'Aaron',     lastName: 'Starkman',            title: 'Global CCO',                             company: 'Rethink',                           domain: 'rethinkcanada.com',       linkedin: 'https://www.linkedin.com/in/aaronstarkman/' },

  // ── Revolver ──
  { name: 'Pip Smart',                 firstName: 'Pip',       lastName: 'Smart',               title: 'Executive Producer and Partner',         company: 'Revolver',                          domain: 'revolverfilm.com.au',     linkedin: 'https://www.linkedin.com/in/pipsmart/' },

  // ── Saatchi & Saatchi ──
  { name: 'Yasmin Sindi',              firstName: 'Yasmin',    lastName: 'Sindi',               title: 'Senior Creative Director',               company: 'Saatchi & Saatchi',                 domain: 'saatchi.com',             linkedin: 'https://www.linkedin.com/in/yasminsindi/' },

  // ── Safaricom ──
  { name: 'Zizwe Vundla',              firstName: 'Zizwe',     lastName: 'Vundla',              title: 'Chief Marketing Officer',                company: 'Safaricom / M-PESA',                domain: 'safaricom.co.ke',         linkedin: 'https://www.linkedin.com/in/zizwe-vundla-90234710/' },

  // ── Serviceplan ──
  { name: 'Michael Wilk',              firstName: 'Michael',   lastName: 'Wilk',                title: 'Global Head of Art',                     company: 'Serviceplan Group',                 domain: 'serviceplan.com',         linkedin: 'https://www.linkedin.com/in/michaelwilk/' },

  // ── Snap ──
  { name: 'Hannah Johnson',            firstName: 'Hannah',    lastName: 'Johnson',             title: 'Head of Creative Strategy DACH',         company: 'Snap Inc.',                         domain: 'snap.com',                linkedin: 'https://www.linkedin.com/in/hannahjohnson/' },

  // ── Sony Music ──
  { name: 'Prerna Suri',               firstName: 'Prerna',    lastName: 'Suri',                title: 'VP Communications',                      company: 'Sony Music Entertainment',          domain: 'sonymusic.com',           linkedin: 'https://www.linkedin.com/in/prernasuri/' },

  // ── Spark Foundry ──
  { name: 'Kendra Hatcher King',       firstName: 'Kendra',    lastName: 'Hatcher King',        title: 'Global Chief Design Officer',            company: 'Spark Foundry',                     domain: 'sparkfoundry.com',        linkedin: 'https://www.linkedin.com/in/kendrahatcherking/' },

  // ── Spotify ──
  { name: 'Phiona Okumu',              firstName: 'Phiona',    lastName: 'Okumu',               title: 'Head of Music, Sub-Saharan Africa',      company: 'Spotify',                           domain: 'spotify.com',             linkedin: 'https://www.linkedin.com/in/phionaokumu/' },

  // ── Stagwell / Crispin ──
  { name: 'Vinicius Reis',             firstName: 'Vinicius',  lastName: 'Reis',                title: 'Partner and CEO',                        company: 'Crispin and Stagwell',              domain: 'stagwellglobal.com',      linkedin: 'https://www.linkedin.com/in/viniciusbreis/' },

  // ── Supercell ──
  { name: 'Gabriel Caramelo Eccher',   firstName: 'Gabriel',   lastName: 'Caramelo',            title: 'Marketing VP Clash Royale',              company: 'Supercell',                         domain: 'supercell.com',           linkedin: 'https://www.linkedin.com/in/gabriel-caramelo-eccher-014a4013/' },

  // ── TBWA ──
  { name: 'Chaka Sobhani',             firstName: 'Chaka',     lastName: 'Sobhani',             title: 'Global CCO',                             company: 'TBWA Worldwide',                    domain: 'tbwa.com',                linkedin: 'https://www.linkedin.com/in/chakasobhani/' },
  { name: 'Jen Costello',              firstName: 'Jen',       lastName: 'Costello',            title: 'Global Chief Strategy Officer',          company: 'TBWA Worldwide',                    domain: 'tbwa.com',                linkedin: 'https://www.linkedin.com/in/jencostello/' },
  { name: 'Zuza Duchniewska-Sobczak',  firstName: 'Zuza',      lastName: 'Duchniewska-Sobczak', title: 'Chief Creative Officer',                 company: 'TBWA Warsaw',                       domain: 'tbwa.com',                linkedin: 'https://www.linkedin.com/in/zuza-duchniewska-sobczak-a279312b/' },
  { name: 'Xavier Serrano',            firstName: 'Xavier',    lastName: 'Serrano',             title: 'CEO',                                    company: 'TBWA Colombia',                     domain: 'tbwa.com',                linkedin: 'https://www.linkedin.com/in/xavierserrano/' },
  { name: 'Beto Nahmad',               firstName: 'Beto',      lastName: 'Nahmad',              title: 'Executive Creative Director',            company: 'VCCP Spain',                        domain: 'vccp.com',                linkedin: 'https://www.linkedin.com/in/betonahmad/' },
  { name: 'Derek Green',               firstName: 'Derek',     lastName: 'Green',               title: 'Chief Creative Officer',                 company: 'TBWA RAAD',                         domain: 'tbwa.com',                linkedin: 'https://www.linkedin.com/in/derekgreen/' },
  { name: 'Yoshihiro Kono',            firstName: 'Yoshihiro', lastName: 'Kono',                title: 'Senior Art Director',                    company: 'TBWA Hakuhodo',                     domain: 'tbwa-hakuhodo.co.jp',     linkedin: 'https://www.linkedin.com/in/yoshihirokono/' },
  { name: 'Maiya Kinoshita',           firstName: 'Maiya',     lastName: 'Kinoshita',           title: 'Creative Director',                      company: 'TBWA Media Arts Lab Tokyo',         domain: 'tbwa.com',                linkedin: 'https://www.linkedin.com/in/maiya-kinoshita-8588521/' },

  // ── Telkom ──
  { name: 'Gugu Mthembu',              firstName: 'Gugu',      lastName: 'Mthembu',             title: 'Chief Marketing Officer',                company: 'Telkom',                            domain: 'telkom.co.za',            linkedin: 'https://www.linkedin.com/in/gugu-mthembu-90234710/' },

  // ── Telstra ──
  { name: 'Brent Smart',               firstName: 'Brent',     lastName: 'Smart',               title: 'Chief Marketing Officer',                company: 'Telstra',                           domain: 'telstra.com',             linkedin: 'https://www.linkedin.com/in/brentsmart/' },

  // ── TikTok ──
  { name: 'Youssef Gadallah',          firstName: 'Youssef',   lastName: 'Gadallah',            title: 'Head of Creative Studio',                company: 'TikTok',                            domain: 'tiktok.com',              linkedin: 'https://www.linkedin.com/in/youssefgadallah/' },

  // ── United Talent Agency ──
  { name: 'Toni Wallace',              firstName: 'Toni',      lastName: 'Wallace',             title: 'Partner, Head of Global Music Brand Strategy', company: 'United Talent Agency',       domain: 'unitedtalent.com',        linkedin: 'https://www.linkedin.com/in/toniwallace/' },

  // ── UWG ──
  { name: 'Monique Nelson',            firstName: 'Monique',   lastName: 'Nelson',              title: 'Executive Chair',                        company: 'UWG',                               domain: 'uwgroupww.com',           linkedin: 'https://www.linkedin.com/in/moniquelnelson/' },

  // ── Visa ──
  { name: 'Danielle Jin',              firstName: 'Danielle',  lastName: 'Jin',                 title: 'Chief Marketing Officer Asia Pacific',   company: 'Visa Inc.',                         domain: 'visa.com',                linkedin: 'https://www.linkedin.com/in/daniellejin/' },

  // ── VML ──
  { name: 'Rafael Pitanguy',           firstName: 'Rafael',    lastName: 'Pitanguy',            title: 'Deputy Global CCO',                      company: 'VML',                               domain: 'vml.com',                 linkedin: 'https://www.linkedin.com/in/rafael-pitanguy-33519113/' },
  { name: 'Ellie Bamford',             firstName: 'Ellie',     lastName: 'Bamford',             title: 'Chief Strategy Officer North America',   company: 'VML',                               domain: 'vml.com',                 linkedin: 'https://www.linkedin.com/in/elliebamford/' },
  { name: 'Fran Palines',              firstName: 'Fran',      lastName: 'Palines',             title: 'Creative Director',                      company: 'VML Manila',                        domain: 'vml.com',                 linkedin: 'https://www.linkedin.com/in/fran-palines-2480304a/' },
  { name: 'Park Wannasiri',            firstName: 'Park',      lastName: 'Wannasiri',           title: 'Chief Creative Officer',                 company: 'VML Thailand',                      domain: 'vml.com',                 linkedin: 'https://www.linkedin.com/in/park-wannasiri-33519113/' },
  { name: 'Kim Pick',                  firstName: 'Kim',       lastName: 'Pick',                title: 'Group Executive Creative Director',      company: 'VML New Zealand',                   domain: 'vml.com',                 linkedin: 'https://www.linkedin.com/in/kimpick/' },
  { name: 'Ryan McManus',              firstName: 'Ryan',      lastName: 'McManus',             title: 'Chief Creative Officer',                 company: 'VML UK',                            domain: 'vml.com',                 linkedin: 'https://www.linkedin.com/in/ryanmcmanus/' },
  { name: 'Raimundo Undurraga',        firstName: 'Raimundo',  lastName: 'Undurraga',           title: 'Chief Creative Officer',                 company: 'VML',                               domain: 'vml.com',                 linkedin: 'https://www.linkedin.com/in/raimundoundurraga/' },
  { name: 'Firas Ghannam',             firstName: 'Firas',     lastName: 'Ghannam',             title: 'Executive Creative Director',            company: 'VML Riyadh',                        domain: 'vml.com',                 linkedin: 'https://www.linkedin.com/in/firasghannam/' },
  { name: 'Daniel Payan',              firstName: 'Daniel',    lastName: 'Payan',               title: 'Chief Creative Officer',                 company: 'VML Colombia',                      domain: 'vml.com',                 linkedin: 'https://www.linkedin.com/in/danielpayan/' },

  // ── Wieden+Kennedy ──
  { name: 'Dan Hill',                  firstName: 'Dan',       lastName: 'Hill',                title: 'Global Chief Strategy Officer',          company: 'Wieden+Kennedy',                    domain: 'wk.com',                  linkedin: 'https://www.linkedin.com/in/danhill/' },

  // ── WPP ──
  { name: 'Rose Herceg',               firstName: 'Rose',      lastName: 'Herceg',              title: 'CEO Australia and New Zealand',          company: 'WPP',                               domain: 'wpp.com',                 linkedin: 'https://www.linkedin.com/in/rose-herceg-9a84a6/' },
  { name: 'Adam Gerhart',              firstName: 'Adam',      lastName: 'Gerhart',             title: 'Global Chief Client Officer',            company: 'WPP Media',                         domain: 'wpp.com',                 linkedin: 'https://www.linkedin.com/in/adamgerhart/' },
  { name: 'Cristina Rey',              firstName: 'Cristina',  lastName: 'Rey',                 title: 'CEO',                                    company: 'WPP Media',                         domain: 'wpp.com',                 linkedin: 'https://www.linkedin.com/in/cristinarey/' },
  { name: 'James Brook-Partridge',     firstName: 'James',     lastName: 'Brook-Partridge',     title: 'Head of Production UK',                  company: 'WPP Production',                    domain: 'wpp.com',                 linkedin: 'https://www.linkedin.com/in/james-brook-partridge-1100234/' },

  // ── Nunu Ntshingila ──
  { name: 'Nunu Ntshingila',           firstName: 'Nunu',      lastName: 'Ntshingila',          title: 'Chairperson',                            company: 'NTINTA and Women for Women',        domain: 'ntinta.co.za',            linkedin: 'https://www.linkedin.com/in/nununtshingila/' },

  // ── Artplan ──
  { name: 'Rafael Gil',                firstName: 'Rafael',    lastName: 'Gil',                 title: 'Chief Creative Officer',                 company: 'Artplan',                           domain: 'artplan.com.br',          linkedin: 'https://www.linkedin.com/in/rafael-gil-2480304a/' },

  // ── Bastion ──
  { name: 'Simon Langley',             firstName: 'Simon',     lastName: 'Langley',             title: 'Chief Creative Officer',                 company: 'Bastion',                           domain: 'bastionagency.com',       linkedin: 'https://www.linkedin.com/in/simonlangley/' },

  // ── Fuse ──
  { name: 'Lucy Basden-Smith',         firstName: 'Lucy',      lastName: 'Basden-Smith',        title: 'Managing Director',                      company: 'Fuse International',               domain: 'fuseint.com',             linkedin: 'https://www.linkedin.com/in/lucy-basden-smith-6617191/' },

  // ── Africa Creative ──
  { name: 'Rogerio Chaves',            firstName: 'Rogerio',   lastName: 'Chaves',              title: 'Co-Chief Creative Officer',              company: 'Africa Creative',                   domain: 'africacreative.com.br',   linkedin: 'https://www.linkedin.com/in/rogeriochaves/' },

  // ── DAVID ──
  { name: 'Andre Toledo',              firstName: 'Andre',     lastName: 'Toledo',              title: 'Chief Creative Officer',                 company: 'DAVID New York',                    domain: 'davidnykc.com',           linkedin: 'https://www.linkedin.com/in/andretol/' },

  // ── ACE OF HEARTS ──
  { name: 'Richard Brim',              firstName: 'Richard',   lastName: 'Brim',                title: 'Founder and CCO',                        company: 'ACE OF HEARTS',                     domain: 'aceofhearts.co.uk',       linkedin: 'https://www.linkedin.com/in/richard-brim-2268481/' },

  // ── Massivemusic ──
  { name: 'Rick Sakurai',              firstName: 'Rick',      lastName: 'Sakurai',             title: 'Creative Director and MD',               company: 'Massivemusic Tokyo',                domain: 'massivemusic.com',        linkedin: 'https://www.linkedin.com/in/ricksakurai/' },

  // ── Sour Bangkok ──
  { name: 'Damisa Ongsiriwattana',     firstName: 'Damisa',    lastName: 'Ongsiriwattana',      title: 'Co-Founder and CCO',                     company: 'Sour Bangkok',                      domain: 'sourbankok.com',          linkedin: 'https://www.linkedin.com/in/damisaongsiriwattana/' },

  // ── FBIZ ──
  { name: 'Diego Guerhardt',           firstName: 'Diego',     lastName: 'Guerhardt',           title: 'Executive Creative Director',            company: 'FBIZ',                              domain: 'f.biz',                   linkedin: 'https://www.linkedin.com/in/diego-guerhardt-12b45620/' },

  // ── Fourthline ──
  { name: 'Kelly McConville',          firstName: 'Kelly',     lastName: 'McConville',          title: 'VP of Marketing',                        company: 'Fourthline',                        domain: 'fourthline.com',          linkedin: 'https://www.linkedin.com/in/kellymcconville/' },

  // ── TADIEM ──
  { name: 'Joseph Bonnici',            firstName: 'Joseph',    lastName: 'Bonnici',             title: 'Chief Creative Officer and Owner',       company: 'TADIEM',                            domain: 'tadiem.com',              linkedin: 'https://www.linkedin.com/in/josephbonnici/' },

  // ── Landia ──
  { name: 'Maureen Hufnagel',          firstName: 'Maureen',   lastName: 'Hufnagel',            title: 'Film Director',                          company: 'Landia',                            domain: 'landia.com.ar',           linkedin: 'https://www.linkedin.com/in/maureen-hufnagel-2480304a/' },

  // ── Bethany Omeri / Special NZ ──
  { name: 'Bethany Omeri',             firstName: 'Bethany',   lastName: 'Omeri',               title: 'Head of Strategy',                       company: 'Special New Zealand',               domain: 'specialgroup.co.nz',      linkedin: 'https://www.linkedin.com/in/bethanyomeri/' },

  // ── Science & Sunshine ──
  { name: 'Ash Chagla',                firstName: 'Ash',       lastName: 'Chagla',              title: 'Chief Creative Officer',                 company: 'Science & Sunshine',                domain: 'scienceandsunshine.com',  linkedin: 'https://www.linkedin.com/in/ashchagla/' },

  // ── Plano Feminino ──
  { name: 'Viviane Duarte',            firstName: 'Viviane',   lastName: 'Duarte',              title: 'CEO',                                    company: 'Plano Feminino',                    domain: 'planofeminino.com.br',    linkedin: 'https://www.linkedin.com/in/vivianeduarte/' },

  // ── Lovesong ──
  { name: 'Suhana Gordhan',            firstName: 'Suhana',    lastName: 'Gordhan',             title: 'Chief Creative Officer and Founder',     company: 'Lovesong',                          domain: 'lovesongcreative.com',    linkedin: 'https://www.linkedin.com/in/suhana-gordhan-90234710/' },

  // ── Sonita Alizadeh ──
  { name: 'Sonita Alizadeh',           firstName: 'Sonita',    lastName: 'Alizadeh',            title: 'Rapper and Activist',                    company: 'Independent',                       domain: 'sonitaalizadeh.com',      linkedin: 'https://www.linkedin.com/in/sonita-alizadeh-4107121b6/' },

  // ── CULXTURED ──
  { name: 'Anna Johannes',             firstName: 'Anna',      lastName: 'Johannes',            title: 'Co-Founder',                             company: 'CULXTURED',                         domain: 'culxtured.com',           linkedin: 'https://www.linkedin.com/in/annajohannes/' },

  // ── Bigtime Creative Shop ──
  { name: 'Mohammed Sehly',            firstName: 'Mohammed',  lastName: 'Sehly',               title: 'CEO',                                    company: 'Bigtime Creative Shop',             domain: 'bigtimecreativeshop.com', linkedin: 'https://www.linkedin.com/in/mohammedsehly/' },

  // ── Smarty Pants ──
  { name: 'Marty Davies',              firstName: 'Marty',     lastName: 'Davies',              title: 'Founder',                                company: 'Smarty Pants Consultancy',          domain: 'smartypantsconsultancy.com', linkedin: 'https://www.linkedin.com/in/marty-davies-33063426/' },

  // ── King Faisal Hospital ──
  { name: 'Muhannad Kadi',             firstName: 'Muhannad',  lastName: 'Kadi',                title: 'Chief Marketing Officer',                company: 'King Faisal Specialist Hospital',   domain: 'kfsh.med.sa',             linkedin: 'https://www.linkedin.com/in/muhannadkadi/' },

  // ── Knight Riders Sports ──
  { name: 'Binda Dey',                 firstName: 'Binda',     lastName: 'Dey',                 title: 'Global Chief Marketing Officer',         company: 'Knight Riders Sports',              domain: 'kkr.in',                  linkedin: 'https://www.linkedin.com/in/bindadey/' },
];

// ─── LOAD EXISTING RESULTS (for resume support) ───────────────────────────────

function loadExisting(): Record<string, LookupRecord> {
  if (!fs.existsSync(RESULTS_FILE)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8')) as LookupRecord[];
    return Object.fromEntries(data.map(r => [r.name, r]));
  } catch { return {}; }
}

function saveResults(results: LookupRecord[]): void {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const existing = loadExisting();
  const results: LookupRecord[] = Object.values(existing);

  const toProcess = CONTACTS.filter(c => !existing[c.name]);

  console.log(`\nCannes Judges — Waterfall Email Lookup`);
  console.log(`Total contacts: ${CONTACTS.length} | Already done: ${results.length} | Remaining: ${toProcess.length}\n`);

  let found = 0;
  let notFound = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const c = toProcess[i];
    process.stdout.write(`[${i + 1}/${toProcess.length}] ${c.name.padEnd(28)} ${c.domain.padEnd(30)} → `);

    const result = await findEmail(c.firstName, c.lastName, c.domain);

    const record: LookupRecord = {
      name:       c.name,
      title:      c.title,
      company:    c.company,
      domain:     c.domain,
      linkedin:   c.linkedin,
      email:      result?.email ?? null,
      confidence: result?.confidence ?? 0,
      source:     result?.source ?? 'none',
    };

    if (result) {
      console.log(`${result.email} (${result.source}, ${result.confidence}%)`);
      found++;
    } else {
      console.log('NOT FOUND → LinkedIn');
      notFound++;
    }

    results.push(record);
    saveResults(results);

    await new Promise(res => setTimeout(res, 800));
  }

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`Found: ${found} | Not found: ${notFound} | Total: ${CONTACTS.length}`);
  console.log(`Results saved to: ${RESULTS_FILE}`);
  console.log('\nContacts NOT found (send via LinkedIn):');
  results.filter(r => !r.email).forEach(r => console.log(`  • ${r.name} — ${r.title} @ ${r.company} | ${r.linkedin}`));
}

main().catch(console.error);
