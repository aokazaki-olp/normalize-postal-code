/**
 * postalCodeResult.ts
 *
 * @description 郵便番号の正規化器（PostalCodeNormalizer）のオプションと結果の型
 */

import type { CharStyle } from '@arihirookazaki/normalize-core';

/** 字形の指定を当てる項目 */
export type StyledField = 'postalCode' | 'unmatched';

/**
 * 出力の字形の指定
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
   * - ガード付き NFKC のあとの ASCII の数字がちょうど7個で、最初と最後の数字の間に文字（Unicode の L・N・M。横棒の類の長音符 ー は除く）が無いときだけ読む
   * - 間にあってよいのは、記号・空白・括弧と横棒の類（例：`123-4567`・`123 4567`・`(123)4567`・`123ー4567`）
   * - 書式だけを見るので、実在する番号とは限らない
   */
  postalCode: string | null;
  /**
   * 郵便番号として読めなかった残り（ガード付き NFKC と字形の指定のあと）。無ければ ''。
   *
   * - 読めたとき：最初の数字より前と最後の数字より後ろ。前後の空白を落とし、両方あれば空白1つでつなぐ
   * - 最初の数字の直前にある郵便番号の印（〒・〶・〠・郵便番号と、あいだの記号・空白・ゼロ幅の字）は含めない
   * - 記号だけのかけら（`(123)4567` の `(`、`123-4567 ※` の `※`）は含めない
   * - 読めなければ、入力の前後の空白を落としたもの
   */
  unmatched: string;
}
