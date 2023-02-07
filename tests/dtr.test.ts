import { compressRecording, deCompressRecording } from '../src/logic/dtr';
import type { RecordingData } from '../src/logic/dtr';

import { test, expect } from '@jest/globals';

describe('end-to-end recording compression', () => {
  test('reflects basic message array', () => {
    const testArr: RecordingData = [
      {
        time: 1,
        title: 'chat',
        from: 'penis',
        data: { text: 'Hello I am penis.,', time: 1234 },
      },
      {
        time: 1,
        title: 'chat',
        from: 'penis',
        data: { text: 'Hello I am penis.,', time: 1234 },
      },
      {
        time: 3,
        title: 'frame-update',
        from: 'penis',
        data: {
          id: 'asdfljh',
          line: {
            points: [
              {
                x: 1,
                y: 2,
              },
              {
                x: 1,
                y: 2,
              },
              {
                x: 1,
                y: 2,
              },
              {
                x: 1,
                y: 2,
              },
            ],
            opts: { width: 1, color: '#123' },
          },
        },
      },
    ];

    const opts = {
      width: 5,
      height: 5,
      bgColor: '#ffffff',
    };

    const bytes = compressRecording(testArr, opts);

    console.log(
      `JSON compression ratio = ${(
        JSON.stringify([opts, ...testArr]).length / bytes.length
      ).toFixed(1)}`
    );

    const res = deCompressRecording(bytes);

    expect(res.data).toEqual(testArr);
    expect(res.opts).toEqual(opts);
  });
});
