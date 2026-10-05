import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildResult } from '../../src/domain/buildResult.ts';
import { prepareOptions } from '../../src/domain/options.ts';

describe('buildResult', () => {
  it('既定は7桁の数字だけ', () => {
    assert.deepEqual(
      buildResult(
        '〒123-4567 東京都',
        { digits: '1234567', unmatched: '東京都' },
        prepareOptions(undefined),
      ),
      {
        input: '〒123-4567 東京都',
        postalCode: '1234567',
        unmatched: '東京都',
      },
    );
  });
  it('hyphen なら 3桁目と4桁目の間にハイフン', () => {
    assert.equal(
      buildResult(
        '1234567',
        { digits: '1234567', unmatched: '' },
        prepareOptions({ hyphen: true }),
      ).postalCode,
      '123-4567',
    );
  });
  it('読めなければ postalCode は null', () => {
    assert.deepEqual(
      buildResult(
        '123-456',
        { digits: null, unmatched: '123-456' },
        prepareOptions({ hyphen: true }),
      ),
      { input: '123-456', postalCode: null, unmatched: '123-456' },
    );
  });
  it('入れたハイフンにも字形の指定をかける', () => {
    assert.equal(
      buildResult(
        '1234567',
        { digits: '1234567', unmatched: '' },
        prepareOptions({
          hyphen: true,
          style: { default: { digit: 'full', symbol: 'full' } },
        }),
      ).postalCode,
      '１２３－４５６７',
    );
  });
  it('項目ごとに字形の指定をかける', () => {
    const result = buildResult(
      '1234567 A1',
      { digits: '1234567', unmatched: 'A1' },
      prepareOptions({
        style: { fields: { unmatched: { alpha: 'full', digit: 'full' } } },
      }),
    );
    assert.equal(result.postalCode, '1234567');
    assert.equal(result.unmatched, 'Ａ１');
  });
});
