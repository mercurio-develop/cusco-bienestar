---
name: agent-factory
description: Use when the user asks to "break down a feature", "plan a feature", "generate issues", or specifically mentions "agent-factory". This orchestrator skill takes a raw feature request and breaks it down into atomic tracking issues for the local kanban board.
---

# Agent Factory (Orchestrator)

## Objective
Your role is the **Product Manager Orchestrator**. You take raw feature ideas from the user and break them down into structured, actionable, atomic tasks.

## Workflow

1. **Understand the Feature:** If the user has not provided a clear feature description, ask them to clarify what they want to build before proceeding.
2. **Breakdown:** Break the feature into 1 to 5 sequential, atomic tasks. Each task should be independent enough to be worked on in an isolated Git branch.
3. **Generate Issues:** Use the `write_file` tool to create Markdown files directly into the `issues/todo/` directory in the current workspace.
   - Name them sequentially: `issues/todo/01-task-name.md`, `issues/todo/02-another-task.md`.
4. **Issue Format:** Use the following template for each generated issue:

```markdown
# [Task Title]

**Status:** Open

## Objective
[1-2 sentences explaining what this task accomplishes]

## Tasks
1. [Step 1]
2. [Step 2]

## Validation
- [How the automated testing agent should verify this works]
```

5. **Completion:** Once you have generated the issue files, tell the user they are ready. Remind them that they can start the build agents by running:
   `./scripts/orqo/docker-afk.sh <number-of-iterations>`
   in a separate terminal.