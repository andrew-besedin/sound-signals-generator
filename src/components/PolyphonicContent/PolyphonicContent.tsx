import { Button, FormControlLabel, FormLabel, Radio, RadioGroup, Slider, TextField } from "@mui/material";

import { ContentContainer, FormRow, WaveType } from "../Content";
import { useCallback, useState } from "react";
import { OvertonesButtonsContainer } from "./PolyphonicContent.styles";
import type { DataHandlerParams, ISoundDataHandlers, SoundDataHandler } from "./PolyphonicContent.types";

class SoundDataHandlers implements ISoundDataHandlers {
  sine(params: DataHandlerParams): Float32Array<ArrayBuffer> {
    const { data, sampleRate, freq, overtoneVolumes } = params;

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < overtoneVolumes.length; j++) {

        function getSineSignalValue(freq: number): number {
          return Math.sin(2 * Math.PI * freq * i / sampleRate);
        }

        const overtonesTotal = overtoneVolumes.length;
        const overtoneVolume = overtoneVolumes[j];
        const finalFreq = freq * (j + 1);
        data[i] += getSineSignalValue(finalFreq) * ((overtoneVolume / 100) / overtonesTotal);
      }
    }

    return data;
  }
  triangle(params: DataHandlerParams): Float32Array<ArrayBuffer> {
    const { data, sampleRate, freq, overtoneVolumes } = params;
    
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < overtoneVolumes.length; j++) {
        function getTriangleSignalValue(freq: number): number {
          const period = sampleRate / freq;
          const cyclePosition = i % period;
          const value = (cyclePosition / period) * 4 - 1;
          return value <= 1 ? value : 3 - value;
        }

        const finalFreq = freq * (j + 1);
        const overtonesTotal = overtoneVolumes.length;
        const overtoneVolume = overtoneVolumes[j];
        data[i] += getTriangleSignalValue(finalFreq) * ((overtoneVolume / 100) / overtonesTotal);
      }
    }

    return data;
  }
  square(params: DataHandlerParams): Float32Array<ArrayBuffer> {
    const { data, sampleRate, freq, overtoneVolumes } = params;

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < overtoneVolumes.length; j++) {
        function getSquareSignalValue(freq: number): number {
          const period = sampleRate / freq;
          const dutyCycle = params.dutyCycle || 0.5;
          const cyclePosition = i % period;
          return cyclePosition < (period * dutyCycle) ? 1 : -1;
        }

        const finalFreq = freq * (j + 1);
        const overtonesTotal = overtoneVolumes.length;
        const overtoneVolume = overtoneVolumes[j];
        data[i] += getSquareSignalValue(finalFreq) * ((overtoneVolume / 100) / overtonesTotal);
      }
    }
    return data;
  }
  sawtooth(params: DataHandlerParams): Float32Array<ArrayBuffer> {
    const { data, sampleRate, freq, overtoneVolumes } = params;

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < overtoneVolumes.length; j++) {
        function getSawtoothSignalValue(freq: number): number {
          const period = sampleRate / freq;
          const cyclePosition = i % period;
          return (cyclePosition / period) * 2 - 1;
        }

        const finalFreq = freq * (j + 1);

        const overtonesTotal = overtoneVolumes.length;
        const overtoneVolume = overtoneVolumes[j];
        data[i] += getSawtoothSignalValue(finalFreq) * ((overtoneVolume / 100) / overtonesTotal);
      }
    }
    return data;
  }
  noise(params: DataHandlerParams): Float32Array<ArrayBuffer> {
    const { data } = params;
    
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    return data;
  }
}

export function PolyphonicContent() {

  const [playingNode, setPlayingNode] = useState<AudioBufferSourceNode | null>(null);
  const [waveType, setWaveType] = useState<WaveType>(WaveType.sine);
  const [frequency, setFrequency] = useState('440');
  const [dutyCyclePercent, setDutyCyclePercent] = useState(50);

  const [overtoneVolumes, setOvertoneVolumes] = useState<number[]>([]);

  const onFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrequency(e.target.value);
  };

  const onAddOvertone = useCallback(() => {
    setOvertoneVolumes([...overtoneVolumes, 100]);
  }, [overtoneVolumes]);

  const onRemoveOvertone = useCallback(() => {
    const index = overtoneVolumes.length - 1;
    setOvertoneVolumes(overtoneVolumes.filter((_, i) => i !== index));
  }, [overtoneVolumes]);

  const onOvertoneVolumeChange = useCallback((index: number, value: number) => {
    const newOvertoneVolumes = [...overtoneVolumes];
    newOvertoneVolumes[index] = value;
    setOvertoneVolumes(newOvertoneVolumes);
  }, [overtoneVolumes]);

  const handlePlay = (dataHandler: SoundDataHandler) => {
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

    data.set(dataHandler({ data, sampleRate, freq, dutyCycle: dutyCyclePercent / 100, overtoneVolumes }));

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

  const getSelectedDataHandler = useCallback(() => {
    const soundDataHandlers = new SoundDataHandlers();
    
    switch (waveType) {
      case WaveType.sine:
        return soundDataHandlers.sine;
      case WaveType.noise:
        return soundDataHandlers.noise;
      case WaveType.triangle:
        return soundDataHandlers.triangle;
      case WaveType.square:
        return soundDataHandlers.square;
      case WaveType.sawtooth:
        return soundDataHandlers.sawtooth;
    }
  }, [waveType]);

  return (
    <ContentContainer>
      <RadioGroup
        sx={{
          width: '100%',
        }}
        defaultValue={WaveType.sine}
        onChange={(_, value) => setWaveType(value as WaveType)}
      >
        <FormControlLabel value={WaveType.sine} control={<Radio />} label="Sine" />
        <FormControlLabel value={WaveType.sawtooth} control={<Radio />} label="Sawtooth" />
        <FormControlLabel value={WaveType.triangle} control={<Radio />} label="Triangle" />
        <FormControlLabel value={WaveType.square} control={<Radio />} label="Square" />
        <FormControlLabel value={WaveType.noise} control={<Radio />} label="Noise" />
      </RadioGroup>
      {waveType === WaveType.square && (
        <FormRow>
          <FormLabel>Duty Cycle</FormLabel>
          <Slider
            value={dutyCyclePercent}
            onChange={(_, value) => setDutyCyclePercent(value)}
          />
        </FormRow>
      )}
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
        <FormLabel>Overtone Volumes</FormLabel>
        {overtoneVolumes.map((volume, index) => (
          <FormRow>
            <FormLabel>Overtone {index + 1}</FormLabel>
            <Slider
              key={index}
              value={volume}
              onChange={(_, value) => onOvertoneVolumeChange(index, value)}
            />
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
        onClick={() => handlePlay(getSelectedDataHandler())}
        >
          Play
        </Button>
      }
    </ContentContainer>
  );
}