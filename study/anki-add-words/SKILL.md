---
name: anki-add-words
description: 把用户临时补充的德语单词（德语课生词、粘贴的词表、照片或笔记）补全冠词、复数、变位、中文和例句，生成音频后导入 Anki 牌组 AI-German-Words。用户说"把这些单词记到 Anki""帮我加这几个词""课上的词补进去"时使用；不用于删词。
metadata:
  author: NiuNiu Tang
  version: "0.1.0"
---
# 补充单词到 Anki

需要 Anki 开着（AnkiConnect，localhost:8765）和 `uvx`（用来跑 edge-tts）。下文 `scripts/` 指本 skill 目录下的 `scripts/`。

1. 用户给的可能只是单词，或一张照片、一段笔记、一张表。补全：冠词、复数、动词变化、中文释义，再造一个 A2 难度的例句并附中文翻译。原表里缺的行不要猜，报告里说明
2. 信息不确定时（多义词、拼写看不清），只问不确定的那几个词，其他照常导入
3. 在当前项目里写一份 `extra-YYYY-MM-DD.json`（`my-life` 项目放在 `99-library/data/anki-vocab/`），是一个数组，每项字段：`de`、`word`（裸单词，不带冠词）、`article`（der/die/das 或空）、`plural`（完整复数形式，或 `-en` 这类后缀写法）、`forms`（动词如 `er steigt, stieg, ist gestiegen`）、`zh`、`lesson`（来源，如 `"德语课"`）、`sentence_de`、`sentence_zh`
4. 用 `scripts/tts.sh "<例句>" <音频目录>/sNN.mp3` 给每个例句配音（NN 从 01 起，和 json 顺序一致；音频目录放临时目录，不进 git）。然后运行：
   `python3 -I scripts/anki.py <extra-YYYY-MM-DD.json> <音频目录> extra kurs`
   脚本会自动：查重跳过、生成单词音频和背面音频、存进 Anki 媒体库、打 `ai-german`、`d<文件名>`、`extra`、来源 tag，以及和旧牌组重复时的 `seen-before`。导入可能超过 2 分钟，放后台跑
5. 卡片格式（脚本已处理）：note type `AI-German`；正面只放裸单词 + 单词音频；背面冠词按 der 红 / die 蓝 / das 黄着色，带中文、复数或变位、例句和音频；只做德→中
6. 报告结果：导入了哪些词，跳过了哪些重复的，哪些带 `seen-before`。不替用户审卡；改旧卡、删卡前先问
