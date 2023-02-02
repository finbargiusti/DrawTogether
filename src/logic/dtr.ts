/**
 * DTR (DrawTogether Recording)
 */

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

// https://stackoverflow.com/a/69724226
function integerToBytes(number: number) {
  const len = Math.ceil(Math.log2(number) / 8);
  const byteArray = new Uint8Array(len);

  for (let index = 0; index < byteArray.length; index++) {
    const byte = number & 0xff;
    byteArray[index] = byte;
    number = (number - byte) / 256;
  }

  return byteArray;
}

export function stringToBytes(str: string) {
  const te = new TextEncoder();

  return te.encode(str);
}

export function bytesToString(bytes: Uint8Array) {
  const td = new TextDecoder();

  return td.decode(bytes);
}

function concatArrays(a: Uint8Array, b: Uint8Array) {
  const res = new Uint8Array(a.length + b.length);
  res.set(a, 0);
  res.set(b, a.length);
  return res;
}

// helper function for concatting arrays
function cc(a1: Uint8Array, ...arrs: Uint8Array[]) {
  let res = a1;

  arrs.forEach((a) => (res = concatArrays(res, a)));

  return res;
}

function prependLen(arr: Uint8Array) {
  const len = integerToBytes(arr.length);
  if (len.length > 1) throw new Error('fuck');
  return concatArrays(len, arr);
}

function encodeChat({
  time,
  data,
  from,
}: RecordingDataItem<'chat'>): Uint8Array {
  const timeBytes = prependLen(integerToBytes(data.time));
  const fromBytes = prependLen(stringToBytes(data.from ?? from));
  const textBytes = prependLen(stringToBytes(data.text ?? from));
  return cc(timeBytes, fromBytes, textBytes);
}

export function compressRecording(data: RecordingData): Uint8Array {
  // TODO: serialize more efficiently;
  const data_string = JSON.stringify(data); // Very naive approach

  return deflate(data_string);
}

export function deCompressRecording(data: Uint8Array) {
  const data_string = inflate(data, { to: 'string' });
  return JSON.parse(data_string) as RecordingData; // Assert this is correct.
}
