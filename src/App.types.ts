export const enum GenerateVariants {
  monophonic = 'monophonic',
  polyphonic = 'polyphonic',
  modulated = 'modulated',
}

export interface ContentProps {
  generateVariant: GenerateVariants;
}