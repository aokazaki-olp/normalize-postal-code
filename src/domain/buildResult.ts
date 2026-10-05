/**
 * buildResult.ts
 *
 * @description 郵便番号の読み取りの結果から、出力を組み立てる
 */

import { applyCharStyle, type CharStyle } from '@arihirookazaki/normalize-core';
import type { PostalCodeResult } from '../ports/postalCodeResult.ts';
import type { PreparedOptions } from './options.ts';
import type { ReadPostalCode } from './readPostalCode.ts';

const styleField = (text: string, style: CharStyle | undefined): string =>
  style === undefined ? text : applyCharStyle(text, style);

/**
 * 出力を組み立てる（docs/design.md の「処理の流れ」の手順4〜6）
 *
 * @param input - 渡された文字列
 * @param read - 郵便番号の読み取りの結果（ガード付き NFKC をかけたテキストから読んだもの）
 * @param options - prepareOptions が検査とマージを済ませたオプション
 * @returns 出力
 */
export const buildResult = (
  input: string,
  read: ReadPostalCode,
  options: PreparedOptions,
): PostalCodeResult => {
  const { digits } = read;
  const postalCode =
    digits === null
      ? null
      : options.hyphen
        ? `${digits.slice(0, 3)}-${digits.slice(3)}`
        : digits;
  return {
    input,
    postalCode:
      postalCode === null
        ? null
        : styleField(postalCode, options.styles.postalCode),
    unmatched: styleField(read.unmatched, options.styles.unmatched),
  };
};
