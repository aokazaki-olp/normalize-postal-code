import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createPostalCodeNormalizer } from '../../src/application/postalCodeNormalizer.ts';

describe('createPostalCodeNormalizer', () => {
  const normalizer = createPostalCodeNormalizer();

  describe('設計文書の例', () => {
    const cases: [string, string | null][] = [
      ['123-4567', '1234567'],
      ['〒１２３－４５６７', '1234567'],
      ['郵便番号：〒123 4567', '1234567'],
      ['〶123-4567', '1234567'],
      ['〒123-4567 東京都千代田区', '1234567'],
      ['〒123-4567 東京都千代田区1-1', null],
      ['1丁目2番3号4567', null],
      ['123-456', null],
    ];
    for (const [input, postalCode] of cases) {
      it(input, async () => {
        assert.deepEqual(await normalizer.normalize(input), {
          input,
          postalCode,
        });
      });
    }
  });

  it('全角の横棒（ー）の区切りも読む', async () => {
    assert.equal(
      (await normalizer.normalize('１２３ー４５６７')).postalCode,
      '1234567',
    );
  });

  it('hyphen と字形の指定', async () => {
    const full = createPostalCodeNormalizer({
      hyphen: true,
      style: { default: { digit: 'full', symbol: 'full' } },
    });
    assert.equal(
      (await full.normalize('〒123 4567')).postalCode,
      '１２３－４５６７',
    );
  });

  it('input が文字列でなければ拒否する', async () => {
    await assert.rejects(
      normalizer.normalize(1234567 as unknown as string),
      TypeError,
    );
  });

  it('options が検査を満たさなければ作るときに投げる', () => {
    assert.throws(
      () => createPostalCodeNormalizer({ hyphen: 1 as unknown as boolean }),
      TypeError,
    );
  });
});
