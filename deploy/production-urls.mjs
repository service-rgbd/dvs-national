/** URLs publiques de production (sans secrets). */
export const PRODUCTION_API_ORIGIN = 'https://api-dvs.voyagesdecouvertes-menaet.ci';

/** Origines frontend autorisées par CORS (Render dashboard → CORS_ORIGIN). */
export const PRODUCTION_CORS_ORIGINS = [
  'https://portail.voyagesdecouvertes-menaet.ci',
  'https://pnigvs-agents.pages.dev',
  'https://pnigvs-decouvrir.pages.dev',
  'https://pnigvs-portail.pages.dev',
  'http://localhost:26270',
].join(',');
