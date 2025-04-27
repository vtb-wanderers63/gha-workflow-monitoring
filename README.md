# Workflow Run Monitor Action

This GitHub Action monitors the status of a workflow run for a specified duration and reports whether it completed successfully, failed, or timed out.

Useful for setting up chains of workflows where you need to wait for one workflow to finish before proceeding!

## Features

- Monitors a workflow run until it completes, fails, or times out.
- Authenticates securely using a GitHub App token.
- Outputs the final workflow status, workflow run url and conclusion message.

## Inputs

| Name | Description | Required | Default |
|:-----|:------------|:--------:|:-------:|
| `owner` | Owner of the repository where the workflow is located (defaults to current repository owner) | No | Current owner |
| `repo` | Name of the repository where the workflow is located (defaults to current repository) | No | Current repository |
| `workflow_run_id` | ID of the workflow run to monitor | **Yes** | - |
| `monitoring_duration` | Duration (in minutes) to monitor the workflow run | No | `8` |
| `app_id` | GitHub App ID used to generate a token | **Yes** | - |
| `private_key` | GitHub App private key used to generate a token | **Yes** | - |

## Outputs

| Name | Description |
|:-----|:------------|
| `workflow_run_status` | Status of the monitored workflow (`completed`, `failed`, or `timeout`) |
| `workflow_run_status_message` | A message describing the outcome |
| `workflow_run_url` | The workflow run url |

## Example Usage

```yaml
name: Monitor a Workflow Run

on:
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Monitor Workflow Run
        uses: vtb-wanderers63/gha-workflow-monitoring@v1
        with:
          owner: your-org
          repo: target-repo
          workflow_run_id: ${{ github.event.inputs.workflow_run_id }}
          monitoring_duration: 10
          app_id: ${{ secrets.GH_APP_ID }}
          private_key: ${{ secrets.GH_APP_PRIVATE_KEY }}

      - name: Output results
        run: |
          echo "Workflow Run Status: ${{ steps.monitor.outputs.workflow_run_status }}"
          echo "Workflow Run Message: ${{ steps.monitor.outputs.workflow_run_status_message }}"
          echo "Workflow Run Message: ${{ steps.monitor.outputs.workflow_run_url }}"