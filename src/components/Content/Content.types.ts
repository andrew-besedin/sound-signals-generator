export const enum GenerateVariant {
  monophonic = 'monophonic',
  polyphonic = 'polyphonic',
  modulated = 'modulated',
}

export interface ContentProps {
  generateVariant: GenerateVariant;
}