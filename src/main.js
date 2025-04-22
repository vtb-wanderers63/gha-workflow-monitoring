import { Octokit } from 'octokit';
import * as core from '@actions/core';
import * as github from '@actions/github';

try {
  // get GITHUB_TOKEN from the environment variables
  // get repositoruy name and owner from the inputs
  // get workflow_run_id from the inputs
  // get workflow_run_monitoring time duration in minutes from the inputs
  // while the workflow run is not completed and the time duration is not exceeded, after every 15 seconds:
  // - make get workflow run API call
  // - check the workflow run status
  // - if the workflow run status is completed, break the loop and set the output variables 'workflow_run_status' to 'completed' and variable 'workflow_run_status_message' to 'workflow run completed'
  // - if the workflow run status is in_progress, wait for 15 seconds
  // - if the workflow run status is queued, wait for 15 seconds
  // - if the workflow run status is in_failed, break the loop and set the output variables 'workflow_run_status' to 'failed' and variable 'workflow_run_status_message' to 'workflow run failed'
  // - if the workflow run status is in [in_progress,queued] and the time duration is exceeded, break the loop and set the output variables 'workflow_run_status' to 'timeout' and variable 'workflow_run_status_message' to 'workflow run timeout'
  // end the gha
} catch (error) {
  core.setFailed(error.message);
}


