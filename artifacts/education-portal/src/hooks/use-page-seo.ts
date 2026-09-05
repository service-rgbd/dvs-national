import { useEffect } from 'react';

import { institution } from '@/config/institution';

type PageSeoOptions = {
  title: string;
  description?: string;
};

export function usePageSeo({ title, description }: PageSeoOptions) {
  useEffect(() => {
    const fullTitle = title.includes(institution.platform.name)
      ? title
      : `${title} — ${institution.platform.name}`;

    document.title = fullTitle;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [title, description]);
}
