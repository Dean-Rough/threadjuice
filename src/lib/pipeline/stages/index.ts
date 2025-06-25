/**
 * Pipeline Stages
 *
 * All available pipeline stages for content processing.
 */

// Source acquisition
export {
  SourceStage,
  RedditSource,
  TwitterSource,
  AISource,
} from './SourceStage';
export type { SourceOptions } from './SourceStage';

// Content analysis
export { AnalysisStage } from './AnalysisStage';
export type { AnalysisOptions } from './AnalysisStage';

// Story generation
export {
  GenerationStage,
  RedditGeneration,
  AIGeneration,
  TwitterGeneration,
} from './GenerationStage';
export type { GenerationOptions } from './GenerationStage';

// Media enrichment
export {
  EnrichmentStage,
  FullEnrichment,
  MinimalEnrichment,
  GifOnlyEnrichment,
} from './EnrichmentStage';
export type { EnrichmentOptions } from './EnrichmentStage';

// Content transformation
export { TransformStage } from './TransformStage';
export type { TransformOptions } from './TransformStage';

// Output formatting
export { OutputStage } from './OutputStage';
export type { OutputOptions } from './OutputStage';
