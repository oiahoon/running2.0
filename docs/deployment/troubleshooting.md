# Deployment Troubleshooting Pointer

Use [../agentic/deployment-ci.md](../agentic/deployment-ci.md) for current deployment and CI troubleshooting.

Most common current failure mode:
- Vercel accidentally runs raw `next build` instead of `npm run build`.

Expected fix:
- Keep `apps/web/vercel.json` and project settings aligned to `npm run build`.

