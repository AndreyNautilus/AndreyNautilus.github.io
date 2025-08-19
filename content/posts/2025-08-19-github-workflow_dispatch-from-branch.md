---
title: Send workflow_dispatch event to not-default branch
summary: gh workflow run manual_workflow.yaml --repo my_org/my_repo --ref side_branch  # will be shown on a post card on the main page
date: 2025-08-19T21:38:24+02:00

tags: [github actions, workflow_dispatch]
---

GitHub Actions allows to define `workflow_dispatch`
[workflow trigger](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch):

```yaml
on:
  workflow_dispatch:  # manual trigger
```

This event allows to _manually_ trigger the workflow via UI, rest API call or [CLI](https://cli.github.com/manual/gh_workflow_run).
But according to the [docs](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch):

> This event will only trigger a workflow run if the workflow file exists on the default branch

which is quite inconvenient during development of workflows, or when a workflow must be triggered on a side/release/hotfix branch,
or when actions in the workflow rely on specific triggers.

## Solution

Contrary to what documentation says, it's actually possible to send `workflow_dispatch` event to a workflow,
which does not exist on the default branch.

**Prerequisite**: the workflow must run at least once. For example, temporary add a `pull_request` trigger
to the workflow, create a PR and let the workflow to start. After that `pull_request` trigger can be removed.

[Use CLI](https://cli.github.com/manual/gh_workflow_run) to send the event to the side branch:

```bash
export GITHUB_TOKEN=YOUR_GITHUB_TOKEN
gh workflow run manual_workflow.yaml --repo my_org/my_repo --ref side_branch
```

and go to "Actions" tab of your repo to watch the workflow run.
