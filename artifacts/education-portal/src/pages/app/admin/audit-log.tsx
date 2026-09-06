import { AdminActivityTrace } from '@/components/app/admin/AdminActivityTrace';
import { AdminShell } from '@/components/app/admin/AdminShell';

export default function AdminAuditPage() {
  return (
    <AdminShell sectionId="audit">
      <AdminActivityTrace />
    </AdminShell>
  );
}
