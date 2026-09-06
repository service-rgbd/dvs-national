import { Mail } from 'lucide-react';

import { getRequestActorKind } from '@/config/request-permissions';
import { liveQueryHookOptions } from '@/lib/query-sync';
import { useAuthMe, useGetAppDashboard } from '@workspace/api-client-react';

type DrenContactButtonProps = {
  variant?: 'nav' | 'chip' | 'sheet';
};

function drenMailto(email: string, fullName?: string, userEmail?: string, scopeLabel?: string): string {
  const subject = encodeURIComponent('[PNIGVS] Message à la DREN');
  const body = encodeURIComponent(
    ['', '', fullName ? `— ${fullName}` : '', userEmail ?? '', scopeLabel ? `Périmètre : ${scopeLabel}` : '']
      .filter(Boolean)
      .join('\n'),
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

export function DrenContactButton({ variant = 'nav' }: DrenContactButtonProps) {
  const { data: auth } = useAuthMe();
  const { data: dashboard } = useGetAppDashboard(liveQueryHookOptions());
  const profile = dashboard?.profile;
  const actorKind = getRequestActorKind(profile?.primaryRoleCode ?? '');
  const email = profile?.drenaContactEmail?.trim() || null;

  if (actorKind === 'drena' || !email) {
    return null;
  }

  const href = drenMailto(email, auth?.user.fullName, auth?.user.email, profile?.scopeLabel);
  const label = 'Contacter la DREN';

  if (variant === 'chip') {
    return (
      <a href={href} className="dash-chip-btn profile-dren-btn">
        <Mail size={14} aria-hidden="true" />
        {label}
      </a>
    );
  }

  if (variant === 'sheet') {
    return (
      <a href={href} className="dash-sheet-action">
        <Mail size={16} aria-hidden="true" />
        {label}
      </a>
    );
  }

  return (
    <a href={href} className="dash-icon-btn dash-dren-btn" title={label} aria-label={label}>
      <Mail size={16} aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
}
