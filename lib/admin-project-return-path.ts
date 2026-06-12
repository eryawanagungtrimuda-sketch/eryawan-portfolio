export const adminProjectReturnPaths = ['/admin/dashboard', '/admin/projects'] as const;

export type AdminProjectReturnPath = (typeof adminProjectReturnPaths)[number];

export const defaultAdminProjectReturnPath: AdminProjectReturnPath = '/admin/projects';

export function getSafeAdminProjectReturnPath(returnTo: string | null | undefined): AdminProjectReturnPath {
  return adminProjectReturnPaths.includes(returnTo as AdminProjectReturnPath)
    ? (returnTo as AdminProjectReturnPath)
    : defaultAdminProjectReturnPath;
}

export function getAdminProjectReturnToParam(returnTo: AdminProjectReturnPath) {
  return `returnTo=${encodeURIComponent(returnTo)}`;
}

export function getAdminProjectCreateHref(returnTo: AdminProjectReturnPath) {
  return `/admin/projects/new?${getAdminProjectReturnToParam(returnTo)}`;
}

export function getAdminProjectEditHref(projectId: string, returnTo: AdminProjectReturnPath) {
  return `/admin/projects/${projectId}/edit?${getAdminProjectReturnToParam(returnTo)}`;
}
