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
const MARK_WORD = '郵便番号';
// 〶 はガード付き NFKC で 〒 になる
const MARK_CHAR = /^[〒〠]$/u;
const SEPARATOR = /^[\s\p{P}\p{S}\p{Cf}]$/u;
const POSTAL_CODE_LENGTH = 7;
const LAST_BMP_CODE_POINT = 0xffff;
// 記号だけのかけら（`(123)4567` の `(`）は郵便番号の書き方の一部とみなして残りに入れない
const MEANINGFUL = /[\p{L}\p{N}]/u;

/** 郵便番号の読み取りの結果 */
export interface PostalCodeReading {
  /** 7桁の数字。読めなければ null */
  readonly digits: string | null;
  /** 郵便番号として読めなかった残り */
  readonly unmatched: string;
}

// `郵便番号：〒` のように印が重なる書き方もある。〒・〠 は記号（So）でもあり、印と記号の繰り返しを正規表現で書くと〒の並びで照合が遅くなる（形により指数的・2乗）ので、後ろから1回だけ走査する
const removeLeadingMarks = (before: string): string => {
  let position = before.length;
  let markStart: number | undefined;
  while (position > 0) {
    if (before.endsWith(MARK_WORD, position)) {
      position -= MARK_WORD.length;
      markStart = position;
      continue;
    }
    // サロゲートペアの記号（🏣 など）を1字として見るため、コードポイントで取り出す
    const tail = before.slice(Math.max(0, position - 2), position);
    const last =
      (tail.codePointAt(0) ?? 0) > LAST_BMP_CODE_POINT ? tail : tail.slice(-1);
    if (MARK_CHAR.test(last)) {
      position -= last.length;
      markStart = position;
    } else if (SEPARATOR.test(last)) {
      position -= last.length;
    } else {
      break;
    }
  }
  return markStart === undefined ? before : before.slice(0, markStart);
};

const hasLetterBetween = (between: string): boolean =>
  LETTER.test(between.replaceAll(DIGIT, '').replaceAll(HORIZONTAL_BAR, ''));

/**
 * テキストから7桁の郵便番号を読む（docs/design.md の「処理の流れ」）
 *
 * @param text - ガード付き NFKC をかけたテキスト
 * @returns ASCII の数字がちょうど7個で、最初と最後の数字の間に文字が無ければ、その7桁と前後の残り（最初の数字の直前にある印と、記号だけのかけらを除く）。それ以外は digits が null
 */
export const readPostalCode = (text: string): PostalCodeReading => {
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
  const before = removeLeadingMarks(trimmed.slice(0, first)).trim();
  const after = trimmed.slice(last + 1).trim();
  return {
    digits: positions.map((position) => trimmed.charAt(position)).join(''),
    unmatched: [before, after]
      .filter((part) => MEANINGFUL.test(part))
      .join(' '),
  };
};
