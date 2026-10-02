# TZW Skills

个人使用的 Codex / Agent Skills 仓库，收录各类工作流及自动化技能。

## 目录结构

```text
TZW-skills/
├── function-description/               # 教程生成与功能演示类 Skills
│   ├── pdf-tutorial-generation/        # PDF 教程生成 Skill
│   └── tutorial-video-generator/       # 视频教程生成 Skill
├── lightweight-developments/           # 轻量化开发辅助 Skill Pack
├── german-communication/               # 德语沟通辅助 Skill
├── Temp/                               # 临时生成文件目录（受 .gitignore 忽略）
└── .gitignore
```

## 主要 Skills 介绍

### 1. Function Description（功能说明与教程生成）

- **PDF Tutorial Generation (`pdf-tutorial-generation`)**
  - **定位**：根据提供的界面截图（或自主抓取），生成排版专业、标注清晰的 PDF 分步操作教程。
  - **特性**：
    - 支持红框、序号徽标等多步骤 UI 标注，避免重复信息标记。
    - 默认采用德语，支持按需指定语言（如中文、英语）。
    - 基于 ReportLab 与 Pillow 渲染，兼顾信息完整度与排版紧凑美观。
    - 自动将构建中间件与最终 PDF 隔离在 `Temp/` 目录，防止污染 Git 仓库。

- **Tutorial Video Generator (`tutorial-video-generator`)**
  - **定位**：通过 JSON 故事板（Storyboard）全自动生成带语音解说、操作动效与字幕的 Web 软件视频教程。
  - **特性**：
    - 依托 Playwright 稳定抓取真实 UI 与操作轨迹。
    - 结合 Remotion 实现确定性视频渲染。
    - 支持高自然度 TTS 语音生成与精准字幕对齐。

### 2. Lightweight Developments（轻量开发辅助）

包含一系列针对日常代码阅读、规范化需求转化、逻辑审查、问题诊断等开发场景的轻量技能组件。

### 3. German Communication（德语交流）

针对德语职场沟通与专业语境交互定制的对话辅助技能。

## 使用与开发规范

1. **临时与产出文件隔离**：所有生成的 PDF、视频、音频、截图临时文件统一存放于项目根目录下的 `Temp/` 中，切勿提交入库。
2. **敏感配置保护**：API Key 等凭证放于各自 Skill 本地的 `ENV` 或根目录 `.env`，已默认被 `.gitignore` 忽略。
3. **全局 Skill 挂载**：本地开发的技能可通过软链接挂载至 `~/.codex/skills/` 供 Codex 全局调用。
