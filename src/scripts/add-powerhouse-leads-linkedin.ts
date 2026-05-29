/**
 * add-powerhouse-leads-linkedin.ts
 *
 * Appends the new Indvstry Power House lead list to cannes-linkedin-outreach.json/csv.
 * Deduplicates by name against the existing 175-contact list.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/add-powerhouse-leads-linkedin.ts
 */

import fs from 'fs';
import path from 'path';

interface OutreachRecord {
  name: string;
  firstName: string;
  title: string;
  company: string;
  linkedin: string;
  segment: string;
  connectionRequest: string;
  dmMessage: string;
}

interface NewContact {
  name: string;
  title: string;
  company: string;
  linkedin: string;
  segment: string;
}

const JSON_FILE = path.resolve(__dirname, '../data/cannes-linkedin-outreach.json');
const CSV_FILE  = path.resolve(__dirname, '../data/cannes-linkedin-outreach.csv');

// ─── NEW CONTACTS ─────────────────────────────────────────────────────────────
// Segments:
//   cmo_brand        — CMOs, VPs of Marketing, Brand Officers at consumer brands
//   agency_ceo       — CEOs/Chairs of agency networks
//   tech_platform    — AdTech, platform, data leaders
//   brand_ceo        — CEOs of major consumer brands (approach as peers)
//   industry_org     — Trade bodies, festival organisers, media/industry orgs
//   crypto_web3      — Web3, crypto, blockchain founders attending Cannes
//   media_publisher  — Media owners, publishers, broadcasters

const NEW_CONTACTS: NewContact[] = [
  // ── Consumer Brands — CEOs (brand_ceo) ──────────────────────────────────
  { name: 'Bjorn Gulden',             title: 'CEO',                                          company: 'Adidas',                      linkedin: 'https://www.linkedin.com/in/bjorngulden/',                segment: 'brand_ceo' },
  { name: 'Andrew Wilson',            title: 'Chairman and CEO',                             company: 'EA SPORTS',                   linkedin: 'https://www.linkedin.com/in/andrew-wilson-7a9117/',       segment: 'brand_ceo' },
  { name: 'Arvind Krishna',           title: 'Chairman and CEO',                             company: 'IBM',                         linkedin: 'https://www.linkedin.com/in/arvindkrishna/',              segment: 'brand_ceo' },
  { name: 'Adam Sussman',             title: 'President',                                    company: 'Nike',                        linkedin: 'https://www.linkedin.com/in/adamsussman/',                segment: 'brand_ceo' },
  { name: 'Hans Vestberg',            title: 'Chairman and CEO',                             company: 'Verizon',                     linkedin: 'https://www.linkedin.com/in/hansvestberg/',               segment: 'brand_ceo' },
  { name: 'Fidji Simo',               title: 'CEO',                                          company: 'Instacart',                   linkedin: 'https://www.linkedin.com/in/fidjisimo/',                  segment: 'brand_ceo' },
  { name: 'Demis Hassabis',           title: 'Co-Founder & CEO',                             company: 'Google DeepMind',             linkedin: 'https://www.linkedin.com/in/demishassabis/',              segment: 'brand_ceo' },
  { name: 'Cynthia Scott',            title: 'Group CEO',                                    company: 'Zip Co',                      linkedin: 'https://www.linkedin.com/in/cynthia-scott-17a4141/',      segment: 'brand_ceo' },
  { name: 'Jen Wong',                 title: 'Chief Operating Officer',                      company: 'Reddit',                      linkedin: 'https://www.linkedin.com/in/jenwong/',                    segment: 'brand_ceo' },

  // ── Consumer Brands — CMOs / Marketing Leaders (cmo_brand) ──────────────
  { name: 'Erika Wykes-Sneyd',        title: 'Global VP, Marketing & Communities',           company: 'Adidas',                      linkedin: 'https://www.linkedin.com/in/erika-wykes-sneyd-8588521/',  segment: 'cmo_brand' },
  { name: 'Tor Myhren',               title: 'VP, Marketing Communications',                 company: 'Apple',                       linkedin: 'https://www.linkedin.com/in/tor-myhren-3323083/',         segment: 'cmo_brand' },
  { name: 'Sabrina Ferretti',         title: 'Global Head of Brand Marketing',               company: 'Burger King',                 linkedin: 'https://www.linkedin.com/in/sabrina-ferretti-4632281/',   segment: 'cmo_brand' },
  { name: 'Janelle Sallenave',        title: 'Chief Spending Officer',                       company: 'Chime',                       linkedin: 'https://www.linkedin.com/in/janelle-sallenave-9a84a6/',   segment: 'cmo_brand' },
  { name: 'Carrie Palin',             title: 'Chief Marketing Officer',                      company: 'Cisco',                       linkedin: 'https://www.linkedin.com/in/carriepalin/',                segment: 'cmo_brand' },
  { name: 'Cristina Diezhandino',     title: 'Global Chief Marketing Officer',               company: 'Diageo',                      linkedin: 'https://www.linkedin.com/in/cristina-diezhandino-0b89a81/', segment: 'cmo_brand' },
  { name: 'Chris Bruzzo',             title: 'Chief Experience Officer',                     company: 'EA SPORTS',                   linkedin: 'https://www.linkedin.com/in/chrisbruzzo/',                segment: 'cmo_brand' },
  { name: 'John Reseburg',            title: 'VP, Marketing, Partnerships & Communications', company: 'EA SPORTS',                   linkedin: 'https://www.linkedin.com/in/john-reseburg-86111a1/',      segment: 'cmo_brand' },
  { name: 'David Jackson',            title: 'VP, Brand',                                    company: 'EA SPORTS',                   linkedin: 'https://www.linkedin.com/in/david-jackson-76a08611/',     segment: 'cmo_brand' },
  { name: 'Adrianne Nixon',           title: 'Director, Global Events & Experiential',       company: 'eBay',                        linkedin: 'https://www.linkedin.com/in/adriannenixon/',              segment: 'cmo_brand' },
  { name: 'Clay Cowan',               title: 'Chief Marketing Officer',                      company: 'IBM',                         linkedin: 'https://www.linkedin.com/in/claycowan/',                  segment: 'cmo_brand' },
  { name: 'Jonathan Adashek',         title: 'Chief Communications Officer & SVP, Marketing', company: 'IBM',                       linkedin: 'https://www.linkedin.com/in/jonathanadashek/',            segment: 'cmo_brand' },
  { name: 'Kameryn Stanhouse',        title: 'VP, Sports & Entertainment Partnerships',      company: 'IBM',                         linkedin: 'https://www.linkedin.com/in/kameryn-stanhouse-3323083/',  segment: 'cmo_brand' },
  { name: 'Diana Frost',              title: 'Global Chief Growth Officer',                  company: 'Kraft Heinz',                 linkedin: 'https://www.linkedin.com/in/diana-frost-5a0248a/',        segment: 'cmo_brand' },
  { name: 'Penry Price',              title: 'VP, Marketing Solutions',                      company: 'LinkedIn',                    linkedin: 'https://www.linkedin.com/in/penry-price-37651a1/',        segment: 'cmo_brand' },
  { name: 'Joan Colletta',            title: 'Global Brand VP',                              company: 'McDonald\'s',                 linkedin: 'https://www.linkedin.com/in/joan-colletta-5161042/',      segment: 'cmo_brand' },
  { name: 'Lex Bradshaw-Zanger',      title: 'Lead, Cannes Brand Marketing Academy',         company: 'McDonald\'s',                 linkedin: 'https://www.linkedin.com/in/lex-bradshaw-zanger-57223/',  segment: 'cmo_brand' },
  { name: 'Marc Pritchard',           title: 'Chief Brand Officer',                          company: 'P&G',                         linkedin: 'https://www.linkedin.com/in/marc-pritchard-11634b10/',    segment: 'cmo_brand' },
  { name: 'Lee Brown',                title: 'VP, Global Head of Advertising Business',      company: 'Spotify Advertising',         linkedin: 'https://www.linkedin.com/in/leebrown/',                   segment: 'cmo_brand' },
  { name: 'Louisa Wee',               title: 'Chief Marketing Officer',                      company: 'Strava',                      linkedin: 'https://www.linkedin.com/in/louisawee/',                  segment: 'cmo_brand' },
  { name: 'Francis Stones',           title: 'Global Head of Brand Safety & Responsible Media', company: 'TikTok',                  linkedin: 'https://www.linkedin.com/in/francisstones/',              segment: 'cmo_brand' },
  { name: 'Esi Eggleston Bracey',     title: 'Chief Growth and Marketing Officer',           company: 'Unilever',                    linkedin: 'https://www.linkedin.com/in/esiegglestonbracey/',         segment: 'cmo_brand' },
  { name: 'Gui Moraes',               title: 'Global Senior Marketing Manager',              company: 'Unilever',                    linkedin: 'https://www.linkedin.com/in/guimoraes/',                  segment: 'cmo_brand' },
  { name: 'Leslie Berland',           title: 'EVP & Chief Marketing Officer',                company: 'Verizon',                     linkedin: 'https://www.linkedin.com/in/leslieberland/',              segment: 'cmo_brand' },
  { name: 'Elizabeth Herbst-Brady',   title: 'Chief Revenue Officer',                        company: 'Yahoo!',                      linkedin: 'https://www.linkedin.com/in/elizabethherbstbrady/',       segment: 'cmo_brand' },
  { name: 'Jinal Shah',               title: 'Chief Marketing Officer (US)',                  company: 'Zip Co',                      linkedin: 'https://www.linkedin.com/in/jinalshah/',                  segment: 'cmo_brand' },
  { name: 'Chloe Rees',               title: 'Senior Director, Communications & Corporate Affairs', company: 'Zip Co',              linkedin: 'https://www.linkedin.com/in/chloerees/',                  segment: 'cmo_brand' },
  { name: 'Jill Kramer',              title: 'Chief Marketing and Communications Officer',   company: 'Mastercard',                  linkedin: 'https://www.linkedin.com/in/jill-kramer/',                segment: 'cmo_brand' },
  { name: 'Jamie Moldafsky',          title: 'Chief Marketing and Communications Officer',   company: 'Nielsen',                     linkedin: 'https://www.linkedin.com/in/jamiemoldafsky/',             segment: 'cmo_brand' },
  { name: 'Laura Jones',              title: 'Chief Marketing Officer',                      company: 'Instacart',                   linkedin: 'https://www.linkedin.com/in/laurajones/',                 segment: 'cmo_brand' },
  { name: 'Nicola Mendelsohn',        title: 'Head of Global Business Group',                company: 'Meta',                        linkedin: 'https://www.linkedin.com/in/nicolamendelsohn/',           segment: 'cmo_brand' },
  { name: 'Grace Kao',                title: 'Chief Marketing Officer',                      company: 'Snap Inc.',                   linkedin: 'https://www.linkedin.com/in/gracekao/',                   segment: 'cmo_brand' },
  { name: 'Tushar Shah',              title: 'Chief Product Officer',                        company: 'Yahoo',                       linkedin: 'https://www.linkedin.com/in/tusharshah/',                 segment: 'cmo_brand' },
  { name: 'Donna Speciale',           title: 'President of US Advertising and Sales',        company: 'TelevisaUnivision',           linkedin: 'https://www.linkedin.com/in/donnaspeciale/',              segment: 'cmo_brand' },
  { name: 'Deborah Tran',             title: 'Senior Brand Manager',                         company: 'Mars',                        linkedin: 'https://www.linkedin.com/in/deborah-tran-906a5b67/',      segment: 'cmo_brand' },

  // ── Agency CEOs / Network Heads (agency_ceo) ────────────────────────────
  { name: 'Corey duBrowa',            title: 'Global CEO',                                   company: 'Burson',                      linkedin: 'https://www.linkedin.com/in/coreydubrowa/',               segment: 'agency_ceo' },
  { name: 'Farah El Beaini',          title: 'Group Account Director',                       company: 'Burson',                      linkedin: 'https://www.linkedin.com/in/farahelbeaini/',              segment: 'agency_ceo' },
  { name: 'Taj Reid',                 title: 'Global Chief Creative Officer',                 company: 'Burson',                      linkedin: 'https://www.linkedin.com/in/tajreid/',                    segment: 'agency_ceo' },
  { name: 'Dan Gardner',              title: 'Executive Chairman',                            company: 'Code and Theory',             linkedin: 'https://www.linkedin.com/in/dangardner/',                 segment: 'agency_ceo' },
  { name: 'Dejan Jovanovic',          title: 'Founder & Creative Director',                   company: 'DE-YAN',                      linkedin: 'https://www.linkedin.com/in/dejanyov/',                   segment: 'agency_ceo' },
  { name: 'Richard Edelman',          title: 'CEO',                                          company: 'Edelman',                     linkedin: 'https://www.linkedin.com/in/richardwedelman/',            segment: 'agency_ceo' },
  { name: 'Nick Bell',                title: 'CEO',                                          company: 'Fanatics Advertising',        linkedin: 'https://www.linkedin.com/in/nick-bell-25191515/',         segment: 'agency_ceo' },
  { name: 'Jeremi Gorman',            title: 'Chief Revenue Officer',                        company: 'Fanatics Advertising',        linkedin: 'https://www.linkedin.com/in/jeremigorman/',               segment: 'agency_ceo' },
  { name: 'Tyler Turnbull',           title: 'Global CEO',                                   company: 'FCB',                         linkedin: 'https://www.linkedin.com/in/tylerturnbull/',              segment: 'agency_ceo' },
  { name: 'Yannick Bollore',          title: 'Chairman & CEO',                               company: 'Havas',                       linkedin: 'https://www.linkedin.com/in/yannickbollore/',             segment: 'agency_ceo' },
  { name: 'Devika Bulchandani',       title: 'Global CEO',                                   company: 'Ogilvy',                      linkedin: 'https://www.linkedin.com/in/devika-bulchandani/',         segment: 'agency_ceo' },
  { name: 'Michael Bierut',           title: 'Partner',                                      company: 'Pentagram',                   linkedin: 'https://www.linkedin.com/in/michael-bierut-8a0a996/',     segment: 'agency_ceo' },
  { name: 'James Murphy',             title: 'CEO',                                          company: 'Saatchi & Saatchi',           linkedin: 'https://www.linkedin.com/in/jamesmurphyadamandeve/',      segment: 'agency_ceo' },
  { name: 'Mark Penn',                title: 'Chairman & CEO',                               company: 'Stagwell',                    linkedin: 'https://www.linkedin.com/in/markpenn/',                   segment: 'agency_ceo' },
  { name: 'Bethany Donohue',          title: 'Global Head of Events',                        company: 'Stagwell',                    linkedin: 'https://www.linkedin.com/in/bethanydonohue/',             segment: 'agency_ceo' },
  { name: 'Fredrik Thomassen',        title: 'Co-founder & CEO',                             company: 'Superside',                   linkedin: 'https://www.linkedin.com/in/fredrikthomassen/',           segment: 'agency_ceo' },
  { name: 'Jen Rapp',                 title: 'Chief Marketing Officer',                      company: 'Superside',                   linkedin: 'https://www.linkedin.com/in/jenrapp/',                    segment: 'agency_ceo' },
  { name: 'Joe Gagliese',             title: 'Co-Founder & CEO',                             company: 'Viral Nation',                linkedin: 'https://www.linkedin.com/in/joegagliese/',                segment: 'agency_ceo' },
  { name: 'Kyle Monson',              title: 'Co-Founder',                                   company: 'Codeword',                    linkedin: 'https://www.linkedin.com/in/kylemonson/',                 segment: 'agency_ceo' },
  { name: 'Ryan Detert',              title: 'CEO',                                          company: 'Collectively (Brandtech)',    linkedin: 'https://www.linkedin.com/in/ryandetert/',                 segment: 'agency_ceo' },
  { name: 'Agelos Relias',            title: 'Head of Empathy Lab',                          company: 'EPAM',                        linkedin: 'https://www.linkedin.com/in/arelias/',                    segment: 'agency_ceo' },
  { name: 'James Smyllie',            title: 'President',                                    company: 'Fetch (Dentsu)',               linkedin: 'https://www.linkedin.com/in/jamessmyllie/',               segment: 'agency_ceo' },

  // ── AdTech / Platform / Data (tech_platform) ─────────────────────────────
  { name: 'Stacy Martinet',           title: 'VP, Marketing Strategy & Communications',      company: 'Adobe',                       linkedin: 'https://www.linkedin.com/in/stacymartinet/',              segment: 'tech_platform' },
  { name: 'Parbinder Dhariwal',       title: 'VP & General Manager',                         company: 'CVS Media Exchange',          linkedin: 'https://www.linkedin.com/in/parbinderdhariwal/',          segment: 'tech_platform' },
  { name: 'Rich Donahue',             title: 'Chief Marketing Officer',                      company: 'Ibotta Performance Network',  linkedin: 'https://www.linkedin.com/in/donahuerich/',                segment: 'tech_platform' },
  { name: 'Reed Barker',              title: 'Head of Advertising',                          company: 'Philo',                       linkedin: 'https://www.linkedin.com/in/reedbarker/',                 segment: 'tech_platform' },
  { name: 'Jean-Gabriel de Mourgues', title: 'EVP, Mirakl Ads',                              company: 'Mirakl',                      linkedin: 'https://www.linkedin.com/in/jgmourgues/',                 segment: 'tech_platform' },
  { name: 'Brandon Geary',            title: 'Chief Strategy Officer',                       company: 'GroundTruth',                 linkedin: 'https://www.linkedin.com/in/brandongeary/',               segment: 'tech_platform' },
  { name: 'Jay Altschuler',           title: 'Chief Revenue Officer',                        company: 'Dstillery',                   linkedin: 'https://www.linkedin.com/in/jayaltschuler/',              segment: 'tech_platform' },
  { name: 'Harshit Jain',             title: 'Founder & Global CEO',                         company: 'Doceree',                     linkedin: 'https://www.linkedin.com/in/drharshitjain/',              segment: 'tech_platform' },
  { name: 'Aaron Goforth',            title: 'President, Media',                             company: 'Inmar Media',                 linkedin: 'https://www.linkedin.com/in/aarongoforth/',               segment: 'tech_platform' },
  { name: 'James Douglas',            title: 'CEO & Founder',                                company: 'EightPM',                     linkedin: 'https://www.linkedin.com/in/james-douglas-eightpm/',      segment: 'tech_platform' },
  { name: 'Michael Epstein',          title: 'Global CEO, Starcom',                          company: 'SMG',                         linkedin: 'https://www.linkedin.com/in/michael-epstein-0466b04/',    segment: 'tech_platform' },
  { name: 'Kristine Casale',          title: 'VP, Marketing & Communications',               company: 'Sparks (Freeman)',             linkedin: 'https://www.linkedin.com/in/kristicasale/',               segment: 'tech_platform' },
  { name: 'Eric Boyko',               title: 'President, Co-Founder and CEO',                company: 'Stingray',                    linkedin: 'https://www.linkedin.com/in/ericboyko/',                  segment: 'tech_platform' },
  { name: 'David Steinberg',          title: 'Co-Founder, Chairman and CEO',                 company: 'Zeta Global',                 linkedin: 'https://www.linkedin.com/in/davidasteinberg/',            segment: 'tech_platform' },
  { name: 'Matt Sattel',              title: 'Chief Executive Officer',                      company: 'OpenX',                       linkedin: 'https://www.linkedin.com/in/mattsattel/',                 segment: 'tech_platform' },
  { name: 'Tim Vanderhook',           title: 'Co-Founder & CEO',                             company: 'Viant Technology',            linkedin: 'https://www.linkedin.com/in/tim-vanderhook-29a3971/',     segment: 'tech_platform' },
  { name: 'Chris Vanderhook',         title: 'Co-Founder & COO',                             company: 'Viant Technology',            linkedin: 'https://www.linkedin.com/in/chrisvanderhook/',            segment: 'tech_platform' },
  { name: 'Kaz Ohta',                 title: 'CEO and Co-Founder',                           company: 'Treasure AI',                 linkedin: 'https://www.linkedin.com/in/kazohta/',                    segment: 'tech_platform' },
  { name: 'Stu Solomon',              title: 'Chief Executive Officer',                      company: 'HUMAN Security',              linkedin: 'https://www.linkedin.com/in/stu-solomon-5183882/',        segment: 'tech_platform' },
  { name: 'Steve Phillips',           title: 'Founder & CEO',                                company: 'Zappi',                       linkedin: 'https://www.linkedin.com/in/steve-phillips-zappi/',       segment: 'tech_platform' },
  { name: 'Rich Raddon',              title: 'Co-Founder & Co-CEO',                          company: 'Zefr',                        linkedin: 'https://www.linkedin.com/in/richraddon/',                 segment: 'tech_platform' },
  { name: 'Zach James',               title: 'Co-Founder & Co-CEO',                          company: 'Zefr',                        linkedin: 'https://www.linkedin.com/in/zachjames/',                  segment: 'tech_platform' },
  { name: 'Jochen Schlosser',         title: 'Chief Strategy Officer',                       company: 'Adform',                      linkedin: 'https://www.linkedin.com/in/jochenschlosser/',            segment: 'tech_platform' },
  { name: 'Ryan Kangisser',           title: 'Chief Strategy Officer',                       company: 'MediaSense',                  linkedin: 'https://www.linkedin.com/in/ryankangisser/',              segment: 'tech_platform' },
  { name: 'John McElroy',             title: 'CEO',                                          company: 'Epsilon (Publicis)',           linkedin: 'https://www.linkedin.com/in/john-mcelroy-epsilon/',       segment: 'tech_platform' },
  { name: 'Ric Elert',                title: 'President & Chief Operating Officer',          company: 'Epsilon',                     linkedin: 'https://www.linkedin.com/in/ricelert/',                   segment: 'tech_platform' },
  { name: 'Michael Hahn',             title: 'CEO',                                          company: 'LG Ad Solutions',             linkedin: 'https://www.linkedin.com/in/michaelhahn/',                segment: 'tech_platform' },
  { name: 'Serge Matta',              title: 'President, Global Sales & Marketing',          company: 'LG Ad Solutions',             linkedin: 'https://www.linkedin.com/in/sergematta/',                 segment: 'tech_platform' },
  { name: 'John Boris',               title: 'Chief Growth Officer',                         company: 'Tripadvisor',                 linkedin: 'https://www.linkedin.com/in/johnboris/',                  segment: 'tech_platform' },
  { name: 'Christine Maguire',        title: 'VP, Global Advertising Revenue',               company: 'Tripadvisor',                 linkedin: 'https://www.linkedin.com/in/christinemaguire/',           segment: 'tech_platform' },

  // ── Industry Orgs / Festival / Media (industry_org) ──────────────────────
  { name: 'Simon Cook',               title: 'CEO',                                          company: 'Cannes Lions',                linkedin: 'https://www.linkedin.com/in/simon-cook-84a14125/',        segment: 'industry_org' },
  { name: 'Paul Kemp-Robertson',      title: 'Co-founder',                                   company: 'Contagious',                  linkedin: 'https://www.linkedin.com/in/paulkemprobertson/',          segment: 'industry_org' },
  { name: 'Carsten Koerl',            title: 'CEO',                                          company: 'Sportradar',                  linkedin: 'https://www.linkedin.com/in/carstenkoerl/',               segment: 'industry_org' },
  { name: 'Damon Westbury',           title: 'CEO',                                          company: 'Sweatwork',                   linkedin: 'https://www.linkedin.com/in/damonwestbury/',              segment: 'industry_org' },
  { name: 'Sophie Devonshire',        title: 'CEO',                                          company: 'The Marketing Society',       linkedin: 'https://www.linkedin.com/in/sophiedevonshire/',           segment: 'industry_org' },
  { name: 'Dame Carolyn McCall',      title: 'President',                                    company: 'The Marketing Society',       linkedin: 'https://www.linkedin.com/in/carolynmccall/',             segment: 'industry_org' },
  { name: 'Sarah Woodley',            title: 'Chief Commercial Officer',                     company: 'The Marketing Society',       linkedin: 'https://www.linkedin.com/in/sarah-woodley-b677a216/',    segment: 'industry_org' },
  { name: 'Paul Coxhill',             title: 'CEO',                                          company: 'WARC',                        linkedin: 'https://www.linkedin.com/in/paulcoxhill/',                segment: 'industry_org' },
  { name: 'Ben Page',                 title: 'Global CEO',                                   company: 'Ipsos',                       linkedin: 'https://www.linkedin.com/in/benpage/',                    segment: 'industry_org' },
  { name: 'Guillaume Charles',        title: 'Managing Director of Programs',                company: 'M6',                          linkedin: 'https://www.linkedin.com/in/guillaume-charles-0b89a81/', segment: 'industry_org' },
  { name: 'Michele Benzeno',          title: 'Managing Director',                            company: 'Webedia',                     linkedin: 'https://www.linkedin.com/in/michelebenzeno/',             segment: 'industry_org' },
  { name: 'Kelly Brown',              title: 'Lead Director & Master Artist',                company: 'Portrait Media Group',        linkedin: 'https://www.linkedin.com/in/kellybrownonline/',           segment: 'industry_org' },
  { name: 'Marcy Levitas Hamilton',   title: 'Co-Founder & CEO',                             company: 'Tricoast Media',              linkedin: 'https://www.linkedin.com/in/marcy-levitas-hamilton-7a46511/', segment: 'industry_org' },
  { name: 'Jasmine Dawson',           title: 'SVP, Digital Strategy & Content',              company: 'BBC Studios',                 linkedin: 'https://www.linkedin.com/in/jasmine-dawson-67846513/',   segment: 'media_publisher' },
  { name: 'Penny Brough',             title: 'Chief Marketing Officer',                      company: 'BBC Studios',                 linkedin: 'https://www.linkedin.com/in/penny-brough-4437291/',      segment: 'media_publisher' },
  { name: 'Scarlett Sieber',          title: 'Chief Strategy and Growth Officer',            company: 'Money 20/20 Europe',          linkedin: 'https://www.linkedin.com/in/scarlettsieber/',             segment: 'industry_org' },
  { name: 'Jean-Louis Salfati',       title: 'Managing Director',                            company: 'Palais des Festivals',        linkedin: 'https://www.linkedin.com/in/jean-louis-salfati-74b834/', segment: 'industry_org' },
  { name: 'Trista Kelley',            title: 'Editor in Chief',                              company: 'DL News',                     linkedin: 'https://www.linkedin.com/in/tristakelley/',               segment: 'media_publisher' },
  { name: 'Larry Cermak',             title: 'CEO',                                          company: 'The Block',                   linkedin: 'https://www.linkedin.com/in/larry-cermak-225301147/',     segment: 'media_publisher' },
  { name: 'Alena Afanaseva',          title: 'CEO & Founder',                                company: 'BeInCrypto',                  linkedin: 'https://www.linkedin.com/in/alenaafanaseva/',             segment: 'media_publisher' },

  // ── Crypto / Web3 (crypto_web3) ──────────────────────────────────────────
  { name: 'Ivo Georgiev',             title: 'CEO',                                          company: 'Ambire',                      linkedin: 'https://www.linkedin.com/in/ivogeorgiev/',                segment: 'crypto_web3' },
  { name: 'Hugh Karp',                title: 'Founder',                                      company: 'Nexus Mutual',                linkedin: 'https://www.linkedin.com/in/hugh-karp-3882771/',          segment: 'crypto_web3' },
  { name: 'Jernej Kos',               title: 'Director, Oasis Foundation',                   company: 'Oasis Protocol',              linkedin: 'https://www.linkedin.com/in/jernejkos/',                  segment: 'crypto_web3' },
  { name: 'Maksim Balashevich',       title: 'Founder & CEO',                                company: 'Santiment',                   linkedin: 'https://www.linkedin.com/in/balashevich/',                segment: 'crypto_web3' },
  { name: 'Jon Stephens',             title: 'CEO & Co-Founder',                             company: 'Veridise',                    linkedin: 'https://www.linkedin.com/in/jon-stephens-76a08611/',      segment: 'crypto_web3' },
  { name: 'Yaniv Tal',                title: 'Co-Founder',                                   company: 'The Graph',                   linkedin: 'https://www.linkedin.com/in/yanivtal/',                   segment: 'crypto_web3' },
  { name: 'Brian Retford',            title: 'CEO & Co-Founder',                             company: 'RISC Zero',                   linkedin: 'https://www.linkedin.com/in/bretford/',                   segment: 'crypto_web3' },
  { name: 'Paul Hauner',              title: 'Co-Founder',                                   company: 'Sigma Prime',                 linkedin: 'https://www.linkedin.com/in/paulhauner/',                 segment: 'crypto_web3' },
  { name: 'Yara Merz',                title: 'CEO',                                          company: 'Cropr',                       linkedin: 'https://www.linkedin.com/in/yara-merz/',                  segment: 'crypto_web3' },
  { name: 'Lucas Lecocq',             title: 'President',                                    company: 'Kryptosphere',                linkedin: 'https://www.linkedin.com/in/lucaslecocq/',                segment: 'crypto_web3' },
  { name: 'Philipp Sandner',          title: 'Founder',                                      company: 'DLT Talents',                 linkedin: 'https://www.linkedin.com/in/philippsandner/',             segment: 'crypto_web3' },
  { name: 'Robert Stevens',           title: 'Lead Researcher',                              company: 'DL Research',                 linkedin: 'https://www.linkedin.com/in/robert-stevens-crypto/',      segment: 'crypto_web3' },
  { name: 'Jonas Borchgrevink',       title: 'Director',                                     company: 'CCN.com',                     linkedin: 'https://www.linkedin.com/in/jonasborchgrevink/',          segment: 'crypto_web3' },
];

// ─── MESSAGE TEMPLATES ────────────────────────────────────────────────────────

function getFirstName(name: string): string {
  return name.split(' ')[0];
}

function generateMessages(c: NewContact): { connectionRequest: string; dmMessage: string } {
  const fn = getFirstName(c.name);

  switch (c.segment) {
    case 'brand_ceo':
      return {
        connectionRequest: `Hi ${fn} — we're running Indvstry Power House at Cannes Lions, a private villa with daily shuttles, no-pitch policy and AV facilities. Hosting a private dinner 23rd June for senior leaders. Would love to connect.`,
        dmMessage: `Hi ${fn},

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, AV and content facilities, and a strict no-pitch policy.

We are hosting a private Diaspora Dinner on Tuesday 23rd June — a small group of senior brand and creative leaders, off the official schedule, at the villa. Given your position at ${c.company}, we think you would be exactly the right person in the room.

We are also running a fringe event RSVP concierge for guests — with over 2,500 events happening that week, we handle the registrations so you show up to the ones that matter.

Worth a quick word?

Amber Jacobs | Community Manager, Indvstry Clvb`,
      };

    case 'cmo_brand':
      return {
        connectionRequest: `Hi ${fn} — running Indvstry Power House at Cannes Lions, a private villa with no-pitch policy and AV facilities. Great for client briefings away from the Croisette. Private dinner 23 Jun + fringe RSVP service. Worth connecting.`,
        dmMessage: `Hi ${fn},

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, AV and content facilities, and a no-pitch policy.

For marketing leaders at Cannes, the space works well as a neutral venue for client and agency conversations away from the branded beach clubs. No agenda, no pitches — just the right room for the right conversation.

We are also hosting a private Diaspora Dinner on 23rd June and running a fringe event RSVP concierge — with 2,500+ events that week, we handle the registrations so the right ones are locked in.

Happy to share more.

Amber Jacobs | Community Manager, Indvstry Clvb`,
      };

    case 'agency_ceo':
      return {
        connectionRequest: `Hi ${fn} — we're running Indvstry Power House at Cannes Lions, a private villa with AV studio, no-pitch zone and daily shuttles. Available for client roundtables, content sessions. Private dinner 23 Jun + fringe RSVP service.`,
        dmMessage: `Hi ${fn},

We are running Indvstry Power House during Cannes Lions week — a private villa with dedicated AV and content facilities, daily shuttles to La Croisette, and a no-pitch policy. A number of agency leaders are using the space for private client roundtables and off-schedule sessions away from the Palais.

Given ${c.company}'s presence at the festival, the space feels like a natural fit — whether for a client briefing, a recorded session or simply a proper room to have a real conversation.

We are also hosting a private Diaspora Dinner on 23rd June for a small group of senior industry leaders.

And a useful extra: we run a fringe event RSVP concierge for guests — 2,500+ events that week, we handle the registrations.

Worth a quick word?

Amber Jacobs | Community Manager, Indvstry Clvb`,
      };

    case 'tech_platform':
      return {
        connectionRequest: `Hi ${fn} — running Indvstry Power House at Cannes Lions, a private villa with no-pitch policy. Neutral briefing space for client meetings, AV for demos and recordings. Private dinner 23 Jun + fringe event RSVP service.`,
        dmMessage: `Hi ${fn},

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, AV facilities, and a strictly no-pitch, no-branded environment.

For tech and platform leaders at Cannes, having neutral ground away from the beach clubs makes a real difference when you need honest client conversations or a quiet space to demo something. The villa is available throughout the week for private briefings and small sessions.

We are also hosting a private Diaspora Dinner on 23rd June and running a fringe event RSVP concierge — 2,500+ events happen that week and we handle the registrations so the right ones are confirmed.

Happy to share more.

Amber Jacobs | Community Manager, Indvstry Clvb`,
      };

    case 'industry_org':
      return {
        connectionRequest: `Hi ${fn} — we're running Indvstry Power House at Cannes Lions, a private villa with daily shuttles, AV studio and no-pitch policy. Hosting a private dinner 23 Jun for senior leaders. Also running fringe event RSVP concierge. Worth connecting.`,
        dmMessage: `Hi ${fn},

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities, and a no-pitch policy.

Given your work at ${c.company} and your presence at the festival, we think the space could be genuinely useful — whether for a private meeting, a recorded conversation or simply a proper base away from the Palais.

We are also hosting a private Diaspora Dinner on Tuesday 23rd June — a small, curated group of senior leaders, entirely off the official schedule.

And with 2,500+ fringe events happening that week, we are running a concierge RSVP service for guests — we handle the registrations so you do not miss the ones that matter.

Happy to share more.

Amber Jacobs | Community Manager, Indvstry Clvb`,
      };

    case 'media_publisher':
      return {
        connectionRequest: `Hi ${fn} — running Indvstry Power House at Cannes Lions, a private villa with AV studio and no-pitch policy. Great for interviews, recordings and private briefings. Private dinner 23 Jun + fringe event RSVP service for guests.`,
        dmMessage: `Hi ${fn},

We are running Indvstry Power House during Cannes Lions week — a private villa with dedicated AV and content facilities, daily shuttles to La Croisette, and a no-pitch policy.

For media and publishing leaders at the festival, the space works well as a quiet studio environment — interviews, recordings, private briefings — away from the noise of the Palais and the Croisette.

We are also hosting a private Diaspora Dinner on 23rd June for a small group of senior creative and media leaders.

And a useful extra: we run a fringe event RSVP concierge for guests — with 2,500+ events that week, we handle the registrations so you do not miss the ones worth attending.

Happy to share more.

Amber Jacobs | Community Manager, Indvstry Clvb`,
      };

    case 'crypto_web3':
      return {
        connectionRequest: `Hi ${fn} — we're running Indvstry Power House during Cannes Lions week, a private villa with daily shuttles, no-pitch policy and AV facilities. A quiet base for private meetings and conversations during a very loud week. Worth connecting.`,
        dmMessage: `Hi ${fn},

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, AV facilities, and a strict no-pitch policy.

Cannes is a genuinely useful moment for the Web3 and crypto space — a lot of the major brand and media decision-makers are in one place. The villa gives you a quiet, neutral venue for private conversations and small briefings away from the official event chaos.

We are also hosting a private Diaspora Dinner on 23rd June — a small, senior group across tech, creative and brand — and running a fringe event RSVP concierge for guests.

Happy to share more if it is useful.

Amber Jacobs | Community Manager, Indvstry Clvb`,
      };

    default:
      return {
        connectionRequest: `Hi ${fn} — running Indvstry Power House at Cannes Lions, a private villa with daily shuttles, no-pitch policy and AV studio. Private dinner 23 Jun + fringe event RSVP concierge. Would love to connect.`,
        dmMessage: `Hi ${fn},

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, AV facilities, and a no-pitch policy.

We are hosting a private Diaspora Dinner on 23rd June and running a fringe event RSVP concierge for guests — with 2,500+ events that week, we handle the registrations so the right ones are locked in.

Happy to share more.

Amber Jacobs | Community Manager, Indvstry Clvb`,
      };
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

function main(): void {
  // Load existing
  const existing: OutreachRecord[] = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
  const existingNames = new Set(existing.map(r => r.name.toLowerCase().trim()));

  let added = 0;
  let skipped = 0;
  const newRecords: OutreachRecord[] = [];

  for (const c of NEW_CONTACTS) {
    const key = c.name.toLowerCase().trim();
    if (existingNames.has(key)) {
      console.log(`  SKIP (duplicate): ${c.name}`);
      skipped++;
      continue;
    }

    const messages = generateMessages(c);
    newRecords.push({
      name:              c.name,
      firstName:         getFirstName(c.name),
      title:             c.title,
      company:           c.company,
      linkedin:          c.linkedin,
      segment:           c.segment,
      connectionRequest: messages.connectionRequest,
      dmMessage:         messages.dmMessage,
    });
    existingNames.add(key);
    added++;
  }

  // Merge and save JSON
  const merged = [...existing, ...newRecords];
  fs.writeFileSync(JSON_FILE, JSON.stringify(merged, null, 2));

  // Append to CSV
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = newRecords.map(r =>
    [esc(r.name), esc(r.firstName), esc(r.title), esc(r.company), esc(r.linkedin), esc(r.segment), esc(r.connectionRequest), esc(r.dmMessage)].join(',')
  );
  fs.appendFileSync(CSV_FILE, '\n' + rows.join('\n'));

  // Segment summary
  const segments: Record<string, number> = {};
  newRecords.forEach(r => { segments[r.segment] = (segments[r.segment] || 0) + 1; });

  console.log(`\nAdded ${added} new contacts (${skipped} duplicates skipped)`);
  console.log(`Total in drip: ${merged.length}\n`);
  console.log('New contacts by segment:');
  Object.entries(segments).sort((a, b) => b[1] - a[1]).forEach(([seg, count]) => {
    console.log(`  ${seg.padEnd(20)} ${count}`);
  });
  console.log('\nFiles updated:');
  console.log(`  ${JSON_FILE}`);
  console.log(`  ${CSV_FILE}`);

  // Flag contacts with no URL provided
  console.log(`\n⚠️  Contacts with no LinkedIn URL provided (need manual lookup):`);
  const noUrl = [
    'Raissa Gerona — Chief Brand Officer, REVOLVE',
    'Kathleen Braine — CMO, 818 Tequila',
    'Catherine Ferdinand — Head of Brand & Experiential, Cash App',
    'Antoine Le Nel — Chief Growth & Marketing Officer, Revolut',
    'Boudewijn Haarsma — Managing Director UK, Heineken',
    'Craig Woolley — Marketing Activation Director, Heineken',
    'Paul Martecchini — VP Brand Marketing, FreeWheel',
    'Christopher Glover — VP Sales Marketing, FreeWheel',
    'Anthony Dunn — Marketing Director Northern Europe, Neutrogena',
    'Scott Bessent — Founder, Dual Financial',
    'Michael — Co-founder CEO, Brevis',
    'Thomas S. — CEO, RAAS LAB',
    'Clarice — Head of Partnerships, RAAS LAB',
  ];
  noUrl.forEach(n => console.log(`  • ${n}`));
}

main();
