export type SyncErrorCode =
  | 'sync_not_configured'
  | 'github_auth_invalid'
  | 'github_permission_denied'
  | 'workflow_not_found'
  | 'workflow_config_invalid'
  | 'github_unavailable'
  | 'dispatch_failed'

const errorMessageKeys: Record<SyncErrorCode, string> = {
  sync_not_configured: 'sync.error.notConfigured',
  github_auth_invalid: 'sync.error.githubAuthInvalid',
  github_permission_denied: 'sync.error.githubPermissionDenied',
  workflow_not_found: 'sync.error.workflowNotFound',
  workflow_config_invalid: 'sync.error.workflowConfigInvalid',
  github_unavailable: 'sync.error.githubUnavailable',
  dispatch_failed: 'sync.error.dispatchFailed',
}

function isSyncErrorCode(value: unknown): value is SyncErrorCode {
  return typeof value === 'string' && Object.hasOwn(errorMessageKeys, value)
}

export async function readSyncError(
  response: Response,
  translate: (key: string) => string
) {
  const payload = await response.json().catch(() => ({})) as {
    code?: unknown
    error?: string
  }
  const messageKey = isSyncErrorCode(payload.code) ? errorMessageKeys[payload.code] : undefined
  return messageKey ? translate(messageKey) : payload.error || translate('sync.manualFailed')
}
