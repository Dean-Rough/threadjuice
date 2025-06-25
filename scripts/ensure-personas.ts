#!/usr/bin/env tsx

/**
 * Ensure Personas Script
 * Makes sure all required personas exist in the database
 */

import { prisma } from '../src/lib/prisma';

async function ensurePersonas() {
  console.log('👤 Ensuring personas exist in database...\n');

  const personas = [
    {
      name: 'The Snarky Sage',
      slug: 'the-snarky-sage',
      avatarUrl: '/assets/img/personas/the-snarky-sage.svg',
      tone: 'Sarcastic and sharp',
      bio: 'Master of deadpan delivery with a razor-sharp wit. Sees through BS faster than light through vacuum.',
      rating: 8.9,
    },
    {
      name: 'The Down-to-Earth Buddy',
      slug: 'the-down-to-earth-buddy',
      avatarUrl: '/assets/img/personas/the-down-to-earth-buddy.svg',
      tone: 'Relatable and warm',
      bio: 'Your chill friend who gets it. Keeps it real without the pretense, just good vibes and honest takes.',
      rating: 9.2,
    },
    {
      name: 'The Dry Cynic',
      slug: 'the-dry-cynic',
      avatarUrl: '/assets/img/personas/the-dry-cynic.svg',
      tone: 'Darkly humorous',
      bio: "Finds the absurdity in everything. If chaos had a spokesperson, they'd quit and let this one take over.",
      rating: 8.7,
    },
  ];

  try {
    for (const personaData of personas) {
      const existing = await prisma.persona.findUnique({
        where: { slug: personaData.slug },
      });

      if (existing) {
        console.log(`✅ ${personaData.name} already exists`);
      } else {
        await prisma.persona.create({
          data: {
            ...personaData,
            storyCount: 0,
          },
        });
        console.log(`✅ Created ${personaData.name}`);
      }
    }

    console.log('\n✅ All personas ready!');
  } catch (error) {
    console.error('\n❌ Error ensuring personas:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
ensurePersonas();
