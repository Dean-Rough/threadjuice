/**
 * Pipeline Stage Interface
 *
 * Defines the contract for all pipeline stages.
 * Each stage is responsible for one specific transformation.
 */

import { PipelineContext } from './PipelineContext';

export interface PipelineStage<
  TContext extends PipelineContext = PipelineContext,
> {
  /**
   * Unique name for this stage
   */
  name: string;

  /**
   * Human-readable description
   */
  description?: string;

  /**
   * Process the context and return the transformed version
   */
  process(context: TContext): Promise<TContext>;

  /**
   * Optional validation before processing
   */
  validate?(context: TContext): Promise<boolean>;

  /**
   * Optional post-processing hook
   */
  postProcess?(context: TContext): Promise<void>;

  /**
   * Dependencies on other stages (for parallel execution)
   */
  dependsOn?: string[];
}

/**
 * Abstract base class for pipeline stages
 */
export abstract class BasePipelineStage<
  TContext extends PipelineContext = PipelineContext,
> implements PipelineStage<TContext>
{
  abstract name: string;
  description?: string;
  dependsOn?: string[];

  abstract process(context: TContext): Promise<TContext>;

  async validate(context: TContext): Promise<boolean> {
    // Override in subclasses for specific validation
    return true;
  }

  async postProcess(context: TContext): Promise<void> {
    // Override in subclasses for cleanup or side effects
  }

  /**
   * Helper method for logging within stages
   */
  protected log(message: string, data?: any) {
    console.log(`[${this.name}] ${message}`, data || '');
  }

  /**
   * Helper method for timing operations
   */
  protected async timeOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - start;
      this.log(`${operationName} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.log(`${operationName} failed after ${duration}ms: ${errorMessage}`);
      throw error;
    }
  }
}
