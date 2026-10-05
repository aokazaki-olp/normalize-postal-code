import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareOptions } from '../../src/domain/options.ts';
import type { PostalCodeNormalizerOptions } from '../../src/ports/postalCodeResult.ts';

describe('prepareOptions', () => {
  it('指定が無ければ、どの項目の指定も空で、hyphen は false', () => {
    const prepared = prepareOptions(undefined);
    assert.deepEqual(prepared, prepareOptions({}));
    assert.equal(prepared.hyphen, false);
    assert.deepEqual(prepared.styles, { postalCode: {} });
  });
  it('hyphen を受ける', () => {
    assert.equal(prepareOptions({ hyphen: true }).hyphen, true);
  });
  it('項目ごとの指定を default にマージする', () => {
    const prepared = prepareOptions({
      style: {
        default: { digit: 'full' },
        fields: { postalCode: { symbol: 'full' } },
      },
    });
    assert.deepEqual(prepared.styles.postalCode, {
      digit: 'full',
      symbol: 'full',
    });
  });
  it('項目ごとの指定が false なら当てない', () => {
    const prepared = prepareOptions({
      style: { default: { digit: 'full' }, fields: { postalCode: false } },
    });
    assert.equal(prepared.styles.postalCode, undefined);
  });

  describe('検査を満たさなければ TypeError', () => {
    const cases: [string, unknown][] = [
      ['options が object でない', 'x'],
      ['options が null', null],
      ['options が配列', []],
      ['hyphen が boolean でない', { hyphen: 'true' }],
      ['style が object でない', { style: 1 }],
      ['style.default が object でない', { style: { default: 'full' } }],
      ['style.fields が object でない', { style: { fields: [] } }],
      ['style.fields に無い項目', { style: { fields: { unmatched: {} } } }],
      [
        'style.fields の値が object でも false でもない',
        { style: { fields: { postalCode: true } } },
      ],
      ['字形の指定の値が誤り', { style: { default: { digit: 'wide' } } }],
    ];
    for (const [name, options] of cases) {
      it(name, () => {
        assert.throws(
          () => prepareOptions(options as PostalCodeNormalizerOptions),
          TypeError,
        );
      });
    }
  });
});
