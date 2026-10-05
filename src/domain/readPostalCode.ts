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
// 〶 と全角のコロンはガード付き NFKC で 〒 と : になる
const LEADING_MARKS = /(?:〒|〠|郵便番号)\s*:?\s*$/u;
const POSTAL_CODE_LENGTH = 7;
// 記号だけのかけら（`(123)4567` の `(`）は郵便番号の書き方の一部とみなして残りに入れない
const MEANINGFUL = /[\p{L}\p{N}]/u;

/** 郵便番号の読み取りの結果 */
export interface ReadPostalCode {
  /** 7桁の数字。読めなければ null */
  readonly digits: string | null;
  /** 郵便番号として読めなかった残り */
  readonly unmatched: string;
}

const hasLetterBetween = (between: string): boolean =>
  LETTER.test(between.replaceAll(DIGIT, '').replaceAll(HORIZONTAL_BAR, ''));

/**
 * テキストから7桁の郵便番号を読む（docs/design.md の「処理の流れ」）
 *
 * @param text - ガード付き NFKC をかけたテキスト
 * @returns ASCII の数字がちょうど7個で、最初と最後の数字の間に文字が無ければ、その7桁と前後の残り（前の印と、記号だけのかけらを除く）。それ以外は digits が null
 */
export const readPostalCode = (text: string): ReadPostalCode => {
  const trimmed = text.trim();
  const positions = [...trimmed.matchAll(DIGIT)].map((match) => match.index);
  const first = positions[0];
  const last = positions.at(-1);
  if (
    positions.length !== POSTAL_CODE_LENGTH ||
    first === undefined ||
    last === undefined ||
    hasLetterBetween(trimmed.slice(first, last + 1))
  ) {
    return { digits: null, unmatched: trimmed };
  }
  const before = trimmed.slice(0, first).replace(LEADING_MARKS, '').trim();
  const after = trimmed.slice(last + 1).trim();
  return {
    digits: positions.map((position) => trimmed.charAt(position)).join(''),
    unmatched: [before, after]
      .filter((part) => MEANINGFUL.test(part))
      .join(' '),
  };
};
