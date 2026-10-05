import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as api from '../src/index.ts';
import { PostalCodeNormalizer } from '../src/index.ts';

describe('公開面', () => {
  it('値として公開するのは PostalCodeNormalizer だけ', () => {
    assert.deepEqual(Object.keys(api), ['PostalCodeNormalizer']);
    assert.deepEqual(Object.keys(PostalCodeNormalizer), ['create']);
  });
  it('create で作り、normalize で正規化する', async () => {
    const normalizer = PostalCodeNormalizer.create({ hyphen: true });
    assert.deepEqual(await normalizer.normalize('〒1234567'), {
      input: '〒1234567',
      postalCode: '123-4567',
      unmatched: '',
    });
  });
});
