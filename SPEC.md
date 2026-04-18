# SkillsSense - 專案規格書

## 項目概述

**SkillsSense** 是一個 AI 驅動的技能發現平台：用戶輸入需求 → AI 解析總結過濾 → 推薦適合的 skills + 生動圖文教程 + 超連結。

核心解決「不會找、不會用、不敢信」的痛點。

---

## 架構

```
用戶輸入需求
    ↓
AI 解析意圖 (intent parsing)
    ↓
┌─────────────────────────────────────────┐
│  多來源並行搜尋（Parallel Search）         │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │ 本地 Skills │  │ Hugging Face    │  │
│  │ (pgvector/  │  │ (10萬+ Models & │  │
│  │  關鍵詞)    │  │  Datasets)      │  │
│  └─────────────┘  └─────────────────┘  │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │ GitHub      │  │ Awesome Lists   │  │
│  │ Topics/Repos │  │ (精選工具列表)   │  │
│  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────┘
    ↓ (所有來源都沒找到)
┌─────────────────────────────────────────┐
│  AI 引導拆分需求 + 結合相似 skills        │
│  生成新 skill，存入本地 skills/          │
└─────────────────────────────────────────┘
    ↓
返回結果 + 來源標籤 + 圖文教程
```

---

## 多來源搜尋架構

### 來源清單

| 來源 | 數量 | 可信度 | 說明 |
|------|------|--------|------|
| **Hugging Face** | 10萬+ | 70% | Models + Datasets，最大 AI/ML 技能池 |
| **GitHub Topics** | 數千 | 80% | 開發工具主題，有社群 stars 驗證 |
| **Awesome Lists** | 數百 | 90% | 人工精選高質量工具列表 |
| **本地 Skills** | 取決於本地 | 100% | AI 生成 + 精選收錄 |

### 來源權重計算

```typescript
// 最終分數 = 來源可信度 × 0.3 + 匹配分數 × 0.7
SOURCE_WEIGHTS = {
  "huggingface": 0.7,
  "github-topic": 0.8,
  "awesome-list": 0.9,
  "local": 1.0,
}
```

---

## 功能需求

### 1. 多來源並行搜尋

- **並行查詢**：所有來源同時搜尋，不阻塞
- **超時控制**：每個來源 6-8 秒超時
- **結果合併**：按綜合分數排序，最多返回 6 個結果
- **來源標籤**：每個結果標明來源（🤗 Hugging Face / 🐙 GitHub / ✨ Awesome List / 📦 本地技能）

### 2. Hugging Face 爬蟲 (`sources/huggingface.ts`)

- 使用 Hugging Face REST API
- 搜尋 Models 和 Datasets
- 按 likes/downloads 排序
- 返回：名稱、描述、任務類型、標籤、URL

### 3. GitHub Topics 爬蟲 (`sources/github-topics.ts`)

- 嘗試匹配 topic 名稱
- 備援：搜尋相關 repositories
- 使用 GitHub REST API

### 4. Awesome Lists 爬蟲 (`sources/awesome-lists.ts`)

- 預定義 30+ 熱門 Awesome lists 映射
- 動態搜尋額外的 awesome repositories
- 基於關鍵詞和意圖 domain 智慧匹配

### 5. AI 生成新 Skill

- **觸發條件**：所有來源都沒有匹配結果
- **流程**：
  1. AI 分析用戶需求
  2. 找出最相似的 2-3 個現有 skills
  3. 組合生成新 skill
  4. 保存到 `skills/` 目錄
- **格式**：遵循 SKILL.md YAML frontmatter 格式

### 6. 需求拆分引導

- **觸發條件**：用戶需求太寬泛
- **呈現**：引導問題 + 快捷選擇按鈕

---

## 數據結構

### Skill Type

```typescript
type Skill = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  whenToUse: string;
  source: "hermes" | "local" | "generated" | "huggingface" | "github-topic" | "awesome-list";
  url: string;
  path?: string;
  generatedFrom?: string[];
};
```

### API Response

```typescript
type ApiResponse = {
  query?: string;
  intent?: { summary: string; keywords: string[]; domain?: string };
  results?: Result[];
  error?: string;
  message?: string;
  generatedSkill?: GeneratedSkill;
  guidance?: GuidanceStep[];
  sourcesSearched?: {
    local: boolean;
    huggingface: boolean;
    githubTopics: boolean;
    awesomeLists: boolean;
  };
};

type Result = {
  skill: Skill;
  score: number;
  source: "local" | "huggingface" | "github-topic" | "awesome-list";
  sourceLabel: string;
  tutorial: string;
};
```

---

## 目錄結構

```
skillssense/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 前端頁面
│   │   └── api/
│   │       └── search/
│   │           └── route.ts       # 搜尋 API
│   └── lib/
│       ├── skills-data.ts         # 本地 skills 數據
│       ├── skillsmp.ts            # [已停用] skillsmp.com 爬蟲
│       ├── skill-generator.ts     # AI 生成新 skill
│       ├── guidance.ts            # 需求拆分引導
│       ├── supabase.ts
│       ├── embeddings.ts
│       └── sources/                # 多來源搜尋 [新增]
│           ├── index.ts           # 統一導出
│           ├── hub.ts             # 搜尋協調器
│           ├── huggingface.ts     # Hugging Face 爬蟲
│           ├── github-topics.ts   # GitHub Topics 爬蟲
│           └── awesome-lists.ts   # Awesome Lists 爬蟲
├── skills/                        # AI 生成的新 skills 存放目錄
│   └── {skill-name}/
│       └── SKILL.md
├── SPEC.md
└── package.json
```

---

## 環境變量

```env
# OpenRouter
OPENROUTER_API_KEY=***

# 多來源爬蟲設定
ENABLE_HUGGINGFACE=true
ENABLE_GITHUB_TOPICS=true
ENABLE_AWESOME_LISTS=true

# [已停用] SkillsMP
# SKILLSMP_FALLBACK=false
```

---

## 驗收標準

1. ✅ 多來源並行搜尋，結果包含來源標籤
2. ✅ Hugging Face 搜尋返回 Models 和 Datasets
3. ✅ GitHub Topics/Repos 搜尋正常運作
4. ✅ Awesome Lists 智慧匹配
5. ✅ 所有來源都找不到時，AI 生成新 skill 並保存
6. ✅ 前端清楚顯示每個結果的來源
7. ✅ 各來源可透過環境變量獨立啟用/停用

---

## 技術決策

- **並行搜尋**：使用 `Promise.allSettled` 確保單一來源失敗不影響整體
- **超時控制**：每個來源獨立 AbortController，6-8 秒超時
- **來源權重**：可配置的信賴度權重，支援未來擴展新來源
- **格式相容**：生成的 SKILL.md 遵循 obra/superpowers 格式
