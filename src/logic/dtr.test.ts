import { compressRecording, deCompressRecording } from './dtr';
import type { RecordingData } from './dtr';

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
        time: 1,
        title: 'chat',
        from: 'penis',
        data: { text: 'Hello I am penis.,', time: 1234 },
      },
    ];

    const res = compressRecording(testArr);

    console.log(`JSON size: ${JSON.stringify(testArr).length}`);
    console.log(`Res size: ${res.length}`);

    const decom = deCompressRecording(res);

    expect(decom).toEqual(testArr);
  });
});
