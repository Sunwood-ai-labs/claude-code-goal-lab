#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== Claude Code =="
type -a claude
claude --version

echo
echo "== Goal artifacts =="
test -f "$repo_root/goal-output/turn-1.txt"
test -f "$repo_root/goal-output/turn-2.txt"
grep -Fx "This is turn-1." "$repo_root/goal-output/turn-1.txt"
grep -Fx "This is turn-2." "$repo_root/goal-output/turn-2.txt"

echo
echo "== Public safety =="
if git -C "$repo_root" ls-files | grep -E '(^|/)(\\.env|.*\\.log|settings\\.json)$'; then
  echo "Public-safety check failed: secret-prone file is tracked." >&2
  exit 1
fi

echo "CLAUDE_CODE_GOAL_LAB_CHECK_OK"

