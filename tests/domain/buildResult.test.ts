import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildResult } from '../../src/domain/buildResult.ts';
import { prepareOptions } from '../../src/domain/options.ts';

describe('buildResult', () => {
  it('既定は7桁の数字だけ', () => {
    assert.deepEqual(
      buildResult('〒123-4567', '1234567', prepareOptions(undefined)),
      { input: '〒123-4567', postalCode: '1234567' },
    );
  });
  it('hyphen なら 3桁目と4桁目の間にハイフン', () => {
    assert.equal(
      buildResult('1234567', '1234567', prepareOptions({ hyphen: true }))
        .postalCode,
      '123-4567',
    );
  });
  it('読めなければ postalCode は null', () => {
    assert.deepEqual(
      buildResult('123-456', null, prepareOptions({ hyphen: true })),
      { input: '123-456', postalCode: null },
    );
  });
  it('入れたハイフンにも字形の指定をかける', () => {
    assert.equal(
      buildResult(
        '1234567',
        '1234567',
        prepareOptions({
          hyphen: true,
          style: { default: { digit: 'full', symbol: 'full' } },
        }),
      ).postalCode,
      '１２３－４５６７',
    );
  });
  it('項目の指定が false なら字形の指定をかけない', () => {
    assert.equal(
      buildResult(
        '1234567',
        '1234567',
        prepareOptions({
          style: { default: { digit: 'full' }, fields: { postalCode: false } },
        }),
      ).postalCode,
      '1234567',
    );
  });
});
