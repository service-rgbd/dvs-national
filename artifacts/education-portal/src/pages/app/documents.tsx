import { ChangeEvent, FormEvent, useState } from 'react';
import { Building2, CalendarDays, ClipboardList, FolderOpen, Upload } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { AppPage } from '@/components/app/AppPage';
import { DocumentList } from '@/components/app/DocumentList';
import { DashStatBar } from '@/components/app/dashboard/DashStatBar';
import { AppProEmpty } from '@/components/app/pro/AppProEmpty';
import { AppProFilterTabs } from '@/components/app/pro/AppProFilterTabs';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { AppProPanel } from '@/components/app/pro/AppProPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DOCUMENT_CATEGORY_LABELS,
  documentCategories,
  type DocumentCategory,
} from '@/config/document-labels';
import { invalidateDocuments } from '@/lib/query-sync';
import {
  useAuthMe,
  useCreateDocument,
  useGetAppDashboard,
  useListAppDocuments,
} from '@workspace/api-client-react';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Lecture du fichier impossible.'));
        return;
      }
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Contenu du fichier invalide.'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Lecture du fichier impossible.'));
    reader.readAsDataURL(file);
  });
}

const FILTER_OPTIONS = [
  { value: '' as const, label: 'Tous' },
  ...documentCategories.map((item) => ({ value: item, label: DOCUMENT_CATEGORY_LABELS[item] })),
];

export default function AppDocumentsPage() {
  const queryClient = useQueryClient();
  const { data: authData } = useAuthMe();
  const { data: dashboard } = useGetAppDashboard();
  const roleCodes = authData?.user.roles.map((role) => role.code) ?? [];
  const canPublishPublic = roleCodes.some(
    (code) => code === 'dvs_director' || code === 'dvs_staff',
  );

  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('fichier_scolaire');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useListAppDocuments({
    page: 1,
    pageSize: 30,
    category: categoryFilter || undefined,
  });

  const createDocument = useCreateDocument({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
        await invalidateDocuments(queryClient);
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        setUploadError(null);
      },
    },
  });

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] ?? null);
    setUploadError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError(null);

    if (!selectedFile) {
      setUploadError('Sélectionnez un fichier à déposer.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError('Le fichier ne doit pas dépasser 5 Mo.');
      return;
    }

    try {
      const fileContentBase64 = await readFileAsBase64(selectedFile);
      createDocument.mutate({
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          isPublic: canPublishPublic ? isPublic : false,
          fileName: selectedFile.name,
          mimeType: selectedFile.type || 'application/octet-stream',
          fileContentBase64,
        },
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Impossible de lire le fichier.');
    }
  }

  const documents = data?.data ?? [];
  const totalDocuments = data?.pagination.total ?? documents.length;

  return (
    <AppPage
      title="Fichiers scolaires"
      description="Dépôt sécurisé, consultation et téléchargement des documents de vie scolaire."
    >
      <AppProPageShell>
        {dashboard ? (
          <DashStatBar
            items={[
              { label: 'Documents', value: totalDocuments, hint: 'Votre périmètre', icon: FolderOpen },
              { label: 'Établissements', value: dashboard.kpis.establishments, icon: Building2 },
              { label: 'Activités', value: dashboard.kpis.activities, icon: CalendarDays },
              {
                label: 'Demandes actives',
                value: dashboard.kpis.requestsPending + dashboard.kpis.requestsUnderReview,
                icon: ClipboardList,
              },
            ]}
          />
        ) : null}

        <div className="dash-workspace">
          <div className="dash-workspace-main">
            <AppProPanel title="Déposer un fichier" headingId="upload-document-heading">
              <form className="app-pro-form" onSubmit={handleSubmit}>
                <div className="form-field">
                  <label htmlFor="document-category">Catégorie</label>
                  <select
                    id="document-category"
                    className="app-pro-select"
                    value={category}
                    onChange={(event) => setCategory(event.target.value as DocumentCategory)}
                  >
                    {documentCategories.map((item) => (
                      <option key={item} value={item}>
                        {DOCUMENT_CATEGORY_LABELS[item]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="document-title">Titre</label>
                  <Input
                    id="document-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                    maxLength={500}
                    placeholder="Ex. Rapport d'activités — trimestre 1"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="document-description">Description (optionnel)</label>
                  <Input
                    id="document-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Contexte ou période concernée"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="document-file">Fichier (max. 5 Mo)</label>
                  <label htmlFor="document-file" className="app-pro-file-drop">
                    <Upload size={18} aria-hidden="true" />
                    <span>{selectedFile ? selectedFile.name : 'Choisir un fichier PDF, Word, Excel ou image'}</span>
                  </label>
                  <input
                    id="document-file"
                    type="file"
                    className="app-pro-file-input"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.json,.txt"
                    onChange={handleFileChange}
                    required
                  />
                  {selectedFile ? (
                    <p className="document-file-hint">
                      {selectedFile.name} ({Math.ceil(selectedFile.size / 1024)} Ko)
                    </p>
                  ) : null}
                </div>

                {canPublishPublic ? (
                  <label className="document-public-toggle">
                    <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} />
                    Publier sur la bibliothèque publique PNIGVS
                  </label>
                ) : null}

                {uploadError ? <p className="form-error">{uploadError}</p> : null}
                {createDocument.isError ? (
                  <p className="form-error">Le dépôt a échoué. Vérifiez le fichier et réessayez.</p>
                ) : null}

                <Button type="submit" disabled={createDocument.isPending} className="app-pro-submit">
                  {createDocument.isPending ? 'Dépôt en cours…' : 'Enregistrer le fichier'}
                </Button>
              </form>
            </AppProPanel>
          </div>

          <div className="dash-workspace-aside">
            <AppProPanel
              title="Bibliothèque"
              headingId="documents-list-heading"
              action={
                <AppProFilterTabs<DocumentCategory | ''>
                  options={FILTER_OPTIONS}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  ariaLabel="Filtrer par catégorie"
                />
              }
            >
              {isLoading ? <AppProLoading label="Chargement des documents…" inline /> : null}

              {isError ? (
                <AppProEmpty
                  title="Chargement impossible"
                  description="L'API documentaire est indisponible."
                  action={
                    <button type="button" className="btn-secondary" onClick={() => refetch()}>
                      Réessayer
                    </button>
                  }
                />
              ) : null}

              {!isLoading && !isError ? (
                <DocumentList
                  documents={documents}
                  emptyTitle="Aucun fichier dans cette catégorie"
                  emptyDescription="Déposez un document scolaire ou changez le filtre."
                />
              ) : null}
            </AppProPanel>
          </div>
        </div>
      </AppProPageShell>
    </AppPage>
  );
}
