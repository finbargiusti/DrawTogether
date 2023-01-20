import { writable } from 'svelte/store';
import type { Connection } from './connection';

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

export let drawing = writable<boolean>(false);

export function setDrawing(s: boolean) {
  drawing.set(s);
}
