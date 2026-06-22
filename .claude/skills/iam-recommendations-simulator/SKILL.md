---
name: iam-recommendations-simulator
description: >-
  Simulates a batch of proposed IAM policy changes using Google Cloud Policy
  Simulator. Takes an array of simulations (resource, member, proposed_policy or
  proposed_policy_file), runs the simulation replay, and returns mapped results.
  Use when you have a batch of proposed IAM policy changes and need to
  simulate their impact on recent access patterns using Google Cloud Policy
  Simulator. Don't use for analyzing live IAM policies, applying policy
  changes, or simulating individual policy changes without a batch structure.
---

# IAM Policy Simulator (Batch Executor)

This skill simulates a single batch of proposed IAM policy changes using Google
Cloud Policy Simulator. It does not handle looping through multiple batches or
fallback logic; it focuses purely on executing the simulation for the provided
inputs.

## Input

The input must be a JSON object containing an array of simulations:

```json
{
  "simulations": [
    {
      "id": "sim_1",
      "resource": "//cloudresourcemanager.googleapis.com/projects/my-project",
      "member": "user:foo@bar.com",
      "proposed_policy": {
        "bindings": [
          {
            "role": "roles/viewer",
            "members": [
              "user:foo@bar.com"
            ]
          }
        ],
        "etag": "...",
        "version": 1
      }
    }
  ]
}
```

Each simulation object must have:

*   `id`: A unique identifier for the simulation (e.g., simulation name).
*   `resource`: The target resource full name (must start with `//`).
*   `member`: The principal (e.g. `user:`, `serviceAccount:`, `group:`).
*   `proposed_policy` / `proposed_policy_file`: Either a JSON object
    representing the proposed IAM policy (`proposed_policy`), or a string path
    to an existing local JSON policy file (`proposed_policy_file` or string path
    in `proposed_policy`).

## Procedures

### 1. Parse Input Batch

Identify the input batch of simulations from the user request:

*   **External File**: If the request specifies a file path (e.g.,
    `batch.json`), read its content using the `view_file` tool. Do NOT use
    `grep`, `find`, or shell commands to search for files.
*   **Inline Input**: If the simulation JSON array or object is provided
    directly inside the prompt text, parse it directly from context.

### 2. Verify APIs

Check if the required API is enabled on the active project:

*   `policysimulator.googleapis.com`

If not enabled, **do NOT enable it automatically**. Enabling APIs can incur
costs. You must halt and explicitly ask the user for confirmation: "The Policy
Simulator API (`policysimulator.googleapis.com`) is not enabled on this project.
Enabling it may incur costs. Do you authorize enabling this API?"

**CRITICAL: Fail Fast on API Checks**: If checking API status (e.g., via `gcloud
services list`) fails due to missing credentials, permission errors, or
sandboxed test restrictions, **do NOT attempt credential debugging, auth logins,
or custom verification scripts**. Halt execution immediately and explicitly ask
the user for authorization to enable the API.

Only execute the enable command after receiving explicit confirmation from the
user:

```bash
gcloud services enable policysimulator.googleapis.com
```

### 3. Prepare Policy Files

For each simulation in the input batch:

1.  Create a sanitized file identifier `{sim_id}` from `sim.id` (or index).
2.  For the proposed policy:
    *   If `sim.proposed_policy` is a JSON object, write it to disk as
        `/tmp/proposed_policy_SIM_ID.json` using native file-writing tools (or
        safe libraries). Set `PROPOSED_POLICY_PATH` to
        `/tmp/proposed_policy_SIM_ID.json`.
    *   If `sim.proposed_policy_file` (or `sim.proposed_policy` as a string
        path) is provided, verify the file exists on disk and set
        `PROPOSED_POLICY_PATH` directly to that file path.

### 4. Run Simulation (Fallback Flow)

Run the simulation using the proposed policies as overlays.

*   **Construct Overlay**: The overlay is a mapping of the full resource name to
    the proposed policy content.

Attempt the following simulation execution methods in order. Stop at the first
success.

**CRITICAL: Fail Fast on Errors** (To avoid redundant API calls that will fail
for the same authorization/permission reasons): If any attempted method (Option
A or Option B) fails with an API-level error (such as `PERMISSION_DENIED`,
`UNAUTHENTICATED`, `NOT_FOUND`, or `INVALID_ARGUMENT`) or a group membership
blocker, **do NOT attempt any further options** (including Option C or direct
API/curl calls). Stop immediately, do not call any more tools, and return the
structured JSON output with status FAILED or BLOCKED as specified in Output
Format.

#### Option A: MCP Tool (Preferred)

Use the MCP tool if available. MCP tools are designed for efficient, secure
execution within Google's internal environments, often providing streamlined
authentication and better integration compared to general-purpose CLI commands.

If an IAM Policy Simulator MCP tool is available in your context:

*   Call the tool with the simulation overlay parameters.

#### Option B: gcloud CLI (First Fallback)

If MCP is unavailable, execute the simulation replay command directly without
shell redirection or pipes:

```bash
gcloud iam simulator replay-recent-access FULL_RESOURCE_NAME PROPOSED_POLICY_PATH --format=json
```

Capture the JSON output directly in memory (or store it in
`/tmp/raw_result_SIM_ID.json` if needed). **IMPORTANT: Asynchronous Execution**:
If `run_command` sends the command to the background as a task, do NOT attempt
to read or view the task log URI (`task-*.log`); simply stop calling tools to
end your turn and wait for the system to automatically notify you when the
command completes. Do NOT use `grep`, `find`, or shell commands to wait for or
search for replay outputs.

#### Option C: Google Cloud API (Final Fallback)

Only attempt this option if `gcloud` is physically unavailable in the
environment (e.g., `gcloud: command not found`). API client libraries require
more setup and execution overhead, so they are only used as a last resort if CLI
tools are missing. Do NOT use this option if `gcloud` is available but failed
with an API error.

Use Google Cloud Policy Simulator API client libraries (or direct REST API calls
to `v1/projects/{project}/locations/global/replays` if libraries are
unavailable) to:

1.  Create the replay operation.
2.  Poll the operation until complete.
3.  Fetch the replay results.

### 5. Verify and Process Output

1.  **Check Command Success and Output Validity**:

    *   **Exit Status**: After running the simulation command, check its exit
        status. A non-zero exit status indicates a failure. If the command
        failed, return:
        *   `status`: `FAILED`
        *   `error`: `Simulation command failed for SIM_ID. Check logs for
            details.`
    *   **Valid JSON**: Verify that the command output (or
        `/tmp/raw_result_SIM_ID.json`) contains valid JSON. If not, return:
        *   `status`: `FAILED`
        *   `error`: `Invalid or missing simulation output.`
    *   **Expected Structure**: Parse the JSON. If it lacks expected fields like
        `replayResults`, return `FAILED`.

2.  **Check for Known Blockers**: Assuming the command succeeded and produced
    valid output:

    *   **Group Permissions**: Check if the target principal is a Google Group
        (e.g. `group:...`) and simulation fails with permission errors (or if
        output contains `PERMISSION_DENIED_ON_GROUP_MEMBERSHIP`). If so, return:
        *   `status`: `BLOCKED`
        *   `error`: `Missing permission to view group membership`
    *   **Unsupported Resources**: Check if simulation fails due to unsupported
        resource types (or warnings in output). If so, return:
        *   `status`: `FAILED`
        *   `error`: `Simulator does not yet support all resource types`

3.  **Map Results**: If output is valid and contains no blockers, the simulation
    is successful. Map `replayResults` back to the input simulations:

    *   For each input simulation (`sim`):
        *   Filter the simulator's `replayResults` where `accessTuple.principal`
            matches `sim.member` and `accessTuple.fullResourceName` matches
            `sim.resource`.
        *   Collect these matching results.
    *   Construct the output.

### 6. Cleanup

Delete any temporary policy files generated in Step 3
(`/tmp/proposed_policy_*.json`), result files (`/tmp/raw_result_*.json`), and
any python files used for simulation (`*.py`). Do not delete external
pre-existing policy files passed in via `proposed_policy_file`, to avoid data
loss of user-provided input files.

## Output Format

Return a JSON object:

```json
{
  "status": "SUCCESS | FAILED | BLOCKED",
  "error": "Error message if failed/blocked, otherwise null",
  "results": [
    {
      "id": "rec_1",
      "replay_results": [
        // Mapped replay results for this simulation
      ]
    }
  ]
}
```
