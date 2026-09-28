import { WaveType } from "../Content/Content.types";

export const enum ModulateType {
  amplitude = 'amplitude',
  frequency = 'frequency',
}

export interface SignalValueParams {
  phase: number;
  dutyCycle: number;
}

export type SignalValueHandler = (params: SignalValueParams) => number;

export interface ISignalValueHandlers {
  sine: SignalValueHandler;
  triangle: SignalValueHandler;
  square: SignalValueHandler;
  sawtooth: SignalValueHandler;
}

export interface DataHandlerParams {
  data: Float32Array<ArrayBuffer>;
  sampleRate: number;
  modulateType: ModulateType;
  carrierWaveType: WaveType;
  carrierFreq: number;
  carrierDutyCycle: number;
  modulatingWaveType: WaveType;
  modulatingFreq: number;
  modulatingAmplitude: number;
  modulatingDutyCycle: number;
}

export type SoundDataHandler = (params: DataHandlerParams) => Float32Array<ArrayBuffer>;
