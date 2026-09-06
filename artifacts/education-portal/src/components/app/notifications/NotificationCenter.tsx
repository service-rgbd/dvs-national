import { useQueryClient } from '@tanstack/react-query';

import { AppResourceLink } from '@/components/app/navigation/AppResourceLink';
import type { RequestActorKind } from '@/config/request-permissions';
import {
  formatNotificationDate,
  notificationHref,
  type NotificationGroup,
  type NotificationRecord,
} from '@/lib/notifications';
import { prefetchRequestDetail } from '@/lib/prefetch-app-data';

type NotificationCenterProps = {
  groups: NotificationGroup[];
  kind: RequestActorKind;
  emptyLabel: string;
  onMarkRead: (id: string) => void;
};

export function NotificationCenter({
  groups,
  kind,
  emptyLabel,
  onMarkRead,
}: NotificationCenterProps) {
  const queryClient = useQueryClient();

  if (groups.length === 0) {
    return <p className="notif-center-empty">{emptyLabel}</p>;
  }

  return (
    <div className="notif-center" data-actor={kind}>
      {groups.map((group) => {
        const unread = group.items.filter((item) => !item.isRead).length;

        return (
          <section className="notif-center-group" key={group.id} aria-labelledby={`notif-group-${group.id}`}>
            <header className="notif-center-head">
              <h2 id={`notif-group-${group.id}`}>{group.title}</h2>
              <span className={`notif-center-count${unread > 0 ? ' is-unread' : ''}`}>
                {unread > 0
                  ? `${unread.toLocaleString('fr-FR')} non lue${unread > 1 ? 's' : ''}`
                  : `${group.items.length.toLocaleString('fr-FR')}`}
              </span>
            </header>

            <ul className="notif-center-list">
              {group.items.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onMarkRead={onMarkRead}
                  prefetch={
                    notification.resourceType === 'request' && notification.resourceId
                      ? () => prefetchRequestDetail(queryClient, notification.resourceId!)
                      : undefined
                  }
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function NotificationRow({
  notification,
  onMarkRead,
  prefetch,
}: {
  notification: NotificationRecord;
  onMarkRead: (id: string) => void;
  prefetch?: () => void;
}) {
  const href = notificationHref(notification);

  return (
    <li className={notification.isRead ? 'is-read' : 'is-unread'}>
      <AppResourceLink
        href={href}
        className="notif-center-row notif-center-row--link"
        ariaLabel={notification.title}
        prefetch={prefetch}
        onNavigate={() => {
          if (!notification.isRead) onMarkRead(notification.id);
        }}
      >
        <NotificationBody notification={notification} />
      </AppResourceLink>
      {!notification.isRead ? (
        <button type="button" className="notif-center-mark" onClick={() => onMarkRead(notification.id)}>
          Marquer lue
        </button>
      ) : (
        <span className="notif-center-read">Lue</span>
      )}
    </li>
  );
}

function NotificationBody({ notification }: { notification: NotificationRecord }) {
  return (
    <div className="notif-center-main">
      <div className="notif-center-title">
        {!notification.isRead ? <span className="notif-center-badge">Non lue</span> : null}
        <strong>{notification.title}</strong>
      </div>
      {notification.body ? <p>{notification.body}</p> : null}
      <time dateTime={notification.createdAt}>{formatNotificationDate(notification.createdAt)}</time>
    </div>
  );
}
