export type MediaPublicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "published"
  | "rejected"
  | "cancelled";

export type MediaWorkflowAction =
  | "submit"
  | "review"
  | "approve"
  | "publish"
  | "reject"
  | "cancel";

type MediaTransitionRule = {
  action: MediaWorkflowAction;
  from: MediaPublicationStatus[];
  to: MediaPublicationStatus;
  roles: string[];
};

export const MEDIA_WORKFLOW_TRANSITIONS: MediaTransitionRule[] = [
  {
    action: "submit",
    from: ["draft"],
    to: "submitted",
    roles: [
      "school_head_primary",
      "school_head_secondary",
      "education_officer",
      "dvs_director",
      "dvs_staff",
    ],
  },
  {
    action: "review",
    from: ["submitted"],
    to: "under_review",
    roles: ["drena_manager", "dvs_director", "dvs_staff"],
  },
  {
    action: "approve",
    from: ["under_review"],
    to: "approved",
    roles: ["dvs_director", "dvs_staff"],
  },
  {
    action: "publish",
    from: ["approved"],
    to: "published",
    roles: ["dvs_director", "dvs_staff"],
  },
  {
    action: "reject",
    from: ["submitted", "under_review", "approved"],
    to: "rejected",
    roles: ["drena_manager", "dvs_director", "dvs_staff"],
  },
  {
    action: "cancel",
    from: ["draft", "submitted"],
    to: "cancelled",
    roles: [
      "school_head_primary",
      "school_head_secondary",
      "education_officer",
      "dvs_director",
      "dvs_staff",
    ],
  },
];

export function findMediaTransition(
  action: MediaWorkflowAction,
  currentStatus: MediaPublicationStatus,
): MediaTransitionRule | undefined {
  return MEDIA_WORKFLOW_TRANSITIONS.find(
    (rule) => rule.action === action && rule.from.includes(currentStatus),
  );
}

export const MEDIA_PUBLICATION_STATUS_LABELS: Record<MediaPublicationStatus, string> = {
  draft: "Brouillon",
  submitted: "Soumis",
  under_review: "En analyse",
  approved: "Validé DVS",
  published: "Publié",
  rejected: "Rejeté",
  cancelled: "Annulé",
};

export const MEDIA_WORKFLOW_ACTION_LABELS: Record<MediaWorkflowAction, string> = {
  submit: "Soumettre à la DREN",
  review: "Prendre en analyse",
  approve: "Valider le contenu",
  publish: "Publier sur le site",
  reject: "Rejeter",
  cancel: "Annuler",
};

export const PHOTO_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
/** Durée maximale vidéo — 3 minutes (règle métier PNIGVS). */
export const MAX_VIDEO_DURATION_SECONDS = 180;
/** Taille max indicative (fallback) — la durée prime sur la taille. */
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const MAX_FILES_PER_PUBLICATION = 12;
