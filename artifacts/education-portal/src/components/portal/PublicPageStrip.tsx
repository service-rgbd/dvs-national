type PublicPageStripProps = {
  title: string;
  summary?: string;
};

/** En-tête éditorial réduit — titre + résumé sur une ligne. */
export function PublicPageStrip({ title, summary }: PublicPageStripProps) {
  return (
    <header className="public-page-strip" aria-labelledby="public-page-strip-title">
      <h1 id="public-page-strip-title">{title}</h1>
      {summary ? <p className="public-page-strip-summary">{summary}</p> : null}
    </header>
  );
}
