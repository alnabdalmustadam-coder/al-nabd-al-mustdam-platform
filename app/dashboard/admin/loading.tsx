import { BrandLoadingScreen } from '@/components/ui/BrandLoadingScreen';

export default function AdminLoading() {
  return (
    <BrandLoadingScreen
      message="جاري تحميل لوحة الإدارة المركزية..."
      subMessage="التحقق من التراخيص وسجلات النظام"
    />
  );
}
