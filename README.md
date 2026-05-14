# Claude Code Goal Lab

Public lab repository for checking Claude Code's `/goal` command while routing Claude Code API traffic to Z.AI GLM 5.1 through the Anthropic-compatible endpoint.

This repo intentionally keeps API keys, raw debug logs, and local Claude settings out of git.

## Verified Local Setup

- Date: 2026-05-14 JST
- Claude Code before update: `2.1.126`
- Claude Code after update: `2.1.141`
- Claude Code model alias used: `sonnet`
- Actual provider/model observed in `claude -p --output-format json`: `glm-5.1`
- Base URL configured outside this repo: `https://api.z.ai/api/anthropic`
- Auth token location: outside this repo, in the local Claude settings/env

The local `2.1.126` build rejected `/goal` as an unknown command. After `claude update`, `2.1.141` accepted `/goal`, displayed `Goal set`, kept `/goal active`, and finished with `Goal achieved`.

## GLM 5.1 Smoke Test

```bash
claude --version
claude -p --model sonnet --max-budget-usd 0.05 --output-format json \
  "日本語で一文だけ返してください: CLAUDE_GLM51_SMOKE_OK"
```

In the JSON output, confirm:

```json
{
  "modelUsage": {
    "glm-5.1": {
      "contextWindow": 200000
    }
  }
}
```

## Goal Smoke Test

Run Claude Code interactively from this repository:

```bash
claude --model sonnet --permission-mode bypassPermissions
```

Then enter:

```text
/goal このリポジトリに goal-output/turn-1.txt と goal-output/turn-2.txt を順番に作成してください。1回のアシスタント応答では1ファイルだけ作成し、2つ作成できたら完了報告してください。
```

Expected UI markers:

```text
Goal set: ...
/goal active
Goal achieved
```

Expected files:

```text
goal-output/turn-1.txt -> This is turn-1.
goal-output/turn-2.txt -> This is turn-2.
```

## Public Repo Safety

- Do not commit `~/.claude/settings.json`.
- Do not commit `ANTHROPIC_AUTH_TOKEN`, Z.AI keys, raw debug logs, terminal recordings, or full session transcripts.
- Keep evidence summaries in `reports/`.
- Keep local runtime checks in `scripts/`.

## Reference

This lab was shaped from the local Hermes goal verification pattern in `/Users/admin/Prj/hermes-goal-lab`, but uses Claude Code's `/goal` command and the Claude Code Anthropic-compatible Z.AI configuration.

