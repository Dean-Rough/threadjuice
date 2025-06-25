/**
 * Pipeline Orchestrator
 *
 * Manages multiple pipelines and provides high-level coordination.
 * Handles pipeline selection, caching, and monitoring.
 */

import { Pipeline, PipelineOptions } from './Pipeline';
import { PipelineContext } from './PipelineContext';
import { PipelineStage } from './PipelineStage';

export interface OrchestratorConfig {
  defaultOptions?: PipelineOptions;
  maxConcurrent?: number;
  cacheEnabled?: boolean;
  monitoring?: boolean;
}

export interface PipelineDefinition {
  name: string;
  description: string;
  stages: PipelineStage[];
  options?: PipelineOptions;
}

export class PipelineOrchestrator {
  private pipelines: Map<string, Pipeline<any>> = new Map();
  private definitions: Map<string, PipelineDefinition> = new Map();
  private activePipelines: Set<string> = new Set();
  private config: OrchestratorConfig;
  private metrics: Map<string, any> = new Map();

  constructor(config: OrchestratorConfig = {}) {
    this.config = {
      maxConcurrent: 5,
      cacheEnabled: true,
      monitoring: true,
      ...config,
    };
  }

  /**
   * Register a pipeline definition
   */
  register(definition: PipelineDefinition): this {
    this.definitions.set(definition.name, definition);

    // Create pipeline instance
    const pipeline = this.createPipeline(definition);
    this.pipelines.set(definition.name, pipeline);

    console.log(`✅ Registered pipeline: ${definition.name}`);
    return this;
  }

  /**
   * Execute a named pipeline
   */
  async execute<TContext extends PipelineContext>(
    pipelineName: string,
    context: TContext
  ): Promise<TContext> {
    const pipeline = this.pipelines.get(pipelineName);
    if (!pipeline) {
      throw new Error(`Pipeline not found: ${pipelineName}`);
    }

    // Check concurrent limit
    if (this.activePipelines.size >= this.config.maxConcurrent!) {
      throw new Error(
        `Maximum concurrent pipelines (${this.config.maxConcurrent}) reached`
      );
    }

    const executionId = `${pipelineName}-${Date.now()}`;
    this.activePipelines.add(executionId);

    try {
      // Start monitoring
      if (this.config.monitoring) {
        this.startMonitoring(executionId, pipelineName);
      }

      // Execute pipeline
      const result = await pipeline.execute(context);

      // Record success
      if (this.config.monitoring) {
        this.recordSuccess(executionId, context);
      }

      return result;
    } catch (error) {
      // Record failure
      if (this.config.monitoring) {
        this.recordFailure(
          executionId,
          error instanceof Error ? error : new Error(String(error))
        );
      }
      throw error;
    } finally {
      this.activePipelines.delete(executionId);
    }
  }

  /**
   * Execute multiple pipelines in sequence
   */
  async executeSequence<TContext extends PipelineContext>(
    pipelineNames: string[],
    initialContext: TContext
  ): Promise<TContext> {
    let context = initialContext;

    for (const pipelineName of pipelineNames) {
      context = await this.execute(pipelineName, context);
    }

    return context;
  }

  /**
   * Execute multiple pipelines in parallel
   */
  async executeParallel<TContext extends PipelineContext>(
    contexts: Array<{ pipeline: string; context: TContext }>
  ): Promise<TContext[]> {
    const promises = contexts.map(({ pipeline, context }) =>
      this.execute(pipeline, context)
    );

    return Promise.all(promises);
  }

  /**
   * Get pipeline metadata
   */
  getPipelineInfo(pipelineName: string) {
    const definition = this.definitions.get(pipelineName);
    const pipeline = this.pipelines.get(pipelineName);

    if (!definition || !pipeline) {
      return null;
    }

    return {
      ...definition,
      metadata: pipeline.getMetadata(),
      metrics: this.getMetrics(pipelineName),
    };
  }

  /**
   * List all registered pipelines
   */
  listPipelines() {
    return Array.from(this.definitions.values()).map(def => ({
      name: def.name,
      description: def.description,
      stageCount: def.stages.length,
    }));
  }

  /**
   * Get orchestrator statistics
   */
  getStats() {
    return {
      registeredPipelines: this.pipelines.size,
      activePipelines: this.activePipelines.size,
      totalExecutions: this.getTotalExecutions(),
      successRate: this.getSuccessRate(),
    };
  }

  private createPipeline(definition: PipelineDefinition): Pipeline {
    const options = {
      ...this.config.defaultOptions,
      ...definition.options,
    };

    const pipeline = new Pipeline(options);

    for (const stage of definition.stages) {
      pipeline.pipe(stage);
    }

    return pipeline;
  }

  private startMonitoring(executionId: string, pipelineName: string) {
    this.metrics.set(executionId, {
      pipeline: pipelineName,
      startTime: Date.now(),
      status: 'running',
    });
  }

  private recordSuccess(executionId: string, context: PipelineContext) {
    const metrics = this.metrics.get(executionId);
    if (metrics) {
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      metrics.status = 'success';
      metrics.stagesCompleted = context.pipeline.stage;
    }
  }

  private recordFailure(executionId: string, error: Error) {
    const metrics = this.metrics.get(executionId);
    if (metrics) {
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      metrics.status = 'failed';
      metrics.error = error.message;
    }
  }

  private getMetrics(pipelineName: string) {
    const pipelineMetrics = Array.from(this.metrics.values()).filter(
      m => m.pipeline === pipelineName
    );

    const successful = pipelineMetrics.filter(m => m.status === 'success');
    const failed = pipelineMetrics.filter(m => m.status === 'failed');

    return {
      totalRuns: pipelineMetrics.length,
      successful: successful.length,
      failed: failed.length,
      averageDuration: this.calculateAverageDuration(successful),
      lastRun: pipelineMetrics[pipelineMetrics.length - 1],
    };
  }

  private getTotalExecutions(): number {
    return this.metrics.size;
  }

  private getSuccessRate(): number {
    const all = Array.from(this.metrics.values());
    if (all.length === 0) return 0;

    const successful = all.filter(m => m.status === 'success').length;
    return (successful / all.length) * 100;
  }

  private calculateAverageDuration(metrics: any[]): number {
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return Math.round(total / metrics.length);
  }
}

/**
 * Pre-configured orchestrator with common pipelines
 */
export function createDefaultOrchestrator(): PipelineOrchestrator {
  const orchestrator = new PipelineOrchestrator({
    defaultOptions: {
      debug: process.env.NODE_ENV === 'development',
      throwOnError: true,
    },
    monitoring: true,
  });

  // Register default pipelines here
  // orchestrator.register(redditStoryPipeline);
  // orchestrator.register(twitterStoryPipeline);
  // orchestrator.register(aiStoryPipeline);

  return orchestrator;
}
