import { Button, FormControlLabel, FormLabel, Radio, RadioGroup, Slider, TextField } from '@mui/material';
import { useCallback, useState } from 'react';

import { WaveType, type DataHandlerParams, type ISoundDataHandlers, type SoundDataHandler } from './MonophonicContent.types';
import { ContentContainer, FormRow } from '../Content';

class SoundDataHandlers implements ISoundDataHandlers {
  sine(params: DataHandlerParams): Float32Array<ArrayBuffer> {
    const { data, sampleRate, freq } = params;
    
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * freq * i / sampleRate);
    }

    return data;
  }
  triangle(params: DataHandlerParams): Float32Array<ArrayBuffer> {
    const { data, sampleRate, freq } = params;
    const period = sampleRate / freq;
    
    for (let i = 0; i < data.length; i++) {
      const cyclePosition = i % period;
      const value = (cyclePosition / period) * 4 - 1;
      data[i] = value <= 1 ? value : 3 - value;
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
  square(params: DataHandlerParams): Float32Array<ArrayBuffer> {
    const { data, sampleRate, freq } = params;
    const dutyCycle = params.dutyCycle || 0.5;
    const period = sampleRate / freq;
    
    for (let i = 0; i < data.length; i++) {
      const cyclePosition = i % period;
      data[i] = cyclePosition < period * dutyCycle ? 1 : -1;
    }

    return data;
  }
  sawtooth(params: DataHandlerParams): Float32Array<ArrayBuffer> {
    const { data, sampleRate, freq } = params;
    const period = sampleRate / freq;
    
    for (let i = 0; i < data.length; i++) {
      const cyclePosition = i % period;
      data[i] = (cyclePosition / period) * 2 - 1;
    }

    return data;
  }
}

export function MonophonicContent() {

  const [playingNode, setPlayingNode] = useState<AudioBufferSourceNode | null>(null);
  const [waveType, setWaveType] = useState<WaveType>(WaveType.sine);
  const [frequency, setFrequency] = useState('440');
  const [dutyCyclePercent, setDutyCyclePercent] = useState(50);

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

    data.set(dataHandler({ data, sampleRate, freq, dutyCycle: dutyCyclePercent / 100 }));

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

  const onFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrequency(e.target.value);
  };

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
      {waveType === WaveType.square && (
        <FormRow>
          <FormLabel>Duty Cycle</FormLabel>
          <Slider
            value={dutyCyclePercent}
            onChange={(_, value) => setDutyCyclePercent(value)}
          />
        </FormRow>
      )}
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