/**
 * postalCodeNormalizer.ts
 *
 * @description 郵便番号の正規化器の処理の流れ
 */

import { guardedNfkc } from '@arihirookazaki/normalize-core';
import { buildResult } from '../domain/buildResult.ts';
import { prepareOptions } from '../domain/options.ts';
import { readPostalCode } from '../domain/readPostalCode.ts';
import type { PostalCodeNormalizer } from '../ports/postalCodeNormalizer.ts';
import type { PostalCodeNormalizerOptions } from '../ports/postalCodeResult.ts';

/**
 * 郵便番号の正規化器を作る（docs/design.md の「処理の流れ」）
 *
 * @param options - ハイフンの有無と字形の指定
 * @returns 郵便番号の正規化器
 * @throws {TypeError} options が検査を満たさない場合
 */
export const createPostalCodeNormalizer = (
  options?: PostalCodeNormalizerOptions,
): PostalCodeNormalizer => {
  const prepared = prepareOptions(options);
  return {
    // 同期で済むが、系列の正規化器にそろえて Promise を返す。executor の中で投げたものは、住所と同じく拒否された Promise になる
    normalize: (input) =>
      new Promise((resolve) => {
        if (typeof input !== 'string') {
          throw new TypeError('input には string を指定してください');
        }
        resolve(
          buildResult(input, readPostalCode(guardedNfkc(input)), prepared),
        );
      }),
  };
};
