import { Octokit } from 'octokit';
import * as core from '@actions/core';

async function run() {
  try {
    // Get GitHub token from environment variables
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN is required');
    }

    // Get repository owner and name from inputs

    const owner = process.env.OWNER || github.context.repo.owner;
    const repo = process.env.REPO || github.context.repo.repo;
    const workflow_run_id = process.env.WORKFLOW_RUN_ID;

    // Get workflow run ID from inputs or environment
    const workflowRunId = process.env.WORKFLOW_RUN_ID;
    if (!workflowRunId) {
      throw new Error('workflow_run_id is required');
    }

    // Get monitoring duration in minutes
    const monitoringDurationMinutes = parseInt(
      process.env.WORKFLOW_RUN_MONITORING_DURATION || '8',
      10
    );
    const monitoringDurationMs = monitoringDurationMinutes * 60 * 1000;

    // Set up Octokit client
    const octokit = new Octokit({ auth: token });

    // Set up monitoring variables
    const startTime = Date.now();
    const checkIntervalMs = 15000; // 15 seconds
    let isCompleted = false;

    core.info(
      `Starting to monitor workflow run ${workflowRunId} for ${monitoringDurationMinutes} minutes...`
    );

    // Monitor loop
    while (!isCompleted && Date.now() - startTime < monitoringDurationMs) {
      try {
        // Get workflow run status

        const { data: workflowRun } = await octokit.request(
          'GET /repos/{owner}/{repo}/actions/runs/{run_id}',
          {
            owner: owner,
            repo: repo,
            run_id: workflow_run_id,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }
        );

        const status = workflowRun.status;
        const conclusion = workflowRun.conclusion;

        core.info(`Current status: ${status}, conclusion: ${conclusion || 'N/A'}`);

        // Check status and take appropriate action
        if (status === 'completed') {
          if (conclusion === 'success') {
            core.setOutput('workflow_run_url', workflowRun.html_url);
            core.setOutput('workflow_run_status', 'completed');
            core.setOutput('workflow_run_status_message', 'Workflow run completed successfully');
          } else {
            core.setOutput('workflow_run_url', workflowRun.html_url);
            core.setOutput('workflow_run_status', 'failed');
            core.setOutput(
              'workflow_run_status_message',
              `Workflow run failed with conclusion: ${conclusion}`
            );
          }
          isCompleted = true;
        } else if (status === 'in_progress' || status === 'queued') {
          // Continue monitoring
          await new Promise((resolve) => setTimeout(resolve, checkIntervalMs));
        } else {
          // Unexpected status
          core.setOutput('workflow_run_url', workflowRun.html_url);
          core.setOutput('workflow_run_status', 'failed');
          core.setOutput(
            'workflow_run_status_message',
            `Workflow run in unexpected status: ${status}`
          );
          isCompleted = true;
        }
      } catch (apiError) {
        core.warning(`Error fetching workflow run status: ${apiError.message}`);
        await new Promise((resolve) => setTimeout(resolve, checkIntervalMs));
      }
    }

    // Check if monitoring timed out
    if (!isCompleted) {
      core.setOutput('workflow_run_status', 'timeout');
      core.setOutput(
        'workflow_run_status_message',
        `Workflow run monitoring timed out after ${monitoringDurationMinutes} minutes`
      );
      core.warning('Workflow run monitoring timed out');
    }
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();
