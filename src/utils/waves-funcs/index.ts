import type { IWavesFuncs, WavesFuncParams, WavesFuncParamsForSquare } from "./types";

class WavesFunc implements IWavesFuncs {
  sine({ amplitude, freq, timeOffset, time }: WavesFuncParams): number {
    return (amplitude ?? 1) * Math.sin(2 * Math.PI * freq * (time + timeOffset));
  }

  triangle({ amplitude, freq, timeOffset, time }: WavesFuncParams): number {
    const period = 1 / freq;
    const cyclePosition = (time + timeOffset) % period;
    return (amplitude ?? 1) * (4 * freq * cyclePosition - 1);
  }

  sawtooth({ amplitude, freq, timeOffset, time }: WavesFuncParams): number {
    const period = 1 / freq;
    const cyclePosition = (time + timeOffset) % period;
    return (amplitude ?? 1) * (2 * freq * cyclePosition - 1);
  }

  square({ amplitude, freq, timeOffset, time, extension: { dutyCycle } }: WavesFuncParamsForSquare): number {
    const period = 1 / freq;
    const cyclePosition = (time + timeOffset) % period;
    return (amplitude ?? 1) * (cyclePosition < (period * dutyCycle) ? 1 : -1);
  }

  noise({ amplitude }: WavesFuncParams): number {
    return (amplitude ?? 1) * (Math.random() * 2 - 1);
  }
}

export const wavesFuncs = new WavesFunc();