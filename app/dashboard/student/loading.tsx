import { BrandLoadingScreen } from '@/components/ui/BrandLoadingScreen';

export default function StudentLoading() {
  return (
    <BrandLoadingScreen
      message="جاري تحميل بيانات المتدرب..."
      subMessage="لحظات ويكون ملفك الأكاديمي جاهزاً"
    />
  );
}
