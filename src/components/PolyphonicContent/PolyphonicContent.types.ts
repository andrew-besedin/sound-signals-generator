export interface DataHandlerParams {
  data: Float32Array<ArrayBuffer>;
  sampleRate: number;
  freq: number;
  overtoneVolumes: number[];
  dutyCycle?: number;
}

export type SoundDataHandler = (params: DataHandlerParams) => Float32Array<ArrayBuffer>;

export interface ISoundDataHandlers {
  sine: SoundDataHandler;
  triangle: SoundDataHandler;
  noise: SoundDataHandler;
  square: SoundDataHandler;
  sawtooth: SoundDataHandler;
}