import { relations } from 'drizzle-orm';

import { permissions, rolePermissions, roles, userRoles, users } from './auth';
import { conversationParticipants, conversations, messages, notifications } from './comms';
import { ddena, drena, localities } from './directorates';
import { documents, reports } from './documents';
import { departments, regions } from './geo';
import { establishments } from './establishments';
import { activities, requestStatusHistory, requests } from './workflow';

export const regionsRelations = relations(regions, ({ many }) => ({
  departments: many(departments),
  drena: many(drena),
  ddena: many(ddena),
  localities: many(localities),
  establishments: many(establishments),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  region: one(regions, { fields: [departments.regionId], references: [regions.id] }),
  localities: many(localities),
  establishments: many(establishments),
}));

export const drenaRelations = relations(drena, ({ one, many }) => ({
  region: one(regions, { fields: [drena.regionId], references: [regions.id] }),
  ddena: many(ddena),
  localities: many(localities),
  establishments: many(establishments),
}));

export const ddenaRelations = relations(ddena, ({ one, many }) => ({
  region: one(regions, { fields: [ddena.regionId], references: [regions.id] }),
  drena: one(drena, { fields: [ddena.drenaId], references: [drena.id] }),
  establishments: many(establishments),
}));

export const localitiesRelations = relations(localities, ({ one, many }) => ({
  region: one(regions, { fields: [localities.regionId], references: [regions.id] }),
  department: one(departments, { fields: [localities.departmentId], references: [departments.id] }),
  drena: one(drena, { fields: [localities.drenaId], references: [drena.id] }),
  establishments: many(establishments),
}));

export const establishmentsRelations = relations(establishments, ({ one, many }) => ({
  region: one(regions, { fields: [establishments.regionId], references: [regions.id] }),
  drena: one(drena, { fields: [establishments.drenaId], references: [drena.id] }),
  ddena: one(ddena, { fields: [establishments.ddenaId], references: [ddena.id] }),
  department: one(departments, { fields: [establishments.departmentId], references: [departments.id] }),
  locality: one(localities, { fields: [establishments.localityId], references: [localities.id] }),
  activities: many(activities),
  requests: many(requests),
}));

export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(rolePermissions),
  users: many(userRoles),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, { fields: [rolePermissions.permissionId], references: [permissions.id] }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [activities.establishmentId],
    references: [establishments.id],
  }),
  requests: many(requests),
}));

export const requestsRelations = relations(requests, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [requests.establishmentId],
    references: [establishments.id],
  }),
  activity: one(activities, { fields: [requests.activityId], references: [activities.id] }),
  history: many(requestStatusHistory),
}));

export const requestStatusHistoryRelations = relations(requestStatusHistory, ({ one }) => ({
  request: one(requests, { fields: [requestStatusHistory.requestId], references: [requests.id] }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
  participants: many(conversationParticipants),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const documentsRelations = relations(documents, ({ many }) => ({
  reports: many(reports),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  document: one(documents, { fields: [reports.documentId], references: [documents.id] }),
}));
