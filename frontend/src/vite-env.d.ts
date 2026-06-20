/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GraphQL endpoint — relative (proxied) in dev, same-origin in prod. */
  readonly VITE_GRAPHQL_URL: string;
  /** Cognito user pool id — from the Phase 3 Terraform outputs. */
  readonly VITE_COGNITO_USER_POOL_ID: string;
  /** Cognito app client id — from the Phase 3 Terraform outputs. */
  readonly VITE_COGNITO_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
