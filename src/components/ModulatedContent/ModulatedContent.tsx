import { Button, FormLabel, MenuItem, Select, Slider, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useCallback, useState } from "react";

import { ContentContainer, FormRow, WaveType } from "../Content";
import { ModulateType, type DataHandlerParams, type ISignalValueHandlers, type SignalValueHandler, type SignalValueParams } from "./ModulatedContent.types";
import { ModulatedAmplitudeWrapper } from "./ModulatedContent.styles";

const waveTypeOptions: { value: WaveType, label: string }[] = [
  { value: WaveType.sine, label: 'Sine' },
  { value: WaveType.sawtooth, label: 'Sawtooth' },
  { value: WaveType.triangle, label: 'Triangle' },
  { value: WaveType.square, label: 'Square' },
];

class SignalValueHandlers implements ISignalValueHandlers {
  sine({ phase }: SignalValueParams): number {
    return Math.sin(2 * Math.PI * phase);
  }
  triangle({ phase }: SignalValueParams): number {
    const value = phase * 4 - 1;

    return value <= 1 ? value : 2 - value;
  }
  square({ phase, dutyCycle }: SignalValueParams): number {
    return phase < dutyCycle ? 1 : -1;
  }
  sawtooth({ phase }: SignalValueParams): number {
    return phase * 2 - 1;
  }
}

const signalValueHandlers = new SignalValueHandlers();

function getSignalValueHandler(waveType: WaveType): SignalValueHandler {
  switch (waveType) {
    case WaveType.triangle:
      return signalValueHandlers.triangle;
    case WaveType.square:
      return signalValueHandlers.square;
    case WaveType.sawtooth:
      return signalValueHandlers.sawtooth;
    default:
      return signalValueHandlers.sine;
  }
}

function fillSoundData(params: DataHandlerParams): Float32Array<ArrayBuffer> {
  const {
    data,
    sampleRate,
    modulateType,
    carrierWaveType,
    carrierFreq,
    carrierDutyCycle,
    modulatingWaveType,
    modulatingFreq,
    modulatingAmplitude,
    modulatingDutyCycle,
  } = params;

  const getCarrierSignalValue = getSignalValueHandler(carrierWaveType);
  const getModulatingSignalValue = getSignalValueHandler(modulatingWaveType);

  const frequencyDeviation = carrierFreq / 2;

  let carrierPhase = 0;

  for (let i = 0; i < data.length; i++) {
    const modulatingPhase = (modulatingFreq * i / sampleRate) % 1;
    const modulatingSignalValue = getModulatingSignalValue({ phase: modulatingPhase, dutyCycle: modulatingDutyCycle });

    const carrierSignalValue = getCarrierSignalValue({ phase: carrierPhase, dutyCycle: carrierDutyCycle });

    if (modulateType === ModulateType.amplitude) {
      data[i] = carrierSignalValue * (0.5 + (modulatingSignalValue * modulatingAmplitude * 0.5));
      carrierPhase = (carrierPhase + carrierFreq / sampleRate) % 1;
    } else {
      const instantFreq = Math.max(
        carrierFreq + modulatingSignalValue * modulatingAmplitude * frequencyDeviation,
        0,
      );

      data[i] = carrierSignalValue;
      carrierPhase = (carrierPhase + instantFreq / sampleRate) % 1;
    }
  }

  return data;
}

export function ModulatedContent() {
  const [playingNode, setPlayingNode] = useState<AudioBufferSourceNode | null>(null);
  const [modulateType, setModulateType] = useState<ModulateType>(ModulateType.amplitude);

  const [carrierWaveType, setCarrierWaveType] = useState<WaveType>(WaveType.sine);
  const [carrierFrequency, setCarrierFrequency] = useState('440');
  const [carrierDutyCyclePercent, setCarrierDutyCyclePercent] = useState(50);

  const [modulatingWaveType, setModulatingWaveType] = useState<WaveType>(WaveType.sine);
  const [modulatingFrequency, setModulatingFrequency] = useState('2');
  const [modulatingDutyCyclePercent, setModulatingDutyCyclePercent] = useState(50);
  const [modulatedAmplitudePercent, setModulatedAmplitudePercent] = useState(50);

  const isValidFrequency = (freq: number) => !Number.isNaN(freq) && freq > 0 && freq <= 10000;

  const handlePlay = () => {
    if (playingNode) {
      playingNode.stop();
      setPlayingNode(null);
    }

    const carrierFreq = Number(carrierFrequency);
    const modulatingFreq = Number(modulatingFrequency);

    if (!isValidFrequency(carrierFreq) || !isValidFrequency(modulatingFreq)) {
      return;
    }

    const ctx = new AudioContext();

    const sampleRate = ctx.sampleRate;
    const duration = 1;

    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    data.set(fillSoundData({
      data,
      sampleRate,
      modulateType,
      carrierWaveType,
      carrierFreq,
      carrierDutyCycle: carrierDutyCyclePercent / 100,
      modulatingWaveType,
      modulatingFreq,
      modulatingAmplitude: modulatedAmplitudePercent / 100,
      modulatingDutyCycle: modulatingDutyCyclePercent / 100,
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

  const onCarrierFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCarrierFrequency(e.target.value);
  };

  const onModulatingFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModulatingFrequency(e.target.value);
  };

  const onChangeCarrierDutyCycle = (_: Event, value: number) => {
    setCarrierDutyCyclePercent(value);
  }

  const onChangeModulatingDutyCycle = (_: Event, value: number) => {
    setModulatingDutyCyclePercent(value);
  }

  const onChangeModulatedAmplitude = (_: Event, value: number) => {
    setModulatedAmplitudePercent(value);
  }

  const onChangeModulateType = (_: React.MouseEvent<HTMLElement, MouseEvent>, value: ModulateType) => {
    if (value === null) return;
    setModulateType(value as ModulateType);
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
        <FormLabel>Carrier Wave Type</FormLabel>
        <Select
          size="small"
          value={carrierWaveType}
          onChange={(e) => setCarrierWaveType(e.target.value as WaveType)}
        >
          {waveTypeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </Select>
      </FormRow>
      <TextField
        variant="outlined"
        label="Carrier Frequency (Hz)"
        type="number"
        value={carrierFrequency}
        onChange={onCarrierFrequencyChange}
        slotProps={{
          htmlInput: { min: 0, max: 10000 },
        }}
        sx={{ width: '100%' }}
      />
      {carrierWaveType === WaveType.square && (
        <FormRow>
          <FormLabel>Carrier Duty Cycle</FormLabel>
          <Slider
            value={carrierDutyCyclePercent}
            onChange={onChangeCarrierDutyCycle}
          />
        </FormRow>
      )}

      <FormRow>
        <FormLabel>Modulating Wave Type</FormLabel>
        <Select
          size="small"
          value={modulatingWaveType}
          onChange={(e) => setModulatingWaveType(e.target.value as WaveType)}
        >
          {waveTypeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </Select>
      </FormRow>
      <TextField
        variant="outlined"
        label="Modulating Wave Frequency (Hz)"
        type="number"
        value={modulatingFrequency}
        onChange={onModulatingFrequencyChange}
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
      {modulatingWaveType === WaveType.square && (
        <FormRow>
          <FormLabel>Modulating Duty Cycle</FormLabel>
          <Slider
            value={modulatingDutyCyclePercent}
            onChange={onChangeModulatingDutyCycle}
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
        onClick={handlePlay}
        >
          Play
        </Button>
      }
    </ContentContainer>
  );
}
