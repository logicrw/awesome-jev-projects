/** Stable trusted review policy identity. Secrets and unrelated Git commits are excluded. */
import { createHash } from 'node:crypto';
export const MATERIAL_REVIEW_POLICY = 'material-v3';
export function reviewPolicyRevision({
  model = process.env.DEEPSEEK_MODEL || 'deepseek-flash',
  endpoint = process.env.DEEPSEEK_ENDPOINT || 'https://api.deepseek.com/chat/completions',
  configRevision = process.env.REVIEW_CONFIG_REVISION ?? process.env.RADAR_REVIEW_REVISION ?? '',
  providerConfigured = process.env.REVIEW_PROVIDER_CONFIGURED ?? 'unspecified',
} = {}) {
  const availability = providerConfigured === true || providerConfigured === 'true' ? 'configured'
    : providerConfigured === false || providerConfigured === 'false' ? 'unconfigured' : 'unspecified';
  return createHash('sha256').update(JSON.stringify({ policy: MATERIAL_REVIEW_POLICY, model, endpoint, configRevision, availability })).digest('hex');
}
