/**
 * ThreadJuice Writer Persona Types
 */

export interface WriterPersona {
  id: string;
  name: string;
  bio: string;
  stylePrompt: string;
  avatar: string;
  specialties: string[];
  tone:
    | 'sarcastic'
    | 'witty'
    | 'brutal'
    | 'intellectual'
    | 'condescending'
    | 'chaotic'
    | 'dry'
    | 'poetic';
  specialty: string; // Main specialty for compatibility
  sampleQuote: string; // For About page display
}

// Alias for type compatibility
export type Persona = WriterPersona;
