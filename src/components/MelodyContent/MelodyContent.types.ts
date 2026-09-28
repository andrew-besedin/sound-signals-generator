export interface Note {
  name: string;
  freq: number;
  beats: number;
}

export interface DataHandlerParams {
  data: Float32Array<ArrayBuffer>;
  sampleRate: number;
  notes: Note[];
  beatDuration: number;
}

export type SoundDataHandler = (params: DataHandlerParams) => Float32Array<ArrayBuffer>;
