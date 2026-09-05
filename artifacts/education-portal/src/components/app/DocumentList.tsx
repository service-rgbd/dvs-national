import { Download, FileText } from 'lucide-react';

import {
  DOCUMENT_CATEGORY_LABELS,
  formatFileSize,
  type DocumentCategory,
} from '@/config/document-labels';

type DocumentItem = {
  id: string;
  title: string;
  description?: string | null;
  category: DocumentCategory;
  fileName: string;
  sizeBytes?: number | null;
  downloadUrl: string;
  createdAt: string;
};

type DocumentListProps = {
  documents: DocumentItem[];
  emptyTitle?: string;
  emptyDescription?: string;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function DocumentList({
  documents,
  emptyTitle = 'Aucun document',
  emptyDescription = 'Aucun fichier disponible pour cette sélection.',
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="document-empty" role="status">
        <FileText aria-hidden="true" />
        <p className="document-empty-title">{emptyTitle}</p>
        <p className="document-empty-desc">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <ul className="document-grid">
      {documents.map((document) => (
        <li key={document.id} className="document-card">
          <div className="document-card-icon" aria-hidden="true">
            <FileText />
          </div>
          <div className="document-card-body">
            <span className="document-category-badge">
              {DOCUMENT_CATEGORY_LABELS[document.category as DocumentCategory] ?? document.category}
            </span>
            <h3 className="document-card-title">{document.title}</h3>
            {document.description ? (
              <p className="document-card-desc">{document.description}</p>
            ) : null}
            <p className="document-card-meta">
              {document.fileName} · {formatFileSize(document.sizeBytes)} · {formatDate(document.createdAt)}
            </p>
          </div>
          <a
            className="document-download-btn"
            href={document.downloadUrl}
            download={document.fileName}
          >
            <Download aria-hidden="true" />
            Télécharger
          </a>
        </li>
      ))}
    </ul>
  );
}
