
export type WavesFuncParams<T = undefined> = {
  amplitude?: number;
  freq: number;
  time: number;
  timeOffset: number;
  extension: T;
}

export type WavesFuncParamsSquareExtension = { dutyCycle: number };

export type WavesFuncParamsForSquare = WavesFuncParams<WavesFuncParamsSquareExtension>;

export type WavesFuncType<T = undefined> = (params: WavesFuncParams<T>) => number;

export interface IWavesFuncs {
  sine: WavesFuncType;
  triangle: WavesFuncType;
  sawtooth: WavesFuncType;
  square: WavesFuncType<WavesFuncParamsSquareExtension>;
}