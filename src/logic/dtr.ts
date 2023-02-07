/**
 * DTR (DrawTogether Recording)
 */

import { encode, decode } from '@msgpack/msgpack';
import type { MessageData } from './message';

import { deflate, inflate } from 'pako';
import type { CanvasOptions } from './canvas';

export const RECORDABLE_MESSAGE_TITLES = ['frame-update', 'chat'] as const;

export type RecordableMessageTitle = typeof RECORDABLE_MESSAGE_TITLES[number];

export type RecordingDataItem<T extends RecordableMessageTitle> = {
  time: number;
  title: T;
  data: MessageData<T>;
  from: string;
};

export type RecordingData = RecordingDataItem<RecordableMessageTitle>[];

// dtr coding

function isObject(data: unknown): data is Object {
  return typeof data == 'object' && data !== null && !Array.isArray(data);
}

function isValidMessageTitle(data: string): data is RecordableMessageTitle {
  return data == 'chat' || data == 'frame-update';
}

/**
 * Returns true if the data passed is a valid MessageData
 * @param title
 * @param data
 * @returns data is `MessageData<title>`
 */
function isValidDataObject<T extends RecordableMessageTitle>(
  title: T,
  data: unknown
): data is MessageData<T> {
  if (!isObject(data)) return false;

  switch (title) {
    case 'chat':
      if (!('text' in data) || !('time' in data)) return false;

      if (typeof data.text !== 'string' || typeof data.time !== 'number')
        return false;

      break;

    case 'frame-update':
      if (!('id' in data) || !('line' in data)) return false;

      if (typeof data.id !== 'string' || !isObject(data.line)) return false;

      if (!('points' in data.line) || !('opts' in data.line)) return false;

      if (!Array.isArray(data.line.points)) return false;

      // check validity of point array
      if (
        data.line.points.some((v) => {
          if (!isObject(v)) return true;

          if (!('x' in v) || !('y' in v)) return true;

          if (typeof v.x !== 'number' || typeof v.y !== 'number') return true;
        })
      )
        return false;

      if (!isObject(data.line.opts)) return false;

      if (!('width' in data.line.opts) || !('color' in data.line.opts))
        return false;

      if (
        typeof data.line.opts.width !== 'number' ||
        typeof data.line.opts.color !== 'string'
      )
        return false;

      break;
  }
  return true;
}

function isCanvasOptions(data: unknown): data is CanvasOptions {
  if (!isObject(data)) return false;

  if (!('height' in data) || !('width' in data) || !('bgColor' in data))
    return false;

  if (
    typeof data.height !== 'number' ||
    typeof data.width !== 'number' ||
    typeof data.bgColor !== 'string'
  )
    return false;

  return true;
}

/**
 * Returns true if data is valid `RecordingData`
 * @param data
 * @returns data is `RecordingData`
 */
function isValidData(data: unknown): data is [CanvasOptions, ...RecordingData] {
  // this signature is some wild typescript magic
  if (!Array.isArray(data)) {
    return false;
  }

  for (let i = 0; i < data.length; i++) {
    const obj: unknown = data[i];

    if (!isObject(obj)) return false;

    // check if object has correct properties
    if (
      !('time' in obj) ||
      !('title' in obj) ||
      !('data' in obj) ||
      !('from' in obj)
    )
      return false;

    // check proprties are of the right type

    if (typeof obj.time !== 'number') return false;
    if (typeof obj.from !== 'string') return false;
    if (typeof obj.title !== 'string') return false;

    if (!isValidMessageTitle(obj.title)) return false;

    if (!isValidDataObject(obj.title, obj.data)) return false;
  }

  return true;
}

type MinimisedData = {
  1: [string, number, string, number, string]; // from, time, text, innerTime, innerFrom
  2: [string, number, string, string, number, ...[number, number][]]; // from, time, id, opts.color (minus #), opts.width, points
  /*  We do not need from in lines for now. */
};

type MinimisedMessage<T extends 1 | 2> = [T, MinimisedData[T]];

// this is fucked up
function minimise(data: RecordingData): MinimisedMessage<1 | 2>[] {
  return data.map((i) => {
    if (i.title == 'chat') {
      const c = i as RecordingDataItem<'chat'>;
      return [1, [c.from, c.time, c.data.text, c.data.time, c.data.from]];
    }
    const f = i as RecordingDataItem<'frame-update'>;
    return [
      2,
      [
        f.from,
        f.time,
        f.data.id,
        f.data.line.opts.color.slice(1),
        f.data.line.opts.width,
        ...f.data.line.points.map(({ x, y }) => [x, y] as [number, number]),
      ],
    ];
  });
}

// TODO: message quality verifier
// ! This is a mess.
function maximise(data: MinimisedMessage<1 | 2>[]): RecordingData {
  return data.map((m) => {
    if (m[0] == 1) {
      const m1 = m[1] as MinimisedData[1];
      const [from, time, text, innerTime, innerfrom] = m1;
      return {
        title: 'chat',
        data: {
          text,
          time: innerTime,
          from: innerfrom ?? undefined,
        },
        from,
        time,
      };
    }
    const m1 = m[1] as MinimisedData[2];
    const [from, time, id, color, width, ...points] = m1;
    return {
      title: 'frame-update',
      time,
      from,
      data: {
        id,
        line: {
          opts: {
            color: ('#' + color) as `#${string}`,
            width,
          },
          points: points.map(([x, y]) => ({ x, y })),
        },
      },
    };
  });
}

export function compressRecording(
  data: RecordingData,
  opts: CanvasOptions
): Uint8Array {
  return deflate(encode([opts, ...minimise(data)]));
}

export function deCompressRecording(data: ArrayBuffer) {
  const inflated = inflate(data);

  const unpacked_data = decode(inflated);

  if (!Array.isArray(unpacked_data)) {
    throw new Error();
  }

  const [opts, ...rest] = unpacked_data;

  if (!isCanvasOptions(opts)) throw new Error();

  const maximised = maximise(rest);

  if (!isValidData(maximised)) throw new Error('Corrupted data!');

  return {
    opts,
    data: maximised,
  };
}
