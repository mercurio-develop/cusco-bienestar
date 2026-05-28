# Cusco Bienestar - Agent Factory

Welcome to the autonomous Agent Factory workflow. This architecture allows AI agents to break down features, build code, review diffs, and merge PRs safely and concurrently without destroying the main codebase.

## The Kanban Board

All tasks live in the local `issues/` directory, which serves as a Kanban board:
- `issues/todo/` — Features waiting to be picked up by an execution agent.
- `issues/in-progress/` — The task is actively being built in a Git branch.
- `issues/in-review/` — The branch is pushed to GitHub; waiting for the Merge Agent to review it.
- `issues/done/` — The code is successfully merged into `main`.

---

## 1. The Orchestrator (Planning)

When you want to build a new feature, use the `agent-factory` Gemini Skill to break it down.

**Command:**
```bash
gemini "Use the agent-factory skill to plan a dark mode toggle"
```

**What it does:**
Gemini will take your feature, break it into 1-5 atomic tasks, and write Markdown files directly into `issues/todo/`.

---

## 2. The Builder (Execution)

Once you have issues in `issues/todo/`, you start the Builder.

**Command:**
```bash
./scripts/orqo/docker-afk.sh 3
```
*(The number `3` tells it to run 3 iterations/tasks).*

**What it does:**
1. Picks a task from `todo/` and moves it to `in-progress/`.
2. Checks out a new Git branch (`task/[issue-name]`).
3. Boots up a secure **Docker Sandbox** (`gemini-sandbox`).
4. Executes the code changes inside the container.
5. Commits the changes, pushes the branch to GitHub, and moves the issue to `issues/in-review/`.

---

## 3. The Reviewer (Merge)

Once a branch is pushed and the issue is in `issues/in-review/`, the Reviewer takes over.

**Command:**
```bash
./scripts/orqo/docker-merge.sh
```

**What it does:**
1. Looks at the `in-review/` folder.
2. Extracts the `git diff` of the branch against `main`.
3. Runs an AI Code Review inside the Docker Sandbox.
4. If approved, automatically merges the branch into `main` and pushes it. If rejected, moves it back to `todo/`.

---

## The Master Loop

To run the factory infinitely without typing commands, you can write a loop script that continuously runs the Builder and the Reviewer sequentially!