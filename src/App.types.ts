export const enum GenerateVariant {
  monophonic = 'monophonic',
  polyphonic = 'polyphonic',
  modulated = 'modulated',
}

export const enum WaveType {
  sine = 'sine',
  square = 'square',
  triangle = 'triangle',
  sawtooth = 'sawtooth',
  noise = 'noise',
}

export interface DataHandlerParams {
  data: Float32Array<ArrayBuffer>;
  sampleRate: number;
  freq: number;
  dutyCycle?: number;
}

export interface ContentProps {
  generateVariant: GenerateVariant;
}

export type SoundDataHandler = (params: DataHandlerParams) => Float32Array<ArrayBuffer>;

export interface ISoundDataHandlers {
  sine: SoundDataHandler;
  triangle: SoundDataHandler;
  noise: SoundDataHandler;
  square: SoundDataHandler;
  sawtooth: SoundDataHandler;
}