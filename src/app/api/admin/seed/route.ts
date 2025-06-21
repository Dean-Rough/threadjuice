import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // console.log('Seeding personas...');

    // Create the three personas
    const personas = [
      {
        name: 'The Snarky Sage',
        slug: 'snarky-sage',
        avatarUrl: '/assets/img/personas/sage.png',
        tone: 'Sarcastic and deadpan with brutal honesty',
        bio: 'Tells it like it is with a side of savage wit and zero patience for BS.',
        storyCount: 0,
        rating: 8.5,
      },
      {
        name: 'The Down-to-Earth Buddy',
        slug: 'down-to-earth-buddy',
        avatarUrl: '/assets/img/personas/buddy.png',
        tone: 'Chill and friendly with relatable insights',
        bio: 'Your virtual best friend who always has your back and keeps it real.',
        storyCount: 0,
        rating: 8.5,
      },
      {
        name: 'The Dry Cynic',
        slug: 'dry-cynic',
        avatarUrl: '/assets/img/personas/cynic.png',
        tone: 'Bitterly hilarious with a chaos-loving perspective',
        bio: "Finds humor in humanity's daily disasters and serves it with a perfectly dry martini of sarcasm.",
        storyCount: 0,
        rating: 8.5,
      },
    ];

    const results = [];
    for (const personaData of personas) {
      const existing = await prisma.persona.findUnique({
        where: { slug: personaData.slug },
      });

      if (!existing) {
        const persona = await prisma.persona.create({
          data: personaData,
        });
        results.push(persona);
        // console.log(`Created persona: ${personaData.name}`);
      } else {
        // console.log(`Persona already exists: ${personaData.name}`);
        results.push(existing);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Personas seeded successfully',
      personas: results,
    });
  } catch (error) {
    console.error('Seeding failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Seeding failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const personas = await prisma.persona.findMany();

    return NextResponse.json({
      personas,
      count: personas.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    );
  }
}
