import { Button, FormLabel, MenuItem, Select, Slider, TextField } from "@mui/material";
import { useCallback, useState } from "react";

import { ContentContainer, FormRow, WaveType } from "../Content";
import { OvertonesButtonsContainer } from "./PolyphonicContent.styles";
import type { DataHandlerParams, ISignalValueHandlers, Overtone, SignalValueHandler, SignalValueParams } from "./PolyphonicContent.types";

const waveTypeOptions: { value: WaveType, label: string }[] = [
  { value: WaveType.sine, label: 'Sine' },
  { value: WaveType.sawtooth, label: 'Sawtooth' },
  { value: WaveType.triangle, label: 'Triangle' },
  { value: WaveType.square, label: 'Square' },
  { value: WaveType.noise, label: 'Noise' },
];

class SignalValueHandlers implements ISignalValueHandlers {
  sine({ i, sampleRate, freq }: SignalValueParams): number {
    return Math.sin(2 * Math.PI * freq * i / sampleRate);
  }
  triangle({ i, sampleRate, freq }: SignalValueParams): number {
    const period = sampleRate / freq;
    const cyclePosition = i % period;
    const value = (cyclePosition / period) * 4 - 1;

    return value <= 1 ? value : 2 - value;
  }
  square({ i, sampleRate, freq, dutyCycle }: SignalValueParams): number {
    const period = sampleRate / freq;
    const cyclePosition = i % period;

    return cyclePosition < (period * dutyCycle) ? 1 : -1;
  }
  sawtooth({ i, sampleRate, freq }: SignalValueParams): number {
    const period = sampleRate / freq;
    const cyclePosition = i % period;

    return (cyclePosition / period) * 2 - 1;
  }
  noise(): number {
    return Math.random() * 2 - 1;
  }
}

const signalValueHandlers = new SignalValueHandlers();

function getSignalValueHandler(waveType: WaveType): SignalValueHandler {
  switch (waveType) {
    case WaveType.sine:
      return signalValueHandlers.sine;
    case WaveType.triangle:
      return signalValueHandlers.triangle;
    case WaveType.square:
      return signalValueHandlers.square;
    case WaveType.sawtooth:
      return signalValueHandlers.sawtooth;
    case WaveType.noise:
      return signalValueHandlers.noise;
  }
}

function fillSoundData({ data, sampleRate, freq, overtones }: DataHandlerParams): Float32Array<ArrayBuffer> {
  const voices = overtones.map((overtone, index) => ({
    getSignalValue: getSignalValueHandler(overtone.waveType),
    freq: freq * (index + 1),
    dutyCycle: overtone.dutyCycle,
    amplitude: (overtone.volume / 100) / overtones.length,
  }));

  for (let i = 0; i < data.length; i++) {
    let value = 0;

    for (const voice of voices) {
      value += voice.getSignalValue({ i, sampleRate, freq: voice.freq, dutyCycle: voice.dutyCycle }) * voice.amplitude;
    }

    data[i] = value;
  }

  return data;
}

export function PolyphonicContent() {

  const [playingNode, setPlayingNode] = useState<AudioBufferSourceNode | null>(null);
  const [frequency, setFrequency] = useState('440');

  const [overtones, setOvertones] = useState<Overtone[]>([]);

  const baseFreq = Number(frequency);

  const onFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrequency(e.target.value);
  };

  const onAddOvertone = useCallback(() => {
    setOvertones([...overtones, { waveType: WaveType.sine, volume: 100, dutyCycle: 0.5 }]);
  }, [overtones]);

  const onRemoveOvertone = useCallback(() => {
    const index = overtones.length - 1;
    setOvertones(overtones.filter((_, i) => i !== index));
  }, [overtones]);

  const onUpdateOvertone = useCallback((index: number, changes: Partial<Overtone>) => {
    setOvertones(overtones.map((overtone, i) => i === index ? { ...overtone, ...changes } : overtone));
  }, [overtones]);

  const handlePlay = () => {
    if (playingNode) {
      playingNode.stop();
      setPlayingNode(null);
    }

    const ctx = new AudioContext();

    const sampleRate = ctx.sampleRate;
    const duration = 1;
    const freq = Number(frequency);

    if (Number.isNaN(freq) || freq <= 0 || freq > 10000) {
      return;
    }

    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    data.set(fillSoundData({ data, sampleRate, freq, overtones }));

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
    source.loop = true;

    setPlayingNode(source);
  };

  const handleStop = useCallback(() => {
    if (!playingNode) return;

    playingNode.stop();
    setPlayingNode(null);
  }, [playingNode]);

  return (
    <ContentContainer>
      <TextField
        variant="outlined"
        label="Frequency (Hz)"
        type="number"
        value={frequency}
        onChange={onFrequencyChange}
        slotProps={{
          htmlInput: { min: 0, max: 10000 },
        }}
        sx={{ width: '100%' }}
      />
      <FormRow>
        <FormLabel>Overtones</FormLabel>
        {overtones.map((overtone, index) => (
          <FormRow key={index}>
            <FormLabel>
              Overtone {index + 1}
              {Number.isFinite(baseFreq) && baseFreq > 0 ? ` — ${Math.round(baseFreq * (index + 1))} Hz` : ''}
            </FormLabel>
            <Select
              size="small"
              value={overtone.waveType}
              onChange={(e) => onUpdateOvertone(index, { waveType: e.target.value as WaveType })}
            >
              {waveTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
            <Slider
              value={overtone.volume}
              onChange={(_, value) => onUpdateOvertone(index, { volume: value })}
            />
            {overtone.waveType === WaveType.square && (
              <>
                <FormLabel>Duty Cycle</FormLabel>
                <Slider
                  value={overtone.dutyCycle * 100}
                  onChange={(_, value) => onUpdateOvertone(index, { dutyCycle: value / 100 })}
                />
              </>
            )}
          </FormRow>
        ))}
        <OvertonesButtonsContainer>
          <Button
            variant="outlined"
            onClick={onAddOvertone}
          >
            Add
          </Button>
          <Button
            variant="outlined"
            onClick={onRemoveOvertone}
          >
            Remove
          </Button>
        </OvertonesButtonsContainer>
      </FormRow>
      {playingNode
        ? <Button
          variant="outlined"
        onClick={handleStop}
        >
          Stop
        </Button>
        : <Button
          variant="outlined"
        onClick={handlePlay}
        >
          Play
        </Button>
      }
    </ContentContainer>
  );
}
