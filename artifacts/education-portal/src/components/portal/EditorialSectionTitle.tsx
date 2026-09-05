type EditorialSectionTitleProps = {
  title: string;
  id?: string;
};

export function EditorialSectionTitle({ title, id }: EditorialSectionTitleProps) {
  return (
    <div className="editorial-section-title">
      <h2 id={id}>{title.toUpperCase()}</h2>
      <span className="editorial-section-accent" aria-hidden="true" />
    </div>
  );
}
