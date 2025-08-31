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
}

export interface ContentProps {
  generateVariant: GenerateVariant;
}

export interface ISoundDataHandlers {
  sine(params: DataHandlerParams): Float32Array<ArrayBuffer>;
  triangle(params: DataHandlerParams): Float32Array<ArrayBuffer>;
  // square(params: DataHandlerParams): Float32Array<ArrayBuffer>;
  // sawtooth(params: DataHandlerParams): Float32Array<ArrayBuffer>;
  noise(params: DataHandlerParams): Float32Array<ArrayBuffer>;
}