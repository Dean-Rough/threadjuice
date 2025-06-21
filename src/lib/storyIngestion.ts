import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

interface StoryData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: string;
  trending: boolean;
  featured: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
  persona: {
    id: string;
    name: string;
    bio: string;
    avatar: string;
    tone: string;
  };
  content: any;
  imageUrl: string;
  viewCount: number;
  upvoteCount: number;
  commentCount: number;
  shareCount: number;
  bookmarkCount: number;
  tags: string[];
  viral_score?: number;
  readingTime?: number;
  redditSource?: any;
}

export class StoryIngestionService {
  /**
   * Migrate all file-based stories to database
   */
  static async migrateAllStories(): Promise<{ success: number; errors: string[] }> {
    const results = { success: 0, errors: [] as string[] };
    
    // Get all story files dynamically
    const files = fs.readdirSync(process.cwd());
    const storyFiles = files.filter(f => 
      (f.includes('auto-generated-') || f.includes('generated-') || f.includes('story-')) 
      && f.endsWith('.json')
    );

    for (const filename of storyFiles) {
      try {
        const filePath = path.join(process.cwd(), filename);
        const storyData = JSON.parse(fs.readFileSync(filePath, 'utf8')) as StoryData;
        await this.ingestStory(storyData, true); // auto-approve = true
        results.success++;
      } catch (error) {
        console.error(`Error migrating ${filename}:`, error);
        results.errors.push(`${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }

  /**
   * Ingest a single story into the database
   */
  static async ingestStory(storyData: StoryData, autoApprove = true): Promise<string> {
    // Ensure personas exist
    await this.ensurePersona(storyData.persona);
    
    // Get the persona to ensure it exists and get its ID
    // Try both the exact slug and the slug with "the-" prefix
    let persona = await prisma.persona.findUnique({
      where: { slug: storyData.persona.id }
    });

    if (!persona && !storyData.persona.id.startsWith('the-')) {
      persona = await prisma.persona.findUnique({
        where: { slug: `the-${storyData.persona.id}` }
      });
    }

    if (!persona) {
      throw new Error(`Persona not found for slug: ${storyData.persona.id} or the-${storyData.persona.id}`);
    }
    
    // Ensure tags exist
    const tagIds = await this.ensureTags(storyData.tags || []);
    
    // Check if story already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug: storyData.slug }
    });

    if (existingPost) {
      // console.log(`Story ${storyData.slug} already exists, skipping...`);
      return existingPost.id;
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        id: storyData.id,
        title: storyData.title,
        slug: storyData.slug,
        excerpt: storyData.excerpt,
        content: storyData.content,
        imageUrl: storyData.imageUrl,
        category: storyData.category,
        author: storyData.author,
        status: autoApprove ? 'published' : 'draft',
        trending: storyData.trending,
        featured: storyData.featured,
        viewCount: storyData.viewCount || 0,
        upvoteCount: storyData.upvoteCount || 0,
        commentCount: storyData.commentCount || 0,
        shareCount: storyData.shareCount || 0,
        bookmarkCount: storyData.bookmarkCount || 0,
        redditThreadId: storyData.redditSource?.originalPost || null,
        subreddit: storyData.redditSource?.subreddit || null,
        createdAt: new Date(storyData.createdAt),
        updatedAt: new Date(storyData.updatedAt),
        personaId: persona.id,
        postTags: {
          create: tagIds.map(tagId => ({ tagId }))
        }
      },
      include: {
        persona: true,
        postTags: { include: { tag: true } }
      }
    });

    // Handle Reddit comments if they exist
    if (storyData.content?.sections) {
      await this.ingestRedditComments(post.id, storyData.content.sections);
    }

    // console.log(`Story ${storyData.slug} ingested successfully`);
    return post.id;
  }

  /**
   * Generate bulk stories using the unified generator
   */
  static async generateBulkStories(count: number): Promise<{ success: number; errors: string[] }> {
    const results = { success: 0, errors: [] as string[] };
    
    try {
      // Use the unified story generator via child process
      const { execSync } = await import('child_process');
      const output = execSync(
        `node scripts/content/generate-story-unified.js bulk ${count}`,
        { encoding: 'utf8', cwd: process.cwd() }
      );
      
      // Parse results from output
      const generatedMatch = output.match(/Generated (\d+) stories/);
      if (generatedMatch) {
        results.success = parseInt(generatedMatch[1]);
      }
      
      const failedMatch = output.match(/Failed: (\d+)/);
      if (failedMatch && parseInt(failedMatch[1]) > 0) {
        results.errors.push(`${failedMatch[1]} stories failed to generate`);
      }
    } catch (error) {
      console.error('Bulk generation failed:', error);
      results.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }
    
    return results;
  }

  /**
   * Ensure persona exists in database
   */
  private static async ensurePersona(personaData: StoryData['persona']): Promise<void> {
    const existingPersona = await prisma.persona.findUnique({
      where: { slug: personaData.id }
    });

    if (!existingPersona) {
      try {
        await prisma.persona.create({
          data: {
            name: personaData.name,
            slug: personaData.id,
            avatarUrl: personaData.avatar,
            tone: personaData.tone,
            bio: personaData.bio,
            storyCount: 0,
            rating: 8.5
          }
        });
        // console.log(`Created persona: ${personaData.name}`);
      } catch (error) {
        // Check if persona exists by name (in case of race condition)
        const existingByName = await prisma.persona.findUnique({
          where: { name: personaData.name }
        });
        
        if (!existingByName) {
          throw error; // Re-throw if it's not a duplicate name issue
        }
        // console.log(`Persona ${personaData.name} already exists, continuing...`);
      }
    }
  }

  /**
   * Ensure tags exist and return their IDs
   */
  private static async ensureTags(tagNames: string[]): Promise<number[]> {
    const tagIds: number[] = [];

    for (const tagName of tagNames) {
      const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      let tag = await prisma.tag.findUnique({
        where: { slug }
      });

      if (!tag) {
        tag = await prisma.tag.create({
          data: {
            name: tagName,
            slug,
            usageCount: 0
          }
        });
        // console.log(`Created tag: ${tagName}`);
      }

      // Increment usage count
      await prisma.tag.update({
        where: { id: tag.id },
        data: { usageCount: { increment: 1 } }
      });

      tagIds.push(tag.id);
    }

    return tagIds;
  }

  /**
   * Ingest Reddit comments from story sections
   */
  private static async ingestRedditComments(postId: string, sections: any[]): Promise<void> {
    const commentSections = sections.filter(section => 
      section.type === 'comments-1' || section.type === 'comments-2'
    );

    for (const section of commentSections) {
      if (section.metadata?.comments) {
        for (const comment of section.metadata.comments) {
          await prisma.comment.create({
            data: {
              postId,
              authorName: comment.author,
              content: comment.content,
              upvoteCount: Math.floor(Math.random() * 50) + 5,
              downvoteCount: Math.floor(Math.random() * 10),
              isRedditExcerpt: true,
              status: 'active'
            }
          });
        }
      }
    }
  }

  /**
   * Auto-approve all pending stories
   */
  static async autoApproveAll(): Promise<number> {
    const result = await prisma.post.updateMany({
      where: { status: 'draft' },
      data: { status: 'published' }
    });

    // console.log(`Auto-approved ${result.count} stories`);
    return result.count;
  }

  /**
   * Generate bulk stories using the existing script
   */
  static async generateBulkStories(count: number): Promise<{ success: number; errors: string[] }> {
    const results = { success: 0, errors: [] as string[] };
    
    for (let i = 0; i < count; i++) {
      try {
        // Run the story generation script
        const { execSync } = require('child_process');
        execSync('node generate-full-automated-story.js', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        
        // The script will create a new file, we'll ingest it in the next migration
        results.success++;
        
        // Wait a bit between generations to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error generating story ${i + 1}:`, error);
        results.errors.push(`Story ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }
}