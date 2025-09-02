import { Button, FormControlLabel, FormLabel, Radio, RadioGroup, Slider, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useCallback, useState } from "react";

import { ContentContainer, FormRow, WaveType } from "../Content";
import { ModulateType, type DataHandlerParams, type ISoundDataHandlers, type SoundDataHandler } from "./ModulatedContent.types";
import { ModulatedAmplitudeWrapper } from "./ModulatedContent.styles";

class SoundDataHandlers implements ISoundDataHandlers {
  private carrierFreq = 440;
  private getCarrierSignalValue(params: DataHandlerParams, i: number, modulationArgTerm?: number): number {
    const { sampleRate } = params;
    const freq = this.carrierFreq;

    // Sine wave
    return Math.sin(2 * Math.PI * freq * i / sampleRate + (modulationArgTerm ?? 0));
  }
  sine(params: DataHandlerParams) {
    const { data, sampleRate, modulateType, modulatingFreq, modulatingAmplitude } = params;

    for (let i = 0; i < data.length; i++) {
      const modulatingSignalValue = Math.sin(2 * Math.PI * modulatingFreq * i / sampleRate);

      if (modulateType === ModulateType.amplitude) {
        const carrierSignalValue = this.getCarrierSignalValue(params, i);
        data[i] = carrierSignalValue * (1 + (modulatingSignalValue * modulatingAmplitude * 0.5));
      } else if (modulateType === ModulateType.frequency) {
        const modulationArgTerm = modulatingSignalValue * modulatingAmplitude * this.carrierFreq * 0.5;

        data[i] = this.getCarrierSignalValue(params, i, modulationArgTerm);
      }
    }

    return data;
  }
  triangle(params: DataHandlerParams) {
    const { data, sampleRate, modulateType, modulatingFreq, modulatingAmplitude } = params;

    for (let i = 0; i < data.length; i++) {
      const period = sampleRate / modulatingFreq;
      const cyclePosition = i % period;
      const value = (cyclePosition / period) * 4 - 1;

      const modulatingSignalValue = value <= 1 ? value : 3 - value

      if (modulateType === ModulateType.amplitude) {
        const carrierSignalValue = this.getCarrierSignalValue(params, i);
        data[i] = carrierSignalValue * (1 + (modulatingSignalValue * modulatingAmplitude * 0.5));
      } else if (modulateType === ModulateType.frequency) {
        const modulationArgTerm = modulatingSignalValue * modulatingAmplitude * this.carrierFreq * 0.5;

        data[i] = this.getCarrierSignalValue(params, i, modulationArgTerm);
      }
    }

    return data;
  }
  sawtooth(params: DataHandlerParams) {
    const { data, sampleRate, modulateType, modulatingFreq, modulatingAmplitude } = params;

    for (let i = 0; i < data.length; i++) {
      const period = sampleRate / modulatingFreq;
      const cyclePosition = i % period;
      const modulatingSignalValue = (cyclePosition / period) * 2 - 1;
      if (modulateType === ModulateType.amplitude) {
        const carrierSignalValue = this.getCarrierSignalValue(params, i);
        data[i] = carrierSignalValue * (1 + (modulatingSignalValue * modulatingAmplitude * 0.5));
      } else if (modulateType === ModulateType.frequency) {
        const modulationArgTerm = modulatingSignalValue * modulatingAmplitude * this.carrierFreq * 0.5;

        data[i] = this.getCarrierSignalValue(params, i, modulationArgTerm);
      }
    }

    return data;
  }
  square(params: DataHandlerParams) {
    const { data, sampleRate, modulateType, modulatingFreq, modulatingAmplitude } = params;

    const dutyCycle = params.dutyCycle ?? 0.5;

    for (let i = 0; i < data.length; i++) {
      const period = sampleRate / modulatingFreq;
      const cyclePosition = i % period;
      const modulatingSignalValue = cyclePosition < (period * dutyCycle) ? 1 : -1;

      if (modulateType === ModulateType.amplitude) {
        const carrierSignalValue = this.getCarrierSignalValue(params, i);
        data[i] = carrierSignalValue * (1 + (modulatingSignalValue * modulatingAmplitude * 0.5));
      } else if (modulateType === ModulateType.frequency) {
        const modulationArgTerm = modulatingSignalValue * modulatingAmplitude * this.carrierFreq * 0.5;

        data[i] = this.getCarrierSignalValue(params, i, modulationArgTerm);
      }
    }

    return data;
  }
}

export function ModulatedContent() {
  const [playingNode, setPlayingNode] = useState<AudioBufferSourceNode | null>(null);
  const [waveType, setWaveType] = useState<WaveType>(WaveType.sine);
  const [frequency, setFrequency] = useState('2');
  const [dutyCyclePercent, setDutyCyclePercent] = useState(50);
  const [modulatedAmplitudePercent, setModulatedAmplitudePercent] = useState(50);
  const [modulateType, setModulateType] = useState<ModulateType>(ModulateType.amplitude);

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

    data.set(dataHandler({
      data,
      sampleRate,
      modulatingFreq: freq,
      dutyCycle: dutyCyclePercent / 100,
      modulateType,
      modulatingAmplitude: modulatedAmplitudePercent / 100,
    }));

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


  const onFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrequency(e.target.value);
  };

  const onChangeWaveType = (_: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setWaveType(value as WaveType);
  }

  const onChangeDutyCycle = (_: Event, value: number) => {
    setDutyCyclePercent(value);
  }

  const onChangeModulatedAmplitude = (_: Event, value: number) => {
    setModulatedAmplitudePercent(value);
  }

  const onChangeModulateType = (_: React.MouseEvent<HTMLElement, MouseEvent>, value: ModulateType) => {
    if (value === null) return;
    setModulateType(value as ModulateType);
  }

  const getSelectedDataHandler = (): SoundDataHandler => {
    const handlers = new SoundDataHandlers();
    switch (waveType) {
      case WaveType.sine:
        return handlers.sine.bind(handlers);
      case WaveType.triangle:
        return handlers.triangle.bind(handlers);
      case WaveType.square:
        return handlers.square.bind(handlers);
      case WaveType.sawtooth:
        return handlers.sawtooth.bind(handlers);
      default:
        return handlers.sine.bind(handlers);
    }
  }

  return (
    <ContentContainer>
      <ToggleButtonGroup
        value={modulateType}
        onChange={onChangeModulateType}
        exclusive
        sx={{ width: '100%' }}
      >
        <ToggleButton
          value={ModulateType.amplitude}
          sx={{ flex: 1 }}
        >
          Amplitude
        </ToggleButton>
        <ToggleButton
          value={ModulateType.frequency}
          sx={{ flex: 1 }}
        >
          Frequency
        </ToggleButton>
      </ToggleButtonGroup>
      <FormRow>
        <FormLabel>Modulating Wave Type</FormLabel>
        <RadioGroup
          sx={{
            width: '100%',
          }}
          defaultValue={WaveType.sine}
          onChange={onChangeWaveType}
        >
          <FormControlLabel value={WaveType.sine} control={<Radio />} label="Sine" />
          <FormControlLabel value={WaveType.sawtooth} control={<Radio />} label="Sawtooth" />
          <FormControlLabel value={WaveType.triangle} control={<Radio />} label="Triangle" />
          <FormControlLabel value={WaveType.square} control={<Radio />} label="Square" />
        </RadioGroup>
      </FormRow>

      <TextField
        variant="outlined"
        label="Modulating Wave Frequency (Hz)"
        type="number"
        value={frequency}
        onChange={onFrequencyChange}
        slotProps={{
          htmlInput: { min: 0, max: 10000 },
        }}
        sx={{ width: '100%' }}
      />
      <FormRow>
        <FormLabel>Modulating Wave Amplitude</FormLabel>
        <ModulatedAmplitudeWrapper>
          <FormLabel>0%</FormLabel>
          <Slider
            value={modulatedAmplitudePercent}
            onChange={onChangeModulatedAmplitude}
          />
          <FormLabel>100%</FormLabel>
        </ModulatedAmplitudeWrapper>

      </FormRow>
      {waveType === WaveType.square && (
        <FormRow>
          <FormLabel>Duty Cycle</FormLabel>
          <Slider
            value={dutyCyclePercent}
            onChange={onChangeDutyCycle}
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