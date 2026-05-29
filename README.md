# 📝 Draft Paper

[English](#english) | [中文说明](#中文说明-draft-paper)

---

## English

**An open-source Obsidian plugin for full-screen hand-drawn sketches, annotations, and drawings directly over your Markdown documents.**

Draft Paper provides a full-screen transparent canvas layer in Reading Mode. It allows you to draw, add arrows, rectangles, and text annotations without affecting your document content. All strokes are bound to the document scroll coordinates and are saved in separate `.json` files.

### Key Features
- **Smooth Hand-writing:** Powered by `perfect-freehand` for a natural pen-like experience.
- **Customizable Tools:** Color picker, stroke width, and opacity controls.
- **Stroke Eraser:** A real eraser that removes parts of paths.
- **Text & Elements:** Move, delete, or scale text and drawing elements freely.
- **Multiple Arrow Styles:** Straight, curved, dashed, and double-headed arrows.
- **Undo & Selection:** Ctrl+Z to undo, drag-select to move or delete elements.
- **File-level Isolation:** Each Markdown file has its own `draft-paper/filename.json`, ensuring privacy and easy sync.

### Installation

#### From Obsidian Community Plugins (Coming Soon)
> Currently under review. Please use manual installation below.

#### Manual Installation
1. Download the latest `main.js`, `manifest.json`, and `styles.css` from the [Releases page](https://github.com/mikuloverfan/draft-paper/releases).
2. Create a folder named `draft-paper` inside your vault's `.obsidian/plugins/` directory.
3. Place the three downloaded files into the `draft-paper` folder.
4. Reload Obsidian, then go to **Settings → Community Plugins** and enable **Draft Paper**.

### Usage

#### Getting Started
1. Open any Markdown file and ensure you are in **Reading Mode** (the plugin will switch automatically).
2. **Launch Draft Paper:** Click the pencil icon in the left ribbon, or run the command `Toggle Draft Mode` from the command palette (`Ctrl/Cmd + P`).
3. **Select a Tool** from the bottom toolbar:
   - `✏️` **Pen** — Freehand drawing
   - `🧹` **Eraser** — Partial stroke eraser
   - `⬜` **Select** — Drag to select elements, then move or delete them
   - `↗` **Arrow** — Draw arrows (press `←` `→` to switch styles)
   - `⬛` **Rectangle** — Draw rectangle frames
   - `T` **Text** — Click or double-click to add text
4. **Adjust Settings:** Use the color picker, stroke width slider, and opacity slider on the right side of the toolbar.
5. **Exit:** Click the ❌ button, press `Esc` (when no element is selected), or click the ribbon icon again.
6. **Auto-save:** Draft data is automatically saved to a `draft-paper/` folder next to your Markdown file.

#### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` ~ `6` | Switch tools (Pen/Eraser/Select/Arrow/Rectangle/Text) |
| `E` | Toggle between Pen and Eraser |
| `←` `→` | Switch arrow style (when Arrow tool is active) |
| `Ctrl+Z` | Undo |
| `Delete / Backspace` | Delete selected elements |
| `Esc` | Deselect / Exit draft mode |

---

## 中文说明: Draft Paper

**在 Obsidian 文档上自由手写、标注、绘图的开源插件。**

Draft Paper 是一款为 Obsidian 打造的「全局草稿纸」插件。它在阅读模式下提供一个全屏透明画布，让你可以在任何 Markdown 文档上进行自由绘制、箭头标注、矩形框选、文字输入等操作。所有笔迹绑定文档坐标，不受 DOM 变化（如 Callout 折叠、图片加载）影响，并持久化保存为同目录下的独立文件。

---

## ✨ 特性

- **✏️ 丝滑手写**
  基于 `perfect-freehand` + 低通滤波，提供类 Apple Pencil 的书写体验，无颗粒感、无锯齿。
- **🎨 完全自定义**
  支持颜色选择器、线条粗细滑块、透明度调节，让草稿更符合个人风格。
- **➡️ 多种箭头样式**
  直线 / 曲线 / 虚线 / 双向箭头，按方向键 `← →` 快速切换，适合不同标注需求。
- **📝 文字输入**
  双击或单击画布即可弹出输入框，支持多行文字（Shift+Enter 换行），作为独立元素保存。
- **🧹 局部橡皮擦**
  真正的「橡皮擦」：拖拽擦除笔画中的部分线段，不影响其他内容。
- **🔄 撤销与选择**
  Ctrl+Z 撤销，框选模式可拖动、删除选中元素（Delete/Backspace）。
- **📂 文件级隔离**
  每个 Markdown 文件对应一个 `draft-paper/文件名.json` 草稿文件，保护隐私，便于同步。
- **🎼 低侵入性**
  仅在阅读模式下启用，不影响编辑；可随时通过 Ribbon 图标、命令面板或快捷键开关。

---

## 📥 安装

### 方法一：从 Obsidian 社区商店安装（待上架）

> 目前正在审核中，可直接通过以下方式手动安装。

### 方法二：手动安装

1. 下载最新版 Release 中的 `main.js`、`manifest.json`、`styles.css`。
2. 在 Obsidian 仓库的 `.obsidian/plugins/` 目录下新建文件夹 `draft-paper`。
3. 将三个文件放入该文件夹。
4. 重启 Obsidian，在「设置 → 第三方插件」中启用 **Draft Paper**。

---

## 🚀 快速使用

1. **打开 Markdown 文件**，确保处于**阅读模式**（插件会自动切换）。
2. **启动草稿纸**：点击左侧 Ribbon 铅笔图标，或使用命令面板执行 `Toggle Draft Mode`（快捷键可自定义）。
3. **选择工具**：底部工具栏提供 6 种工具：
   - `✏️` 画笔 — 自由手写
   - `🧹` 橡皮擦 — 局部擦除
   - `⬜` 框选 — 拖拽选择元素，选中后可拖动或删除
   - `↗` 箭头 — 绘制箭头（按 `← →` 切换样式）
   - `⬛` 矩形 — 绘制矩形框
   - `T` 文字 — 单击/双击输入文字
4. **调节参数**：工具栏右侧有颜色、粗细、透明度滑块。
5. **退出**：点击 ❌ 按钮，或按 `Esc` 键（未选中元素时），或再次点击 Ribbon 图标。
6. **数据自动保存**：草稿文件保存在当前 Markdown 文件同级的 `draft-paper/` 文件夹下，名称与 md 相同（后缀 .json）。

---

## ⌨️ 快捷键

| 按键 | 功能 |
|------|------|
| `1` ~ `6` | 切换工具（画笔/橡皮/框选/箭头/矩形/文字） |
| `E` | 在画笔与橡皮擦之间切换 |
| `← →` | 箭头工具下切换箭头样式 |
| `Ctrl+Z` | 撤销 |
| `Delete / Backspace` | 删除选中元素 |
| `Esc` | 取消选择 / 退出草稿模式 |

---

## 📁 数据存储结构
your-notes/
├── report.md
├── draft-paper/
│   └── report.json    ← report.md 的草稿数据
├── journal/
│   ├── day1.md
│   └── draft-paper/
│       └── day1.json

- 每个 `.json` 文件独立存储，移动或重命名 `.md` 文件后需手动迁移草稿（未来版本会支持自动跟随）。

---

## 🛠️ 技术栈

- [TypeScript](https://www.typescriptlang.org/) / [Obsidian API](https://docs.obsidian.md/)
- [perfect-freehand](https://github.com/steveruizok/perfect-freehand) — 轮廓渲染引擎
- HTML5 Canvas — 绘图核心

---

## 🤝 贡献指南

欢迎任何形式的贡献！包括但不限于：

- 提交 Bug 或功能建议（[Issues](https://github.com/mikuloverfan/draft-paper/issues)）
- 代码合并请求
- 文档改进

请确保代码风格与项目一致，并通过 `npm run build` 无报错。

---

## 📄 许可证

[MIT](LICENSE)

---

## 💖 致谢

- 感谢 [tldraw](https://tldraw.com/) 和 [Excalidraw](https://excalidraw.com/) 的开源精神，Draft Paper 的笔迹渲染算法深受其启发。
- 感谢 Obsidian 社区提供的优秀插件生态。