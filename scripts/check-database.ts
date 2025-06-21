#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  const posts = await prisma.post.findMany({
    select: { 
      title: true, 
      category: true, 
      author: true,
      status: true,
      createdAt: true 
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  console.log('\n📚 Recent posts in database:');
  posts.forEach((p, i) => {
    console.log(`${i+1}. [${p.category}] ${p.title}`);
    console.log(`   Author: ${p.author}, Status: ${p.status}`);
  });
  
  const totalCount = await prisma.post.count();
  console.log(`\nTotal posts: ${totalCount}`);
  
  await prisma.$disconnect();
}

checkDatabase().catch(console.error);