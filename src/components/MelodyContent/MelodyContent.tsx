import { Button } from "@mui/material";
import { useCallback, useState } from "react";

import { ContentContainer } from "../Content";
import type { DataHandlerParams, Note } from "./MelodyContent.types";

const G4 = 392.00;
const A4 = 440.00;
const B4 = 493.88;
const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;
const F5 = 698.46;
const G5 = 783.99;

const happyBirthday: Note[] = [
  { name: 'G4', freq: G4, beats: 0.75 },
  { name: 'G4', freq: G4, beats: 0.25 },
  { name: 'A4', freq: A4, beats: 1 },
  { name: 'G4', freq: G4, beats: 1 },
  { name: 'C5', freq: C5, beats: 1 },
  { name: 'B4', freq: B4, beats: 2 },

  { name: 'G4', freq: G4, beats: 0.75 },
  { name: 'G4', freq: G4, beats: 0.25 },
  { name: 'A4', freq: A4, beats: 1 },
  { name: 'G4', freq: G4, beats: 1 },
  { name: 'D5', freq: D5, beats: 1 },
  { name: 'C5', freq: C5, beats: 2 },

  { name: 'G4', freq: G4, beats: 0.75 },
  { name: 'G4', freq: G4, beats: 0.25 },
  { name: 'G5', freq: G5, beats: 1 },
  { name: 'E5', freq: E5, beats: 1 },
  { name: 'C5', freq: C5, beats: 1 },
  { name: 'B4', freq: B4, beats: 1 },
  { name: 'A4', freq: A4, beats: 1 },

  { name: 'F5', freq: F5, beats: 0.75 },
  { name: 'F5', freq: F5, beats: 0.25 },
  { name: 'E5', freq: E5, beats: 1 },
  { name: 'C5', freq: C5, beats: 1 },
  { name: 'D5', freq: D5, beats: 1 },
  { name: 'C5', freq: C5, beats: 3 },
];

const tempoBpm = 120;
const gapDuration = 0.03;
const rampDuration = 0.01;

function getNoteLength(note: Note, beatDuration: number, sampleRate: number): number {
  return Math.round(note.beats * beatDuration * sampleRate);
}

function getEnvelopeValue(i: number, length: number, sampleRate: number): number {
  const rampLength = Math.min(Math.round(rampDuration * sampleRate), Math.floor(length / 2));

  if (rampLength <= 0) return 1;
  if (i < rampLength) return i / rampLength;
  if (i >= length - rampLength) return (length - i) / rampLength;

  return 1;
}

function fillSoundData({ data, sampleRate, notes, beatDuration }: DataHandlerParams): Float32Array<ArrayBuffer> {
  let offset = 0;

  for (const note of notes) {
    const noteLength = getNoteLength(note, beatDuration, sampleRate);
    const gapLength = Math.min(Math.round(gapDuration * sampleRate), Math.floor(noteLength / 2));
    const soundLength = noteLength - gapLength;

    let phase = 0;

    for (let i = 0; i < soundLength && offset + i < data.length; i++) {
      phase = (phase + note.freq / sampleRate) % 1;

      data[offset + i] = Math.sin(2 * Math.PI * phase) * getEnvelopeValue(i, soundLength, sampleRate);
    }

    offset += noteLength;
  }

  return data;
}

export function MelodyContent() {
  const [playingNode, setPlayingNode] = useState<AudioBufferSourceNode | null>(null);

  const handlePlay = () => {
    if (playingNode) {
      playingNode.stop();
      setPlayingNode(null);
    }

    const ctx = new AudioContext();

    const sampleRate = ctx.sampleRate;
    const beatDuration = 60 / tempoBpm;

    const totalLength = happyBirthday.reduce(
      (sum, note) => sum + getNoteLength(note, beatDuration, sampleRate),
      0,
    );

    const buffer = ctx.createBuffer(1, totalLength, sampleRate);
    const data = buffer.getChannelData(0);

    data.set(fillSoundData({ data, sampleRate, notes: happyBirthday, beatDuration }));

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => setPlayingNode(null);
    source.start();

    setPlayingNode(source);
  };

  const handleStop = useCallback(() => {
    if (!playingNode) return;

    playingNode.stop();
    setPlayingNode(null);
  }, [playingNode]);

  return (
    <ContentContainer>
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
