import type { ActivitySummary } from "../repositories/activities";
import type {
  MediaPublicationDetail,
  MediaPublicationSummary,
} from "../repositories/media-publications";
import type { RequestDetail, RequestSummary } from "../repositories/requests";

export function serializeActivity(activity: ActivitySummary) {
  return {
    ...activity,
    scheduledAt: activity.scheduledAt?.toISOString() ?? null,
    createdAt: activity.createdAt.toISOString(),
  };
}

export function serializeRequestSummary(request: RequestSummary) {
  return {
    ...request,
    submittedAt: request.submittedAt?.toISOString() ?? null,
    decidedAt: request.decidedAt?.toISOString() ?? null,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };
}

export function serializeRequestDetail(request: RequestDetail) {
  return {
    ...serializeRequestSummary(request),
    history: request.history.map((entry) => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
    })),
    allowedActions: request.allowedActions,
  };
}

export function serializeMediaPublicationSummary(publication: MediaPublicationSummary) {
  return {
    ...publication,
    submittedAt: publication.submittedAt?.toISOString() ?? null,
    approvedAt: publication.approvedAt?.toISOString() ?? null,
    publishedAt: publication.publishedAt?.toISOString() ?? null,
    incidentReportedAt: publication.incidentReportedAt?.toISOString() ?? null,
    createdAt: publication.createdAt.toISOString(),
    updatedAt: publication.updatedAt.toISOString(),
  };
}

export function serializeMediaPublicationDetail(publication: MediaPublicationDetail) {
  return {
    ...serializeMediaPublicationSummary(publication),
    files: publication.files,
    history: publication.history.map((entry) => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
    })),
    allowedActions: publication.allowedActions,
  };
}

export function serializeNotification(notification: {
  id: string;
  type: string;
  title: string;
  body: string | null;
  resourceType: string | null;
  resourceId: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    resourceType: notification.resourceType,
    resourceId: notification.resourceId,
    isRead: notification.isRead,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  };
}
