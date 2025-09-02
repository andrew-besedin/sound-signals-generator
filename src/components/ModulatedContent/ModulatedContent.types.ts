export const enum ModulateType {
  amplitude = 'amplitude',
  frequency = 'frequency',
}

export interface DataHandlerParams {
  data: Float32Array<ArrayBuffer>;
  sampleRate: number;
  modulatingFreq: number;
  modulateType: ModulateType;
  modulatingAmplitude: number;
  dutyCycle?: number;
}

export type SoundDataHandler = (params: DataHandlerParams) => Float32Array<ArrayBuffer>;

export interface ISoundDataHandlers {
  sine: SoundDataHandler;
  triangle: SoundDataHandler;
  square: SoundDataHandler;
  sawtooth: SoundDataHandler;
}