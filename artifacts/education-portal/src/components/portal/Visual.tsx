type VisualProps = {
  variant: 'hero' | 'people';
  caption: string;
  alt: string;
};

export function Visual({ variant, caption, alt }: VisualProps) {
  return (
    <div className={`visual visual-${variant}`} role="img" aria-label={alt}>
      <div className="visual-shape shape-a" />
      <div className="visual-shape shape-b" />
      <div className="visual-caption">{caption}</div>
    </div>
  );
}
