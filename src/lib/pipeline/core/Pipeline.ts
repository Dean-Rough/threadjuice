/**
 * Base Pipeline Class
 *
 * A beautiful, extensible pipeline for processing stories through multiple stages.
 * Each stage transforms the context, building up a rich story object.
 */

import { PipelineStage } from './PipelineStage';
import { PipelineContext } from './PipelineContext';

// Helper function to get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}

export interface PipelineOptions {
  parallel?: boolean;
  throwOnError?: boolean;
  debug?: boolean;
}

export class Pipeline<TContext extends PipelineContext = PipelineContext> {
  private stages: PipelineStage<TContext>[] = [];
  private options: PipelineOptions;

  constructor(options: PipelineOptions = {}) {
    this.options = {
      parallel: false,
      throwOnError: true,
      debug: false,
      ...options,
    };
  }

  /**
   * Add a stage to the pipeline
   */
  pipe(stage: PipelineStage<TContext>): this {
    this.stages.push(stage);
    return this;
  }

  /**
   * Execute the pipeline with the given context
   */
  async execute(context: TContext): Promise<TContext> {
    this.log('🚀 Pipeline execution started');

    try {
      let currentContext = context;

      for (const [index, stage] of this.stages.entries()) {
        this.log(`📍 Stage ${index + 1}/${this.stages.length}: ${stage.name}`);

        try {
          // Validate context before stage
          if (stage.validate && !(await stage.validate(currentContext))) {
            throw new Error(`Validation failed for stage: ${stage.name}`);
          }

          // Execute stage
          const startTime = Date.now();
          currentContext = await stage.process(currentContext);
          const duration = Date.now() - startTime;

          this.log(`✅ Stage ${stage.name} completed in ${duration}ms`);

          // Post-process hook
          if (stage.postProcess) {
            await stage.postProcess(currentContext);
          }
        } catch (error) {
          this.log(`❌ Stage ${stage.name} failed: ${getErrorMessage(error)}`);

          if (this.options.throwOnError) {
            throw error;
          }

          // Skip to next stage if not throwing
          continue;
        }
      }

      this.log('🎉 Pipeline execution completed');
      return currentContext;
    } catch (error) {
      this.log(`💥 Pipeline failed: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Execute stages in parallel (where possible)
   */
  async executeParallel(context: TContext): Promise<TContext> {
    if (!this.options.parallel) {
      return this.execute(context);
    }

    this.log('🚀 Pipeline parallel execution started');

    // Group stages by dependencies
    const stageGroups = this.groupStagesByDependencies();
    let currentContext = context;

    for (const group of stageGroups) {
      this.log(`⚡ Executing ${group.length} stages in parallel`);

      const results = await Promise.all(
        group.map(stage => this.executeStage(stage, currentContext))
      );

      // Merge results (last write wins for now)
      for (const result of results) {
        currentContext = { ...currentContext, ...result };
      }
    }

    return currentContext;
  }

  /**
   * Create a new pipeline with additional stages
   */
  extend(...stages: PipelineStage<TContext>[]): Pipeline<TContext> {
    const newPipeline = new Pipeline<TContext>(this.options);
    newPipeline.stages = [...this.stages, ...stages];
    return newPipeline;
  }

  /**
   * Get pipeline metadata
   */
  getMetadata() {
    return {
      stageCount: this.stages.length,
      stages: this.stages.map(s => ({
        name: s.name,
        description: s.description,
      })),
      options: this.options,
    };
  }

  private async executeStage(
    stage: PipelineStage<TContext>,
    context: TContext
  ): Promise<TContext> {
    try {
      if (stage.validate && !(await stage.validate(context))) {
        throw new Error(`Validation failed`);
      }
      return await stage.process(context);
    } catch (error) {
      if (this.options.throwOnError) {
        throw new Error(
          `Stage ${stage.name} failed: ${getErrorMessage(error)}`
        );
      }
      return context;
    }
  }

  private groupStagesByDependencies(): PipelineStage<TContext>[][] {
    // For now, simple implementation - no parallel execution
    // This could be enhanced with dependency resolution
    return this.stages.map(stage => [stage]);
  }

  private log(message: string) {
    if (this.options.debug) {
      console.log(`[Pipeline] ${message}`);
    }
  }
}

/**
 * Fluent builder for creating pipelines
 */
export class PipelineBuilder<
  TContext extends PipelineContext = PipelineContext,
> {
  private pipeline: Pipeline<TContext>;

  constructor(options?: PipelineOptions) {
    this.pipeline = new Pipeline<TContext>(options);
  }

  add(stage: PipelineStage<TContext>): this {
    this.pipeline.pipe(stage);
    return this;
  }

  build(): Pipeline<TContext> {
    return this.pipeline;
  }
}
