/**
 * buildResult.ts
 *
 * @description 読み取った郵便番号から、出力を組み立てる
 */

import { applyCharStyle } from '@arihirookazaki/normalize-core';
import type { PostalCodeResult } from '../ports/postalCodeResult.ts';
import type { PreparedOptions } from './options.ts';

/**
 * 出力を組み立てる（docs/design.md の「処理の流れ」の手順4・5）
 *
 * @param input - 渡された文字列
 * @param digits - 読み取った7桁の数字（ガード付き NFKC をかけたテキストから読んだもの）。読めなければ null
 * @param options - prepareOptions が検査とマージを済ませたオプション
 * @returns 出力
 */
export const buildResult = (
  input: string,
  digits: string | null,
  options: PreparedOptions,
): PostalCodeResult => {
  if (digits === null) {
    return { input, postalCode: null };
  }
  const postalCode = options.hyphen
    ? `${digits.slice(0, 3)}-${digits.slice(3)}`
    : digits;
  const style = options.styles.postalCode;
  return {
    input,
    postalCode:
      style === undefined ? postalCode : applyCharStyle(postalCode, style),
  };
};
