/**
 * readPostalCode.ts
 *
 * @description テキストから7桁の郵便番号を読む
 */

import { HORIZONTAL_BAR_PATTERN } from '@arihirookazaki/normalize-core';

const DIGIT = /[0-9]/gu;
// 間に文字があれば読まないのは、番地（1丁目2番3号4567）や英数字のデジタルアドレスを郵便番号と読まないため
const LETTER = /[\p{L}\p{N}\p{M}]/u;
// 長音符（ー）は一般カテゴリが Lm だが、IME で打たれたハイフンとして間にあることが多いので記号として扱う
const HORIZONTAL_BAR = new RegExp(HORIZONTAL_BAR_PATTERN, 'gu');
const POSTAL_CODE_LENGTH = 7;

const hasLetterBetween = (between: string): boolean =>
  LETTER.test(between.replaceAll(DIGIT, '').replaceAll(HORIZONTAL_BAR, ''));

/**
 * テキストから7桁の郵便番号を読む（docs/design.md の「処理の流れ」）
 *
 * @param text - ガード付き NFKC をかけたテキスト
 * @returns ASCII の数字がちょうど7個で、最初と最後の数字の間に文字が無ければ、その7桁。それ以外は null
 */
export const readPostalCode = (text: string): string | null => {
  const positions = [...text.matchAll(DIGIT)].map((match) => match.index);
  const first = positions[0];
  const last = positions.at(-1);
  if (
    positions.length !== POSTAL_CODE_LENGTH ||
    first === undefined ||
    last === undefined ||
    hasLetterBetween(text.slice(first, last + 1))
  ) {
    return null;
  }
  return positions.map((position) => text.charAt(position)).join('');
};
