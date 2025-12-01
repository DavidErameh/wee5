import { requireAuth } from '@/lib/auth';
import { XpConfigurationForm } from '@/components/XpConfigurationForm/XpConfigurationForm';

export default async function XpConfigPage({ params }: { params: { companyId: string } }) {
  const { companyId } = await params;
  const authResult = await requireAuth(new Request('http://localhost'), companyId);
  if (!authResult.success) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">XP Configuration</h1>
      <XpConfigurationForm experienceId={companyId} />
    </div>
  );
}