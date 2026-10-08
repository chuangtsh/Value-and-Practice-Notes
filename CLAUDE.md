# 價值與實踐・讀書筆記網站

把清大通識「價值與實踐」（洪巳軒老師）的講義、簡報與我的手寫課堂筆記，整理成一個 Astro Starlight 靜態網站，部署在 GitHub Pages。網站語言：繁體中文（台灣用語、全形標點），專有名詞後括號附英文。

這是一個 llm-wiki 式的知識庫：原始資料放在 `raw/`（不改動），整理後的頁面在 `src/content/docs/`（由 Claude 維護）。

## 資料夾

```
raw/
  course/    老師的課綱、講義、簡報（原檔，不改動；不進 git）
  notes/     我的手寫筆記 PDF（iPad 匯出，無文字層；不進 git）
  text/      從上面抽出的文字；筆記-N.transcript.md 是手寫筆記的逐頁轉錄（只有轉錄檔進 git）
src/
  content/docs/   網站頁面＝wiki 本體（.md / .mdx）
  components/     圖解（inline SVG）與 ArgumentMap 論證圖元件
    dg/           Box、Arrow 等 SVG 小元件
  styles/custom.css   配色、中文行距、圖解樣式、綠色「課堂筆記」框
  plugins/remark-base-links.mjs   讓 Markdown 站內連結自動加上 GitHub Pages 子路徑
astro.config.mjs  側欄目錄（新增頁面要在這裡登記）
LOG.md            更新紀錄（只往後追加）
```

## 新的一堂課／新資料進來時（ingest）

1. 原檔放進 `raw/course/` 或 `raw/notes/`。
2. 抽文字到 `raw/text/`：
   - 文字型 PDF：`pdftotext`，再把中文斷行接回來。
   - .docx / .pptx：解壓讀 XML（docx 先移除 `mc:Fallback` 再取 `w:t`；pptx 依 slide 編號讀 `a:t`，含講者備註）。
   - 舊版 .doc：用 `olefile` 依 piece table 解碼。
   - 手寫筆記：`pdftoppm -r 140` 轉圖、切上下半頁逐頁閱讀；小字或白板照片用 300 dpi 局部放大。轉錄寫進 `raw/text/筆記-N.transcript.md`，看不清的字標 `[?]`。
3. 更新或新增頁面：一個主題一頁，不是一堂課一頁。新內容優先併入既有頁面。
4. 新頁面要在 `astro.config.mjs` 的 sidebar 登記，也要加到首頁 `index.mdx` 的卡片和 `course/syllabus.md` 的進度表。
5. 新內容和既有頁面矛盾時，明確標出來，不要默默覆蓋。
6. 在 `LOG.md` 追加一筆紀錄。
7. 建置並檢查（見下方「驗證」）。

## 頁面寫法

- 開頭一段 `<p class="lead">`：一兩句講完這頁的重點。
- 來源區分要清楚：
  - 講義、簡報內容：正文。
  - 課堂筆記：`:::tip[課堂筆記・M/D]{icon="pencil"}`（綠色框）。字跡不確定要註明。
  - 容易搞錯的地方：`:::caution[常見誤解]`。
  - 我自己補充、材料裡沒有的例子：要標「補充」或「例子為示意」。不要捏造老師沒說過的話。
- 頁尾：`## 自我檢測`（`<details class="quiz">`，答案藏起來）＋ `## 出處`。
- 考試全是申論題，所以重點放在論證、批評、理論間的比較，而不是背定義。
- 站內連結用絕對路徑並以 `/` 結尾，例如 `/ethics/kant/`；錨點用 heading 文字去掉標點，例如 `#二韓非人性好利`。MDX 元件的 `href` 不會被 remark 外掛處理，要像 `index.mdx` 一樣自己加 base。
- MDX 正文避免 `{ }` 和 `<`。
- 寫完用 `speak-human-tw` skill 去 AI 味（它會先列修改清單，等使用者確認才改）。

## 圖解

- 一張圖說明一個機制（論證的走向、兩個選項的差異、流程），一句話能講完的就不要畫。
- 用 `src/components/Diagram.astro` 包外框，裡面用 `dg/Box.astro`、`dg/Arrow.astro` 組。顏色只用 class（`acc`／`red`／`grn`／`muted`），不要寫死色碼，這樣深淺色主題都能用。
- 前提 → 結論的論證用 `ArgumentMap.astro`。
- 畫完要截圖確認淺色、深色兩種主題。

## 驗證

```sh
npm run build && npm run check-links                  # 建置零錯誤（i18n 與 404 的 WARN 可忽略）、站內連結與錨點全部有效
export GITHUB_REPOSITORY=chuangtsh/Value-and-Practice-Notes   # 模擬 GitHub Pages 子路徑，再跑一次上一行
npm run preview                                       # http://localhost:4321
google-chrome --headless=new --no-sandbox --window-size=1280,1400 --screenshot=out.png http://localhost:4321/<path>/
# 深色主題加 --force-dark-mode；手機寬度用 --window-size=400,2400
```

檢查重點：`check-links` 在根目錄與子路徑兩種 build 都要通過（GitHub Actions 部署前也會自動跑，失敗就不部署）、圖解在兩種主題下都清楚。

## 部署

推到 `main` 分支後，`.github/workflows/deploy.yml` 會建置並部署到 GitHub Pages（repo 設定 Settings → Pages → Source 要選「GitHub Actions」）。`astro.config.mjs` 從 `GITHUB_REPOSITORY` 自動推出網址與子路徑，不用手動設定。

`raw/` 裡老師的講義、簡報與抽出的文字**不進 git**（著作權屬於老師，而 repo 可能公開）；只有我自己筆記的轉錄檔會進 git。
