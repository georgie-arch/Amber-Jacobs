/**
 * preview-decks.ts
 *
 * Standalone local server to preview all brand-customised Power House decks.
 * Run: npx ts-node --project tsconfig.json src/scripts/preview-decks.ts
 * Then open: http://localhost:4000/deck
 */

import express from 'express';
import dotenv from 'dotenv';
import deckRoutes from '../decks/deck-routes';

dotenv.config();

const app = express();
app.use('/deck', deckRoutes);

app.get('/', (_req, res) => res.redirect('/deck'));

const PORT = 4000;
app.listen(PORT, () => {
  console.log('\n🎨 Power House Deck Preview Server\n');
  console.log('Open any of these in your browser:\n');
  const brands = ['kantar', 'magnite', 'vaynermedia', 'iheartmedia', 'adage', 'meta', 'linkedin', 'spotify'];
  brands.forEach(b => console.log(`   http://localhost:${PORT}/deck/${b}`));
  console.log(`\n   All decks: http://localhost:${PORT}/deck\n`);
  console.log('Press Ctrl+C to stop.\n');
});
