#!/bin/bash
set -eo pipefail

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

# Ensure the Docker image exists
if ! docker image inspect claude-sandbox > /dev/null 2>&1; then
  echo "Building Docker sandbox image..."
  docker build -t claude-sandbox -f agent.Dockerfile .
fi

for ((i=1; i<=$1; i++)); do
  echo "======================================"
  echo " Docker Agent Factory Iteration $i of $1"
  echo "======================================"
  
  # Ensure we start from main
  git checkout main
  
  # Find next issue
  ISSUE_FILE=$(ls -1 issues/todo/*.md 2>/dev/null | head -n 1)
  if [ -z "$ISSUE_FILE" ]; then
    echo "No more tasks in issues/todo/. Exiting."
    exit 0
  fi

  FILENAME=$(basename "$ISSUE_FILE")
  TASK_NAME="${FILENAME%.*}"
  BRANCH_NAME="task/$TASK_NAME"

  echo "Picking up task: $TASK_NAME"
  mv "$ISSUE_FILE" "issues/in-progress/"
  
  # 2. Isolate
  git checkout -B "$BRANCH_NAME"
  
  # 3. Execute inside Docker
  commits=$(git log -n 5 --format="%H%n%ad%n%B---" --date=short 2>/dev/null || echo "No commits found")
  task_content=$(cat "issues/in-progress/$FILENAME")
  prompt=$(cat scripts/orqo/prompt.md 2>/dev/null || echo "")

  echo "Running containerized agent for $TASK_NAME..."
  
  # Note: The agent runs inside the container, mounted to the current directory.
  # We pass the GEMINI_API_KEY from the host so it can authenticate.
  docker run --rm \
    -v "$(pwd):/workspace" \
    -w /workspace \
    -v "$HOME/.claude:/home/node/.claude" \
    -v "$HOME/.claude.json:/home/node/.claude.json" \
    -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
    --user $(id -u):$(id -g) \
    claude-sandbox \
    claude --dangerously-skip-permissions -p "Task: $TASK_NAME. Context: $task_content. Instructions: $prompt. Implement the task, verify it, and MAKE A GIT COMMIT with your changes."

  # 4. Finalize
  if [[ -n $(git status -s) ]]; then
    echo "Agent left uncommitted changes. Committing them now..."
    git add .
    git commit -m "feat: implement $TASK_NAME"
  fi

  echo "Pushing branch $BRANCH_NAME to origin..."
  git push -u origin "$BRANCH_NAME" --force-with-lease || git push -u origin "$BRANCH_NAME" --force || echo "Failed to push branch. Is remote configured?"

  # Agent may have already moved the issue to done/ per prompt instructions
  if [ -f "issues/in-progress/$FILENAME" ]; then
    echo "Moving issue to in-review..."
    mv "issues/in-progress/$FILENAME" "issues/in-review/"
  elif [ -f "issues/done/$FILENAME" ]; then
    echo "Agent marked issue as done. Skipping in-review."
  else
    echo "Warning: issue file $FILENAME not found in in-progress or done."
  fi
  
  # Clean up and return to main for the next iteration
  git checkout main
done

echo "Finished $1 iterations."