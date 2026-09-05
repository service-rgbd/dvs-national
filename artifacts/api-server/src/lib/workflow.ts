export type RequestStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "forwarded"
  | "approved"
  | "rejected"
  | "cancelled"
  | "archived"
  | "returned_for_correction";

export type WorkflowAction =
  | "submit"
  | "review"
  | "forward"
  | "approve"
  | "reject"
  | "cancel"
  | "return_for_correction"
  | "resubmit"
  | "revoke";

type TransitionRule = {
  action: WorkflowAction;
  from: RequestStatus[];
  to: RequestStatus;
  roles: string[];
};

export const WORKFLOW_TRANSITIONS: TransitionRule[] = [
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
    action: "resubmit",
    from: ["returned_for_correction"],
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
    action: "forward",
    from: ["under_review"],
    to: "forwarded",
    roles: ["drena_manager", "dvs_director", "dvs_staff"],
  },
  {
    action: "approve",
    from: ["under_review", "forwarded"],
    to: "approved",
    roles: ["dvs_director", "dvs_staff"],
  },
  {
    action: "return_for_correction",
    from: ["submitted", "under_review", "forwarded"],
    to: "returned_for_correction",
    roles: ["dvs_director", "dvs_staff"],
  },
  {
    action: "reject",
    from: ["submitted", "under_review", "forwarded"],
    to: "rejected",
    roles: ["dvs_director", "dvs_staff"],
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
  {
    action: "revoke",
    from: ["approved"],
    to: "cancelled",
    roles: ["dvs_director", "dvs_staff"],
  },
];

export function findTransition(
  action: WorkflowAction,
  currentStatus: RequestStatus,
): TransitionRule | undefined {
  return WORKFLOW_TRANSITIONS.find(
    (rule) => rule.action === action && rule.from.includes(currentStatus),
  );
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  draft: "Brouillon",
  submitted: "Soumis",
  under_review: "En analyse",
  forwarded: "Transmis à la DVS",
  approved: "Validé",
  rejected: "Rejeté",
  cancelled: "Annulé",
  archived: "Archivé",
  returned_for_correction: "Renvoyé pour correction",
};

export const WORKFLOW_ACTION_LABELS: Record<WorkflowAction, string> = {
  submit: "Soumettre",
  resubmit: "Resoumettre à la DREN",
  review: "Prendre en analyse",
  forward: "Transmettre à la DVS",
  approve: "Valider",
  return_for_correction: "Renvoyer pour correction",
  reject: "Rejeter définitivement",
  cancel: "Annuler",
  revoke: "Révoquer l'activité",
};
