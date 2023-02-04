/**
 * DTR (DrawTogether Recording)
 */

import { Packr, unpack } from 'msgpackr';
import type { MessageData, MessageObject, MessageTitle } from './message';

import { deflate, inflate } from 'pako';

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

let packr = new Packr();

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

/**
 * Returns true if data is valid `RecordingData`
 * @param data
 * @returns data is `RecordingData`
 */
function isValidData(data: unknown): data is RecordingData {
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

export function compressRecording(data: RecordingData): Uint8Array {
  return deflate(packr.pack(data));
}

export function deCompressRecording(data: Uint8Array) {
  const inflated = inflate(data);

  const unpacked_data = packr.unpack(inflated);

  if (!isValidData(unpacked_data)) throw new Error('Corrupted data!');

  return unpacked_data;
}
