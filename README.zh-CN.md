# TZW Skills

[English](README.md) | 简体中文

NiuNiu Tang 的个人 Agent Skill 合集，同时供 Claude Code 和 Codex 使用。涵盖日常工作记录、软件开发全流程、电脑维护、疑难问题调研和产品教程制作。

所有 Skill 的显示名都带 `(NIU)` 后缀，用来和第三方 Skill 区分。

## 目录结构

```text
TZW-skills/
├── work/                               # 日常工作
│   ├── german-communication/           # 起草、润色给同事的德语消息
│   ├── work-log-sync/                  # 写入、修改、删除每日工作日志
│   ├── work-log-recall/                # 根据工作日志回答"我做了什么"
│   └── work-task-reminder/             # 把工作需求变成 Apple 提醒事项任务
├── lightweight-developments/           # 软件开发 Skill 包（21 个）
│   ├── .agents/skills/                 # 各个开发 Skill
│   ├── catalog.yaml                    # 分类清单
│   ├── ROUTING.md / DESIGN.md          # 选路规则与设计说明
│   ├── docs/USER-GUIDE.md              # 使用指南
│   ├── scripts/                        # 校验、打包脚本
│   └── tests/
├── computer/                           # 电脑维护（只读检查）
│   ├── computer-health-check/          # 电脑体检：发热、卡顿、耗电、可疑程序
│   └── computer-software-audit/        # 已安装软件盘点与清理建议
├── research/
│   └── web-troubleshoot/               # 疑难问题的深度网络调研
├── tutorials/                          # 产品教程制作
│   ├── pdf-tutorial-generation/        # 截图标注的 PDF 操作教程
│   └── video-tutorial-generation/      # 带配音字幕的产品演示视频
├── Temp/                               # 生成产物与临时文件（Git 忽略）
└── output/                             # 旧版产物目录（Git 忽略）
```

## Skill 一览

### 日常工作（`work/`）

| Skill | 用途 |
| --- | --- |
| `german-communication` | 用自然、随意的 `du` 口吻写给熟悉同事的德语消息，也把德语翻成中文。不用于客户、法务、人事等正式场合。 |
| `work-log-sync` | 把做过的事记进每日 Markdown 工作日志（按月分文件夹），支持修改和删除，条目统一用英文。 |
| `work-log-recall` | 读取工作日志，回答"今天 / 本周 / 某个项目我做了什么"，只读不写。 |
| `work-task-reminder` | 把同事或老板的需求（Teams 消息、邮件、文字）整理成一条提醒事项任务：标题简短，备注里放原文、中文翻译、AI 拆解和步骤；附件和链接存到本 Skill 的 `temp/` 里。 |

### 软件开发（`lightweight-developments/`）

一套覆盖需求、设计、实现、验证、上线的开发 Skill。完整选路规则见 [ROUTING.md](lightweight-developments/ROUTING.md)，使用方法见 [USER-GUIDE.md](lightweight-developments/docs/USER-GUIDE.md)。

**日常开发与分析**

| Skill | 用途 |
| --- | --- |
| `brief-to-mini-spec` | 把小需求整理成简短的 Mini Spec 再动手。 |
| `diagnose` | 先收集证据、验证假设，再给出最小修复。 |
| `production-database-analysis` | 在强制只读的前提下查询生产数据库，回答统计、异常和运营问题。 |
| `explain-system` | 解释现有系统的总入口，按问题分派给下面三个 Skill。 |
| `code-reading` | 讲清某个模块、类或函数的职责与阅读顺序。 |
| `feature-tracing` | 从界面到 API、服务、数据写入，追踪一个功能的完整执行链路。 |
| `state-and-data-modeling` | 梳理实体生命周期、状态流转、数据关系和不变量。 |
| `logic-audit` | 找业务规则、分支和状态流转里的反例、矛盾和死角。 |
| `verify-change` | 用新鲜证据验证小改动或修复是否达标。 |
| `backfill-task` | 设计可暂停、可恢复、幂等的数据回填任务。 |

**大功能**

| Skill | 用途 |
| --- | --- |
| `brief-to-spec` | 把大需求整理成正式的行为规格说明。 |
| `spec-explainer` | 给规格补充流程说明、具体场景和 Mermaid 图。 |
| `spec-to-plan` | 把审批过的规格拆成可验证的实现计划。 |
| `implement-plan` | 按审批过的计划逐项实现。 |
| `verify-spec` | 逐条对照规格做最终验收。 |

**质量与交付**

| Skill | 用途 |
| --- | --- |
| `engineering-quality` | 写代码时遵守的通用质量约束。 |
| `doubt-review` | 独立、挑刺式地审查规格、方案或改动。 |
| `code-review` | 审查代码改动（只链接到 Codex，避免和 Claude Code 自带的 `/code-review` 撞名）。 |
| `session-handoff` | 换会话或换 Agent 时留下简洁的交接记录。 |
| `ship-change` | 合并、部署、迁移前必须拿到明确授权，并做前后检查和回滚预案。 |
| `review-spec` | 已停用，功能由 `doubt-review` 代替，暂时保留。 |

### 电脑维护（`computer/`）

| Skill | 用途 |
| --- | --- |
| `computer-health-check` | macOS 体检：CPU、内存、发热、电池、磁盘、后台任务、开发进程、安全设置、可疑程序。只读，任何处理都要逐项确认。 |
| `computer-software-audit` | 盘点已安装的软件、命令行工具、运行时和残留数据，找出可清理的候选项。只读，不卸载任何东西。 |

### 调研（`research/`）

| Skill | 用途 |
| --- | --- |
| `web-troubleshoot` | 面对难缠的线上问题、云服务故障或集成问题时，广泛搜集案例和一手资料，与本地证据对比，给出排序后的假设和下一步检查。默认中文回复。 |

### 教程制作（`tutorials/`）

两个 Skill 都只在明确点名时才使用。

| Skill | 用途 |
| --- | --- |
| `pdf-tutorial-generation` | 用界面截图生成分步骤 PDF 教程，自动画红框和编号，默认德语。 |
| `video-tutorial-generation` | 从真实浏览器窗口录制操作，加上 TTS 配音和字幕，用 Remotion 渲染成演示视频。会调用付费的语音合成接口。 |

## 安装

每个 Skill 通过软链接安装到全局目录，Claude Code 和 Codex 各一份：

```bash
ln -s "$PWD/work/work-task-reminder" ~/.claude/skills/work-task-reminder
ln -s "$PWD/work/work-task-reminder" ~/.codex/skills/work-task-reminder
```

链接名必须和 SKILL.md 里的 `name` 一致。移动或改名 Skill 后，要同时更新这两个目录里的链接。

## 约定

1. **命名**：文件夹名和 `name` 一致，全部小写，单词之间用短杠，不用下划线。
2. **元信息**：每个 SKILL.md 的 frontmatter 都写 `metadata.author` 和 `metadata.version`；每个 Skill 都带 `agents/openai.yaml`，显示名以 `(NIU)` 结尾。
3. **产物隔离**：生成的 PDF、视频、音频、截图等一律放在 `Temp/` 或对应 Skill 自己的临时目录，不进版本库。
4. **密钥**：API Key、TTS Key 等只放在本地的 `ENV` 或 `.env` 文件里，不提交。
5. **开发 Skill 包**：改动 `lightweight-developments` 后，运行下面的命令校验：

```bash
cd lightweight-developments && python3 scripts/validate_pack.py && python3 -m unittest discover -s tests
```

修改本文件时，请同步更新英文版 [README.md](README.md)。
