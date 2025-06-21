/**
 * Output Stage
 * 
 * Handles the final output of processed stories.
 * Can save to database, files, or return for API responses.
 */

import { BasePipelineStage } from '../core/PipelineStage';
import { PipelineContext } from '../core/PipelineContext';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

export interface OutputOptions {
  saveToDatabase?: boolean;
  saveToFile?: boolean;
  fileDirectory?: string;
  returnOnly?: boolean;
}

export class OutputStage extends BasePipelineStage {
  name = 'OutputStage';
  description = 'Outputs the processed story to various destinations';

  private options: OutputOptions;
  private prisma?: PrismaClient;

  constructor(options: OutputOptions = {}) {
    super();
    this.options = {
      saveToDatabase: true,
      saveToFile: false,
      fileDirectory: 'data/generated-stories',
      returnOnly: false,
      ...options,
    };
  }

  async process(context: PipelineContext): Promise<PipelineContext> {
    this.log('Processing story output');

    if (!context.output.story) {
      throw new Error('No story available for output');
    }

    const tasks = [];

    if (this.options.saveToDatabase && !this.options.returnOnly) {
      tasks.push(this.saveToDatabase(context));
    }

    if (this.options.saveToFile && !this.options.returnOnly) {
      tasks.push(this.saveToFile(context));
    }

    // Execute output tasks
    await Promise.all(tasks);

    this.log(`Story output complete: ${context.output.story.slug}`);

    return context;
  }

  private async saveToDatabase(context: PipelineContext): Promise<void> {
    this.log('Saving story to database');

    if (!this.prisma) {
      this.prisma = new PrismaClient();
    }

    const story = context.output.story!;

    try {
      // First, ensure persona exists
      let persona = await this.prisma.persona.findFirst({
        where: { name: story.author },
      });

      if (!persona) {
        // Create persona if it doesn't exist
        persona = await this.prisma.persona.create({
          data: {
            name: story.author,
            slug: this.createSlug(story.author),
            bio: 'Viral content creator',
            tone: 'Engaging and witty',
            avatarUrl: `/assets/img/personas/${this.createSlug(story.author)}.svg`,
            storyCount: 0,
            rating: 4.5,
          },
        });
      }

      // Save the story
      await this.prisma.post.create({
        data: {
          title: story.title,
          slug: story.slug,
          excerpt: story.excerpt,
          content: JSON.stringify(story.content),
          imageUrl: context.enrichments.primaryImage?.url || '/assets/img/default.jpg',
          category: story.category,
          author: story.author,
          personaId: persona.id,
          status: 'published',
          viewCount: 0,
          upvoteCount: 0,
          commentCount: 0,
          shareCount: 0,
          bookmarkCount: 0,
          trending: story.metadata.viral_score > 7,
          featured: false,
          subreddit: story.category,
        },
      });

      this.log(`Story saved to database: ${story.id}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`Database save failed: ${errorMessage}`);
      throw error;
    }
  }

  private async saveToFile(context: PipelineContext): Promise<void> {
    this.log('Saving story to file');

    const story = context.output.story!;
    const filename = `${story.slug}-${Date.now()}.json`;
    const filepath = path.join(this.options.fileDirectory!, filename);

    try {
      // Ensure directory exists
      await fs.mkdir(this.options.fileDirectory!, { recursive: true });

      // Create complete output object
      const output = {
        story,
        media: context.output.media,
        analysis: {
          entities: context.analysis.entities,
          keywords: context.analysis.keywords,
          sentiment: context.analysis.sentiment,
        },
        metadata: {
          source: context.source.type,
          generatedAt: new Date().toISOString(),
          pipeline: {
            duration: context.getDuration(),
            errors: context.pipeline.errors,
          },
        },
      };

      // Write to file
      await fs.writeFile(filepath, JSON.stringify(output, null, 2));

      this.log(`Story saved to file: ${filename}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`File save failed: ${errorMessage}`);
      throw error;
    }
  }

  private createSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async validate(context: PipelineContext): Promise<boolean> {
    if (!context.output.story) {
      this.log('No story in output');
      return false;
    }

    return true;
  }

  async postProcess(context: PipelineContext): Promise<void> {
    // Clean up database connection
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }
}

/**
 * Factory functions for common output configurations
 */
export const DatabaseOutput = () => new OutputStage({
  saveToDatabase: true,
  saveToFile: false,
});

export const FileOutput = (directory?: string) => new OutputStage({
  saveToDatabase: false,
  saveToFile: true,
  fileDirectory: directory,
});

export const DualOutput = () => new OutputStage({
  saveToDatabase: true,
  saveToFile: true,
});

export const ApiOutput = () => new OutputStage({
  returnOnly: true,
});