import {writable} from 'svelte/store';
import type {Connection, MessageEmitter} from './connection';
import type {LineOpts} from './line';
import type {FrameData} from './message';

let connection: Connection;

export function setConnection(c: Connection) {
  connection = c;
}

export function getConnection() {
  if (!connection) {
    throw new Error('Connection not set! Should never happen');
  }
  return connection;
}

let emitter: MessageEmitter;

export function setEmitter(e: MessageEmitter) {
  emitter = e;
}

export function getEmitter(): MessageEmitter {
  if (!emitter) {
    if (!connection) {
      throw new Error('Connection not set! Should never happen');
    }
    return connection;
  }
  return emitter;
}

export let drawing = writable<boolean>(false);

export function setDrawing(s: boolean) {
  drawing.set(s);
}

export let lineOpts = writable<LineOpts>({
  color: '#000000',
  width: 5,
});

export function setLineOpts(callback: (arg1: LineOpts) => LineOpts) {
  lineOpts.update(callback);
}

// evil global state
export let canvas = writable<HTMLCanvasElement>();

export let frames = writable<FrameData[]>([]);
