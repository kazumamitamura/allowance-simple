# 手当管理特化型アプリ (Allowance Management System)

部活動・業務手当の入力・申請・承認に特化したシンプルな管理システムです。

## 🎯 特徴

- **シンプルな手当入力**: カレンダーから日付を選択して手当を入力
- **自動金額計算**: 活動内容・行き先・運転有無・宿泊有無に応じて自動計算
- **月次申請フロー**: 職員が月末に手当を申請し、管理者が承認
- **Excel出力**: 個人・全体の月次・年次レポートをExcel形式で出力

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、Supabaseの接続情報を設定してください：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 📋 主な機能

### 職員画面 (`/`)

- **カレンダー表示**: 月次カレンダーで手当が登録されている日を一目で確認
- **手当入力**: 日付をクリックして手当内容を入力（活動内容・行き先・運転・宿泊）
- **金額自動計算**: 入力内容に応じて支給額を自動計算
- **月次申請**: 月末に手当を確定して管理者に申請
- **氏名登録**: 帳票出力用の氏名を登録

### 管理者画面 (`/admin`)

- **手当承認**: 職員からの手当申請を確認・承認
- **Excel出力**: 以下の4パターンの出力に対応
  - 個人の月次レポート
  - 個人の年次レポート
  - 全体の月次レポート
  - 全体の年次レポート

## 🔧 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: React Calendar, Tailwind CSS
- **Excel Export**: xlsx (SheetJS)

## 📁 プロジェクト構造

```
allowance-only-app/
├── app/
│   ├── page.tsx              # 職員画面（手当入力）
│   ├── login/page.tsx        # ログイン画面
│   ├── admin/
│   │   ├── page.tsx          # 管理者ダッシュボード
│   │   ├── allowances/       # 手当承認画面
│   │   └── export/           # Excel出力画面
│   ├── layout.tsx            # レイアウト
│   └── globals.css           # グローバルスタイル
├── utils/
│   ├── allowanceRules.ts     # 手当計算ロジック
│   ├── adminRoles.ts         # 管理者権限チェック
│   └── supabase/
│       └── client.ts         # Supabaseクライアント
└── README.md
```

## 💡 手当計算ルール

手当額は以下の要素で自動計算されます：

### 活動内容
- **A**: 休日部活(1日) - 2,400円
- **B**: 休日部活(半日) - 1,700円
- **C**: 指定大会 - 3,400円
- **D**: 指定外大会 - 2,400円
- **E/F**: 練習試合・遠征（運転有無・勤務日/休日で変動）
- **G**: 研修旅行等引率 - 3,400円
- **H**: 宿泊指導 - 2,400円
- **その他**: 6,000円

### 追加要素
- **運転あり**: 県内120km以上（7,500円）、県外（15,000円）、管内（活動内容により変動）
- **宿泊あり**: +2,400円（活動内容により適用条件あり）

詳細な計算ロジックは `utils/allowanceRules.ts` を参照してください。

## 🔐 認証と権限

- 一般職員: 自分の手当入力・申請のみ可能
- 管理者: 全職員の手当承認・Excel出力が可能
- 管理者メールアドレスは `utils/adminRoles.ts` で設定

## 📊 データベーステーブル

### 主要テーブル
- `allowances`: 手当データ（日付・活動内容・金額等）
- `monthly_applications`: 月次申請データ（申請状態管理）
- `user_profiles`: ユーザープロフィール（氏名等）
- `school_calendar`: 学校カレンダー（勤務日/休日判定用）

## 🛠️ 開発

### ビルド

```bash
npm run build
```

### リンターチェック

```bash
npm run lint
```

## 📝 更新履歴

### v3.0 - 手当管理特化版
- 勤務表管理機能を削除
- 休暇管理機能を削除
- 手当管理機能のみに特化してシンプル化
- カレンダーUIを手当金額表示のみに変更
- 管理画面を手当管理とExcel出力のみに整理

## 📄 ライセンス

このプロジェクトは学校法人内部利用を目的としています。

## 👥 開発者向け情報

### 主要な関数
- `calculateAmount()`: 手当金額の自動計算
- `canSelectActivity()`: 活動内容の選択可否判定
- `getLockStatus()`: 編集可否の判定（申請後・締切後はロック）

### カスタマイズ
- 手当計算ロジック: `utils/allowanceRules.ts`
- 管理者リスト: `utils/adminRoles.ts`
- スタイル: `app/globals.css`
