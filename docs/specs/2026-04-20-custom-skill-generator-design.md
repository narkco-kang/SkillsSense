# Custom Skill Generator — 設計規格書

**最後更新**：2026-04-20  
**負責人**：小k  
**版本**：v1.0

---

## 🎯 1. 問題陳述

當前 SkillsSense 的「AI 生成定製化 Skill」業務埋在搜索流程的末尾（無匹配結果時自動觸發），用戶接觸不到這個能力，且生成後無法下載壓縮包。

**新需求**：
- 把定製化 Skill 生成業務獨立成一個用戶可主動觸發的模組
- 提供專業的 ZIP 下載包（包含標準 Skill 文件結構）
- 建立免費 + 廣告解鎖 + 訂閱會員的變現機制

---

## ✅ 2. 成功標準

| 標準 | 目標 |
|------|------|
| 用戶可從首頁直接進入定製化流程 | Click-through rate > 15% |
| ZIP 包包含完整、規範、可直接使用的文件 | 用戶無需編輯即可使用 |
| 訪客至少有 1 次完整免費生成 + 下載 | 降低試用門檻 |
| 廣告解鎖流程流暢，不可繞過 | 收入轉化 |
| 月訂閱 $3，無限次下載 | ARPU 目標 $3/user |

---

## 🏗️ 3. 架構總覽

### 3.1 新頁面

```
/custom-skills          → 定製化 Skill 生成器（主頁）
/custom-skills/result   → 生成結果展示 + 下載頁
/custom-skills/pricing → 訂閱方案說明頁（可選，簡化版可不做）
```

### 3.2 入口矩陣

| 入口位置 | 形式 | 描述 |
|---------|------|------|
| Hero 區域下方 | 醒目卡片 CTA | 「🎯 定制我的專屬 Skill →」，漸層背景，點擊進入 `/custom-skills` |
| 搜索框下方 | 連結文字 | 「想讓 AI 為你量身打造一個 Skill？試試定制生成器 →」，字級較小 |
| 頂部導航欄 | 文字連結 | 「定制 Skill」，鼠標懸停顯示下拉說明 |

### 3.3 系統模組

```
┌─────────────────────────────────────────────┐
│              /custom-skills 頁面              │
│                                             │
│  Step 1: 需求輸入（多步嚮導）                  │
│  Step 2: AI 生成預覽                         │
│  Step 3: 下載 / 廣告解鎖 / 訂閱               │
│                                             │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │   廣告 offerwall   │  ← 第三方 Offerwall SDK
        │   (Kiwi / Offer4All)│
        └──────────┬──────────┘
                   │
        ┌──────────┴──────────┐
        │   /api/custom-skill │
        │   生成 + ZIP 打包   │
        └──────────┬──────────┘
                   │
        ┌──────────┴──────────┐
        │   skills/ 目錄       │
        │   (持久化存儲)       │
        └─────────────────────┘
```

---

## 📐 4. 詳細設計

### 4.1 用戶流程（多步驟嚮導）

```
步驟 1          步驟 2          步驟 3          步驟 4
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ 需求輸入   │→ │ AI 生成   │→ │ 解鎖下載   │→ │ 完成 🎉  │
│          │  │ 預覽      │  │          │  │          │
│- 目標描述  │  │          │  │ 免費 1次  │  │ ZIP 已    │
│- 應用場景  │  │ 顯示生成  │  │ 廣告解鎖  │  │ 生成下載  │
│- 熟練程度  │  │ 結果摘要  │  │ 訂閱解鎖  │  │          │
│          │  │          │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

#### Step 1 — 需求輸入（3個子問題）

| 問題 | 類型 | 說明 |
|------|------|------|
| 你想解決什麼問題？ | Textarea | 自然語言描述需求，如 "我想自動化每日生產報告的生成" |
| 在什麼場景下使用？ | Select | 個人效率 / 團隊協作 / 產品開發 / 學習研究 / 其他 |
| 你的熟練程度？ | Radio | 初學者 / 中級 / 高級 / 專家 |

#### Step 2 — AI 生成預覽

- 展示 AI 即時生成的內容摘要（非完整包）：
  - Skill 名稱（可編輯）
  - 標籤（可增刪）
  - 一句話描述
- 點擊「開始生成完整包」進入 Step 3

#### Step 3 — 解鎖下載

根據用戶狀態顯示不同 UI：

**訪客（未解鎖過）：**
```
┌────────────────────────────────────────┐
│     🎁 你有 1 次免費生成 + 下載機會！     │
│                                        │
│   [🎯 生成我的定製化 Skill →]            │
│                                        │
│   之後想再用？                          │
│   ○ 看廣告（免費）  ○ 訂閱 $3/月（無限）│
└────────────────────────────────────────┘
```

**訪客（已用完免費次數）：**
```
┌────────────────────────────────────────┐
│   今日免費次數已用完                    │
│                                        │
│   [👁 看廣告解鎖本次下載]               │
│                                        │
│   或                                    │
│   [$3/月 訂閱，無限次下載] ←             │
│   [查看訂閱方案]                         │
└────────────────────────────────────────┘
```

**已訂閱會員：**
```
┌────────────────────────────────────────┐
│   ✨ Pro 會員                           │
│   無限次生成 + 下載                      │
│                                        │
│   [🎯 生成我的定製化 Skill →]            │
└────────────────────────────────────────┘
```

#### Step 4 — 完成頁

- ZIP 下載按鈕（藍色醒目）
- 展示 ZIP 包內容清單
- 提示「已保存到 /skills/ 目錄」
- 分享連結（可選）

---

### 4.2 ZIP 包結構（標準 Skill 壓縮包）

AI 生成後，打包以下文件到 `/tmp/custom-skills/[slug].zip`：

```
[skill-name]/
├── SKILL.md              # 核心文件（name, category, description, tags, whenToUse, source: generated, generatedFrom）
├── TUTORIAL.md           # 完整圖文教程
├── README.md             # 快速開始指南
└── standards/            # 標準模板文件
    ├── metadata.yml      # 結構化元數據（與 SKILL.md frontmatter 同步）
    ├── examples/         # 示例文件（根據 skill 類型動態生成）
    │   ├── example-01.[ext]
    │   └── example-02.[ext]
    └── templates/        # 可直接使用的模板
        ├── template-base.[ext]
        └── template-advanced.[ext]
```

**AI 生成時動態決定的內容**：
- `examples/` 數量（1-3個，視 skill 複雜度）
- `templates/` 數量（1-2個）
- 文件擴展名（根據 skill 類型：.py / .js / .sh / .md / .json 等）

**固定內容**：
- `SKILL.md` — 一定生成
- `TUTORIAL.md` — 一定生成（圖文並茂，含步驟和代碼塊）
- `README.md` — 一定生成（使用說明）

---

### 4.3 廣告 Offerwall 集成

**推薦提供商**（早期產品優先順序）：

| 提供商 | 優點 | 缺點 | 門檻 |
|--------|------|------|------|
| **Kiwi SDK** | 文檔清晰、整合簡單、支援 CPM/CPC | 需申請審批 | 中等（需網站審核） |
| **Offer4All** | 門檻低、即刻可用 | 佣金較低 | 低（幾乎無門檻） |
| **AdWork Media** | 成熟生態、變現效率高 | 需流量門檻 | 高（需日UV>1000） |

**集成方案（Kiwi SDK 為例）**：

```tsx
// SDK 引入
// 在 Step 3 的「看廣告」按鈕點擊時：
const offerwall = KiwiSDK({
  pubId: process.env.NEXT_PUBLIC_KIWI_PUB_ID,
  offerwallId: process.env.NEXT_PUBLIC_KIWI_OFFERWALL_ID,
  onComplete: (offerId: string) => {
    // 廣告觀看完成，解鎖下載
    setUnlocked(true);
    setRemainingDownloads(1); // 看完廣告給 1 次
  },
  onClose: () => {
    // 用戶關閉未看完
    toast("需要看完廣告才能解鎖下載哦～");
  }
});

offerwall.show();
```

**後端校驗**：後端收到下載請求時，校驗 `X-Unlock-Token`（由 Offerwall 平台發放的完成令牌）是否有效，防止前端偽造。

```tsx
// API 路由校驗
const unlockResponse = await fetch(
  `https://api.kiwi-cdn.com/verify?token=${token}&pub=${KIWI_PUB_ID}`
);
if (!unlockResponse.ok) {
  return Response.json({ error: "Unlock verification failed" }, { status: 403 });
}
```

---

### 4.4 訂閱系統（$3/月，無限次）

**技術方案**：使用 **LemonSqueezy** 或 **Gumroad**（最簡單，無需自己架設支付）

| 平台 | 優點 | 缺點 |
|------|------|------|
| **LemonSqueezy** | API 完善、Webhook 可靠、支援多幣种、對中小商家友好 | 對中國用戶支付不友好 |
| **Gumroad** | 極簡、連結分享即可買、支援 PayPal | 功能相對少 |

**用户身份識別**：
- 方案：基於 Email 的簡易會員系統
- 流程：用戶輸入 Email → 發送購買連結 → 付款成功後的 Webhook 更新會員狀態
- 存儲：KV Store（Vercel KV / Upstash Redis）或簡單的 JSON 文件

**會員狀態校驗 API**：

```ts
// /api/check-membership?email=user@example.com
// 返回: { active: boolean, plan: "monthly" | null, expiresAt: string }
```

**前端狀態管理**：

```tsx
type UserStatus =
  | { type: "guest"; freeDownloadsLeft: 0 | 1 }
  | { type: "ad-unlocked"; downloadsLeft: number }
  | { type: "subscribed"; expiresAt: string };
```

---

### 4.5 API 設計

#### `POST /api/custom-skills`

**用途**：生成並打包定製化 Skill ZIP

**Request**：
```json
{
  "goal": "我想自動化每日生產報告的生成",
  "scenario": "個人效率",
  "proficiency": "中級",
  "email": "user@example.com"
}
```

**Response**（成功）：
```json
{
  "skill": {
    "name": "Automated Daily Report Generator",
    "slug": "automated-daily-report-generator",
    "category": "productivity",
    "tags": ["automation", "report", "python", "schedule"],
    "description": "...",
    "whenToUse": "...",
    "generatedFrom": ["python-scripting", "report-automation"],
    "tutorial": "..."
  },
  "zipUrl": "/api/custom-skills/download/[slug]",
  "expiresAt": "2026-04-21T00:00:00Z"
}
```

**Response**（需要解鎖）：
```json
{
  "error": "download_limit_exceeded",
  "message": "需要解鎖才能下載",
  "unlockOptions": {
    "ad": { "offerwallUrl": "..." },
    "subscribe": { "priceId": "price_xxx", "checkoutUrl": "..." }
  }
}
```

#### `GET /api/custom-skills/download/[slug]`

**用途**：下載 ZIP 文件

**校驗邏輯**：
1. 檢查 localStorage 的 `ss_free_used`（訪客免費次數）
2. 檢查 Cookie 的 `ss_ad_unlocked`（廣告解鎖狀態，帶時間戳校驗）
3. 檢查會員 email 的訂閱狀態

---

### 4.6 前端狀態管理

使用 React Context 管理用戶狀態：

```tsx
type DownloadStatus =
  | "free-available"    // 免費 1 次可用
  | "ad-required"        // 需要看廣告
  | "subscribed"        // 會員無限
  | "generating"        // 生成中
  | "ready";            // 可以下載
```

```tsx
// Usage: 用戶進入 /custom-skills 時
const [status, setStatus] = useState<DownloadStatus>("free-available");

// Step 3 按鈕邏輯
const handleDownload = async () => {
  if (status === "free-available") {
    // 直接生成 + 下載，標記 localStorage
    markFreeUsed();
    setStatus("ad-required");
  } else if (status === "ad-required") {
    // 觸發 offerwall
    showOfferwall();
  }
};
```

---

### 4.7 入口 UI 設計（首頁改動）

#### Hero 區域卡片

在 Hero 描述下方、搜索框上方，插入：

```
┌──────────────────────────────────────────────────────┐
│  ╔══════════════════════════════════════════════╗   │
│  ║  🎯 定制你的專屬 Skill                          ║   │
│  ║                                              ║   │
│  ║  告訴 AI 你的需求，我幫你生成完整的技能包：        ║   │
│  ║  含標準文件結構 + 圖文教程 + 示例代碼             ║   │
│  ║                                              ║   │
│  ║  [ 免費定制一次 → ]   [ 查看方案 ]              ║   │
│  ╚══════════════════════════════════════════════╝   │
└──────────────────────────────────────────────────────┘
```

#### 搜索框下方連結

```
[ 試試 AI 定製生成器 → ]
```

#### 導航欄

在右側增加文字連結：`定制 Skill`，hover tooltip：「讓 AI 為你量身打造一個 Skill」

---

## 🧪 5. 測試策略

### 5.1 單元測試
- `findSimilarSkills()` — 確保冷門需求返回空陣列
- `generateNewSkill()` — 確保 JSON 格式正確
- `zipPackageBuilder()` — 確保所有文件正確打包
- `membershipChecker()` — 確保訂閱狀態校驗邏輯正確

### 5.2 E2E 測試場景

| 場景 | 步驟 | 預期結果 |
|------|------|----------|
| 訪客首次使用 | 進入 /custom-skills → 填表 → 下載 | 成功，無需任何解鎖 |
| 訪客第二次使用 | 再試下載 | 提示看廣告或訂閱 |
| 看廣告完成 | 點擊看廣告 → SDK 觸發 → 完成 | 解鎖成功，可下載 |
| 會員下載 | 登入 → 點擊下載 | 成功，無任何廣告提示 |
| ZIP 完整性 | 下載後解壓 | 所有文件齊備，SKILL.md 可用 |

---

## 📋 6. 實施階段

### Phase 1：基礎框架（預計 1-2 天）
- [ ] 新建 `/custom-skills` 頁面骨架（4步驟嚮導 UI）
- [ ] 接入現有 `generateNewSkill()` 和 `saveGeneratedSkill()`邏輯
- [ ] ZIP 打包功能實現
- [ ] 三個入口位置上線（Hero 卡片、搜索框連結、導航欄）

### Phase 2：變現基建（預計 1 天）
- [ ] 申請 Kiwi SDK（或 Offer4All）
- [ ] Offerwall 按鈕 + SDK 集成
- [ ] LemonSqueezy / Gumroad 訂閱連結生成
- [ ] 後端校驗 API（解鎖令牌驗證）

### Phase 3：會員系統（預計 0.5 天）
- [ ] Email + 購買狀態簡易 KV 存儲
- [ ] 會員狀態校驗 API
- [ ] 前端會員狀態 Context

### Phase 4：文案與 UX 優化（預計 0.5 天）
- [ ] 所有按鈕文案（ZH/EN 雙語）
- [ ] 完成頁動畫和分享功能
- [ ] ZIP 包內 README 優化

---

## ⚠️ 7. 已知風險

| 風險 | 等級 | 緩解措施 |
|------|------|----------|
| Offerwall SDK 審核不通過 | 中 | 同步申請 Offer4All 作為備選 |
| 用戶科學上網繞過廣告追蹤 | 低 | 後端 IP + Token 雙重校驗 |
| ZIP 生成時間長（>10s） | 中 | 前端 loading 狀態 + SSE 流式反饋 |
| 免費次數被濫用（多設備） | 中 | Email 識別（即便是非登入用戶） |
| Kiwi SDK 不支援中國區用戶 | 高 | 考慮中國本地廣告平台備選（如穿山甲） |

---

## 🔗 8. 依賴

- `archiver` 或 `jszip` — ZIP 打包（npm）
- Kiwi SDK（或 Offer4All）— 廣告 offerwall
- LemonSqueezy / Gumroad — 訂閱支付
- Vercel KV 或 Upstash — 會員狀態存儲
