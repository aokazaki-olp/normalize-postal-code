/**
 * postalCodeNormalizer.ts
 *
 * @description 郵便番号の正規化器（PostalCodeNormalizer）と、それを作るもの（PostalCodeNormalizerFactory）の契約
 */

import type {
  PostalCodeNormalizerOptions,
  PostalCodeResult,
} from './postalCodeResult.ts';

/** 郵便番号の正規化器 */
export interface PostalCodeNormalizer {
  /**
   * 日本の郵便番号を正規化する
   *
   * @param input - 郵便番号として渡された文字列
   * @returns 正規化の結果
   * @throws {TypeError} input が文字列でない場合（このライブラリの不具合を除き、TypeError は入力の誤りだけ）
   */
  normalize: (input: string) => Promise<PostalCodeResult>;
}

/** 郵便番号の正規化器を作るもの */
export interface PostalCodeNormalizerFactory {
  /**
   * 日本の郵便番号の正規化器を作る
   *
   * 書式だけを見る。実在の確認と住所の検索はしない。
   * options はここで1回だけ検査し、字形の指定をマージしておく。あとで options を書き換えても正規化器には効かない。
   *
   * @param options - ハイフンの有無と字形の指定
   * @returns 郵便番号の正規化器
   * @throws {TypeError} options が object でない場合、hyphen が boolean でない場合、または字形の指定が検査を満たさない場合
   */
  create: (options?: PostalCodeNormalizerOptions) => PostalCodeNormalizer;
}
