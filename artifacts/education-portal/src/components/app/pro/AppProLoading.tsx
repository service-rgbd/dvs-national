import { Loader2 } from 'lucide-react';

type AppProLoadingProps = {
  label?: string;
  inline?: boolean;
};

export function AppProLoading({
  label = 'Chargement…',
  inline = false,
}: AppProLoadingProps) {
  return (
    <div className={inline ? 'dash-loading dash-loading-inline' : 'dash-loading'} role="status">
      <Loader2 className="animate-spin" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
