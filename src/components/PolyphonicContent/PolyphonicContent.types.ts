import { WaveType } from "../Content/Content.types";

export interface Overtone {
  waveType: WaveType;
  volume: number;
  dutyCycle: number;
}

export interface SignalValueParams {
  i: number;
  sampleRate: number;
  freq: number;
  dutyCycle: number;
}

export type SignalValueHandler = (params: SignalValueParams) => number;

export interface ISignalValueHandlers {
  sine: SignalValueHandler;
  triangle: SignalValueHandler;
  noise: SignalValueHandler;
  square: SignalValueHandler;
  sawtooth: SignalValueHandler;
}

export interface DataHandlerParams {
  data: Float32Array<ArrayBuffer>;
  sampleRate: number;
  freq: number;
  overtones: Overtone[];
}

export type SoundDataHandler = (params: DataHandlerParams) => Float32Array<ArrayBuffer>;
