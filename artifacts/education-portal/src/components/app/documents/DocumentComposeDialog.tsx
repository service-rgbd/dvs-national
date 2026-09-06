import { ChangeEvent, FormEvent, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  DOCUMENT_CATEGORY_LABELS,
  documentCategories,
  type DocumentCategory,
} from '@/config/document-labels';
import { invalidateDocuments } from '@/lib/query-sync';
import { useCreateDocument } from '@workspace/api-client-react';

type DocumentComposeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canPublishPublic: boolean;
};

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

export function DocumentComposeDialog({
  open,
  onOpenChange,
  canPublishPublic,
}: DocumentComposeDialogProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('fichier_scolaire');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [createdTitle, setCreatedTitle] = useState<string | null>(null);

  const createDocument = useCreateDocument({
    mutation: {
      onSuccess: async (_result, variables) => {
        await queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
        await invalidateDocuments(queryClient);
        setCreatedTitle(variables.data.title);
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        setIsPublic(false);
        setUploadError(null);
      },
    },
  });

  function resetAndClose() {
    setCreatedTitle(null);
    setUploadError(null);
    onOpenChange(false);
  }

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

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          resetAndClose();
          return;
        }
        onOpenChange(true);
      }}
    >
      <DialogContent className="document-compose-dialog" aria-describedby="document-compose-desc">
        {createdTitle ? (
          <div className="activity-compose-success">
            <CheckCircle2 size={28} aria-hidden="true" />
            <DialogHeader>
              <DialogTitle>Fichier déposé</DialogTitle>
              <DialogDescription id="document-compose-desc">
                {createdTitle} est disponible dans la bibliothèque de votre périmètre.
              </DialogDescription>
            </DialogHeader>
            <button type="button" className="dash-chip-btn" onClick={resetAndClose}>
              Fermer
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Déposer un fichier</DialogTitle>
              <DialogDescription id="document-compose-desc">
                PDF, Word, Excel ou image — 5 Mo maximum.
              </DialogDescription>
            </DialogHeader>

            <form className="app-pro-form document-compose-form" onSubmit={handleSubmit}>
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
                <label htmlFor="document-file">Fichier</label>
                <label htmlFor="document-file" className="app-pro-file-drop">
                  <Upload size={18} aria-hidden="true" />
                  <span>
                    {selectedFile ? selectedFile.name : 'Choisir un fichier PDF, Word, Excel ou image'}
                  </span>
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
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(event) => setIsPublic(event.target.checked)}
                  />
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
