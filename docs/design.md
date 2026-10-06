# normalize-postal-code 設計

設計のメモ。コード・TSDoc と食い違うときは、それらを正とする（レイヤー構成と依存の向きを除く）。

日本の郵便番号として渡された文字列を、7桁の郵便番号の正規形にそろえる。系列で共通の決まり（入口・戻り値・名前・範囲）は作業場所の `docs/design.md` の「系列で共通の決まり」にある。郵便番号の仕様の調査は作業場所の `_work/postal/`（SPEC.md・DUMMY.md）にある。

## 範囲

- 書式だけを扱う。実在の確認（日本郵便のデータとの照合）と住所の検索はしない（別の部品か外の API に任せる。系列の決まり）
- 入力は郵便番号として渡された文字列。文中から郵便番号を探すことはしない
- 3桁・5桁の旧郵便番号は受けない
- 郵便番号は日本郵便の内国郵便約款が定めるもので、「7けた」「3けた目と4けた目の間にハイフン」「当分の間、算用数字のみ」（郵便番号・バーコードマニュアル p04。SPEC.md 2節）

## 公開 API

```ts
export const PostalCodeNormalizer: PostalCodeNormalizerFactory = { create };

interface PostalCodeNormalizerFactory {
  create: (options?: PostalCodeNormalizerOptions) => PostalCodeNormalizer;
}

export interface PostalCodeNormalizer {
  normalize: (input: string) => Promise<PostalCodeResult>;
}

export interface PostalCodeNormalizerOptions {
  hyphen?: boolean; // true なら postalCode を 123-4567 の形で返す。既定は false（1234567）
  style?: PostalCodeStyle; // 字形の指定（住所の AddressStyle と同じ形）
}

export interface PostalCodeResult {
  input: string; // 渡された文字列そのまま
  postalCode: string | null; // 7桁の郵便番号。読めなければ null
}
```

- `normalize` は同期で済むが、系列にそろえて `Promise` を返す
- 入力の誤り（`input` が文字列でない、options が検査を満たさない）は `TypeError`。ほかに投げるものは無いので、エラーのクラスは作らない（系列の決まり）
- `unmatched` は置かない。入力を部分に分けないので、残りの使い道は余計な文字の有無くらいで、切り出しが複雑さと不具合（印の除去・記号のかけら・ReDoS）の元だった（ユーザーの決定、系列の決まりもあわせて直した）
- `PostalCodeStyle` は `{ default?: CharStyle; fields?: Partial<Record<'postalCode', CharStyle | false>> }`（項目は1つだが、系列の形にそろえる）。既定は ASCII の95字を半角にする（住所と同じ）。`hyphen` で入れたハイフンにも字形の指定がかかる（`symbol: 'full'` なら `－`）

## 処理の流れ

正規化なので、区切りの形と前後に何があるかは問わず、数字が7桁あれば決まった形にそろえる（ユーザーの決定）。

1. 入力にガード付き NFKC（normalize-core）をかける（以下「テキスト」）。全角の数字・英字・記号は半角になる。〶（U+3036）は 〒（U+3012）になる
2. テキストの中の ASCII の数字 `0`〜`9` を数える。ちょうど7個でなければ読まない（6桁以下・8桁以上、旧番号の3桁・5桁を含む）。アラビア・インドの数字や丸数字など、NFKC でも ASCII にならない数字は数えない
3. 最初の数字から最後の数字までの間に、文字（Unicode の一般カテゴリが L（英字・かな・漢字など）、N（ASCII の数字を除く）、M のもの）があれば読まない。間にあってよいのは記号・空白・句読点・括弧と、横棒の集合（normalize-core の `HORIZONTAL_BAR_PATTERN`。長音符 `ー` は一般カテゴリが Lm だが、IME で打たれたハイフンとして多いので含める）など（`123-4567`、`123 4567`、`123.4567`、`(123)4567`、`1 2 3 - 4 5 6 7`）。文字を許さないのは、`1丁目2番3号4567` のような番地や、英数字のデジタルアドレスを郵便番号と読まないため
4. 読めたら `postalCode` は7桁の数字（`hyphen` なら `NNN-NNNN`）。最初の数字より前と最後の数字より後ろ（`〒`・`郵便番号：` などの印や、続く住所）は見ない。読めなければ `null`
5. `postalCode` に字形の指定をかける

例

| 入力                           | postalCode          |
| ------------------------------ | ------------------- |
| `123-4567`                     | `1234567`           |
| `〒１２３－４５６７`           | `1234567`           |
| `郵便番号：〒123 4567`         | `1234567`           |
| `〒123-4567 東京都千代田区`    | `1234567`           |
| `〒123-4567 東京都千代田区1-1` | `null`（数字が9個） |
| `1丁目2番3号4567`              | `null`（間に文字）  |
| `123-456`                      | `null`（数字が6個） |

## レイヤーと依存の向き

```
src/
  index.ts       公開面。create を PostalCodeNormalizer として公開する
  application/   正規化器を作る（options の準備と処理の流れ）
  domain/        純粋な処理（郵便番号の読み取り、options の検査）
  ports/         型だけ（PostalCodeNormalizer・PostalCodeNormalizerOptions・PostalCodeResult・PostalCodeStyle）
```

| 層             | import してよい他の層 | import してよい外部                                |
| -------------- | --------------------- | -------------------------------------------------- |
| `index.ts`     | `application` `ports` | `@arihirookazaki/normalize-core`（型の再公開だけ） |
| `application/` | `domain` `ports`      | `@arihirookazaki/normalize-core`                   |
| `domain/`      | `ports`               | `@arihirookazaki/normalize-core`                   |
| `ports/`       | なし                  | `@arihirookazaki/normalize-core`（型だけ）         |

- I/O は無い。adapters の層は置かない
- この表を lint で止める（eslint.config.js は normalize-address の層の検査を写したもの）

## 依存

- `@arihirookazaki/normalize-core`：ガード付き NFKC、横棒の集合（`HORIZONTAL_BAR_PATTERN`）、字形の指定（`applyCharStyle`・`mergeCharStyle`）。Git の URL で書き、`bundleDependencies` で同梱する（系列の配り方）

## 既知の制限

- 書式だけを見るので、実在しない番号（`000-0000`・`123-4567` などのダミー）も郵便番号として読む（DUMMY.md）。電話番号の一部など、7桁の数字の並びも見分けられない
- 漢数字（`〒一〇〇―〇〇〇一`）や丸数字など、NFKC で ASCII にならない数字の郵便番号は読まない（null。誤読はしない）
- 前後を見ないので、郵便番号の欄に住所などが混ざっていても（`〒123-4567 東京都千代田区`）読み、混ざっていたことは結果から分からない（必要なら input を見る）
- 数字だけの7桁のデジタルアドレスがありうるかは未確認（SPEC.md 6節）。ありうるなら、郵便番号として読んでしまう

## 決定の記録

- `hyphen` の既定は `false`（7桁の数字だけ。データの保存や照合に向く）
- `unmatched` は置かない（2026-10-05 ユーザーの決定。前後の残りは見ない）
- 区切り・印の一覧は決めない。数字が7桁で、間に文字が無ければ読む（ユーザーの決定「どんな形で来ても、数字7桁だったら決まった形にする」「間の文字は無効、記号は有効」）
