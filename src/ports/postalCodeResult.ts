/**
 * postalCodeResult.ts
 *
 * @description 郵便番号の正規化器（PostalCodeNormalizer）のオプションと結果の型
 */

import type { CharStyle } from '@arihirookazaki/normalize-core';

/** 字形の指定を当てる項目 */
export type StyledField = 'postalCode';

/**
 * 出力の字形の指定
 * 項目は postalCode だけだが、系列の正規化器と同じ形（default と fields）にしている。クラスの指定は、どちらに書いても結果は同じ（false は fields にだけ書ける）。
 * 各項目には、まずガード付き NFKC をかけ、そのあと default に項目ごとの指定をマージしたものを当てる。
 * style を省略したとき、またはクラスの指定を省略したときの既定は、ASCII の95字（digit・alpha・symbol・space）をすべて半角にする。
 * input には何もかけない。
 */
export interface PostalCodeStyle {
  /** すべての項目に共通の指定 */
  default?: CharStyle;
  /** 項目ごとの上書き。false なら字形の指定を当てない（ガード付き NFKC はかかる） */
  fields?: Partial<Record<StyledField, CharStyle | false>>;
}

/** PostalCodeNormalizer.create のオプション */
export interface PostalCodeNormalizerOptions {
  /** true なら postalCode を 123-4567 の形で返す。既定は false（1234567）。入れたハイフンにも postalCode の字形の指定がかかる */
  hyphen?: boolean;
  /** 字形の指定 */
  style?: PostalCodeStyle;
}

/** PostalCodeNormalizer.normalize の結果 */
export interface PostalCodeResult {
  /** 渡された文字列そのまま */
  input: string;
  /**
   * 7桁の郵便番号（hyphen なら 123-4567 の形）。読めなければ null。
   *
   * - 入力（ガード付き NFKC のあと）の全体で ASCII の数字がちょうど7個で、最初と最後の数字の間に文字（Unicode の L・N・M。横棒の類の長音符 ー は除く）が無いときだけ読む
   * - 間にあってよいのは、記号・空白・括弧と横棒の類（例：`123-4567`・`123 4567`・`(123)4567`・`123ー4567`）
   * - 前後の文字は見ない（`〒123-4567`・`郵便番号：123-4567`・`123-4567 東京都` も読む）。ただし数字は全体で数えるので、前後に数字があれば読まない（`123-4567 東京都港区1-1` は null）
   * - 書式だけを見るので、実在する番号とは限らない
   */
  postalCode: string | null;
}
