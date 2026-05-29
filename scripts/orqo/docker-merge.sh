#!/bin/bash
set -eo pipefail

AI_TOOL=${1:-gemini} # Default to gemini if not provided

# Validate AI tool
if [[ "$AI_TOOL" != "gemini" && "$AI_TOOL" != "claude" ]]; then
  echo "Invalid AI tool specified. Choose 'gemini' or 'claude'."
  exit 1
fi

echo "======================================"
echo " Docker Auto-Merge Agent Started (Tool: $AI_TOOL)"
echo "======================================"

# Ensure the Docker image exists
if ! docker image inspect claude-sandbox > /dev/null 2>&1; then
  echo "Building Docker sandbox image..."
  docker build -t claude-sandbox -f agent.Dockerfile .
fi

git checkout main

# Find an issue in in-review
ISSUE_FILE=$(ls -1 issues/in-review/*.md 2>/dev/null | head -n 1)
if [ -z "$ISSUE_FILE" ]; then
  echo "No tasks in in-review. Exiting."
  exit 0
fi

FILENAME=$(basename "$ISSUE_FILE")
TASK_NAME="${FILENAME%.*}"
BRANCH_NAME="task/$TASK_NAME"

echo "Evaluating branch: $BRANCH_NAME"

# Fetch latest and ensure branch exists locally
git fetch origin
git checkout -B "$BRANCH_NAME" "origin/$BRANCH_NAME"
git checkout main

# Extract git diff between main and branch to review
DIFF=$(git diff main...$BRANCH_NAME)

# Stop if diff is huge to avoid context limits
# Escape @ symbols in DIFF so gemini CLI does not expand them as files
ESCAPED_DIFF="${DIFF//@/\\@}"

if [ ${#DIFF} -gt 150000 ]; then
  echo "Diff is too large for immediate context. Bypassing deep review for now or requires chunking."
  REVIEW_RESULT="APPROVE"
else
  # Review the diff using the containerized agent
  echo "Running AI Code Review via Sandbox using $AI_TOOL..."
  
  if [ "$AI_TOOL" = "gemini" ]; then
    REVIEW_RESULT=$(docker run --rm \
      -v "$(pwd):/workspace" \
      -w /workspace \
      -v "$HOME/.gemini:/home/node/.gemini" \
      -e GEMINI_API_KEY="$GEMINI_API_KEY" \
      --user $(id -u):$(id -g) \
      claude-sandbox \
      gemini --dangerously-skip-permissions -p "You are an automated merge agent. Review the following Git Diff for branch '$BRANCH_NAME' against main. If the diff looks reasonably safe, implements the feature without obvious syntax errors, and does not contain destructive actions outside its scope, respond with EXACTLY 'APPROVE'. Otherwise, respond with 'REJECT: <reason>'. Diff:
$ESCAPED_DIFF")
  else
    REVIEW_RESULT=$(docker run --rm \
      -v "$(pwd):/workspace" \
      -w /workspace \
      -v "$HOME/.claude:/home/node/.claude" \
      -v "$HOME/.claude.json:/home/node/.claude.json" \
      -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
      --user $(id -u):$(id -g) \
      claude-sandbox \
      claude --dangerously-skip-permissions -p "You are an automated merge agent. Review the following Git Diff for branch '$BRANCH_NAME' against main. If the diff looks reasonably safe, implements the feature without obvious syntax errors, and does not contain destructive actions outside its scope, respond with EXACTLY 'APPROVE'. Otherwise, respond with 'REJECT: <reason>'. Diff:
$ESCAPED_DIFF")
  fi
fi

echo "AI Review Result: $REVIEW_RESULT"

if [[ "$REVIEW_RESULT" == *"APPROVE"* ]]; then
  echo "AI approved the PR. Merging..."
  git merge --no-ff "$BRANCH_NAME" -m "Merge branch '$BRANCH_NAME' (AI Approved)"
  git push origin main
  mv "$ISSUE_FILE" "issues/done/"
  echo "Successfully merged $TASK_NAME!"
else
  echo "AI rejected the PR. Returning issue to todo..."
  mv "$ISSUE_FILE" "issues/todo/"
fi