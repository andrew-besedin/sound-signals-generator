export const enum GenerateVariant {
  monophonic = 'monophonic',
  polyphonic = 'polyphonic',
  modulated = 'modulated',
}

export interface ContentProps {
  generateVariant: GenerateVariant;
}

export const enum WaveType {
  sine = 'sine',
  square = 'square',
  triangle = 'triangle',
  sawtooth = 'sawtooth',
  noise = 'noise',
}