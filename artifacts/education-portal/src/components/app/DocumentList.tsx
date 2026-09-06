import { Download, FileText, Plus } from 'lucide-react';

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
  isPublic?: boolean;
  downloadUrl: string;
  createdAt: string | Date;
};

type DocumentListProps = {
  documents: DocumentItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  onDeposit?: () => void;
};

function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function DocumentList({
  documents,
  emptyTitle = 'Aucun document',
  emptyDescription = 'Aucun fichier disponible pour cette sélection.',
  onDeposit,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="document-empty" role="status">
        <FileText aria-hidden="true" />
        <p className="document-empty-title">{emptyTitle}</p>
        <p className="document-empty-desc">{emptyDescription}</p>
        {onDeposit ? (
          <button type="button" className="dash-chip-btn" onClick={onDeposit}>
            <Plus size={14} aria-hidden="true" />
            Déposer un fichier
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <ul className="document-grid">
      {documents.map((document) => (
        <li key={document.id} className="document-card">
          <div className="document-card-icon" aria-hidden="true">
            <FileText size={18} />
          </div>
          <div className="document-card-body">
            <div className="document-card-tags">
              <span className="document-category-badge">
                {DOCUMENT_CATEGORY_LABELS[document.category as DocumentCategory] ?? document.category}
              </span>
              {document.isPublic ? (
                <span className="dash-status dash-status--success">Public</span>
              ) : (
                <span className="dash-status dash-status--neutral">Interne</span>
              )}
            </div>
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
            <Download size={15} aria-hidden="true" />
            Télécharger
          </a>
        </li>
      ))}
    </ul>
  );
}
