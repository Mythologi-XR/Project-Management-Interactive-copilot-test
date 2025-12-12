# Project-Management-Interactive-copilot-test

Test repository for validating the Claude Code project management workflow with interactive sprint execution.

## Description

This repository serves as a sandbox for testing the **14-step Interactive Sprint Workflow** documented in the ELYSIUM project. It demonstrates how Claude Code can manage GitHub issues, project boards, and sprint execution through an interactive, confirmation-based process.

### Features Tested

- Sprint kickoff with user confirmation
- Task execution with real-time checklist updates
- Project board status transitions (Todo → In Progress → Testing → Review → Done)
- Sprint gates and completion verification
- Context compaction for long sprints
- Sprint resumption from previous sessions

## Installation

```bash
# Clone the repository
git clone https://github.com/Mythologi-XR/Project-Management-Interactive-copilot-test.git

# Navigate to the project directory
cd Project-Management-Interactive-copilot-test
```

## Usage

### Running the Interactive Sprint Workflow

1. **Start a sprint:**
   ```bash
   /phase 0    # Execute Sprint 0
   /phase 1    # Execute Sprint 1
   ```

2. **User signals during workflow:**
   - `yes` / `y` - Proceed with action
   - `no` / `n` - Hold/pause
   - `ready` - Task review complete
   - `verify` - Re-check completion
   - `compact` - Trigger context compaction

3. **Sprint resumption:**
   - `resume` - Continue from where you left off
   - `restart` - Reset and start fresh

### Project Structure

```
.
├── .claude/
│   └── config/
│       ├── project-board.json    # GitHub Project V2 configuration
│       └── sprints.json          # Sprint definitions and workflow settings
├── docs/
│   └── TEST-ARCHITECTURE-PLAN.md # Test architecture plan
└── README.md                      # This file
```

## Related Documentation

- [Interactive Sprint Workflow](https://github.com/Mythologi-XR/elysium-web-app/blob/main/docs/INTERACTIVE-SPRINT-WORKFLOW_v1.md)
- [Project Management Flow](https://github.com/Mythologi-XR/elysium-web-app/blob/main/docs/PROJECT-MANAGEMENT-FLOW_v1.md)

## License

MIT
