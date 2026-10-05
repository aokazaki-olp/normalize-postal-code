/**
 * index.ts
 *
 * @description 郵便番号の正規化器の公開面
 */

import { createPostalCodeNormalizer } from './application/postalCodeNormalizer.ts';
import type {
  PostalCodeNormalizer as Normalizer,
  PostalCodeNormalizerFactory,
} from './ports/postalCodeNormalizer.ts';

/** 郵便番号の正規化器（normalize で郵便番号を正規化する） */
export type PostalCodeNormalizer = Normalizer;

/** 郵便番号の正規化器を作る（PostalCodeNormalizer.create） */
export const PostalCodeNormalizer: PostalCodeNormalizerFactory = {
  create: createPostalCodeNormalizer,
};

export type {
  PostalCodeNormalizerOptions,
  PostalCodeResult,
  PostalCodeStyle,
} from './ports/postalCodeResult.ts';
export type {
  CharStyle,
  CharTarget,
  WidthMode,
} from '@arihirookazaki/normalize-core';
