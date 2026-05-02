export default function NELCBadge() {
  return (
    <div 
      className="flex justify-center items-center"
      dangerouslySetInnerHTML={{
        __html: `<!-- NELC Entity Verification Badge -->
<iframe
  src="https://services.futurex.sa/entity-badge?code=In0nMIrPxIi9YTjE"
  width="250"
  height="60"
  referrerpolicy="unsafe-url"
  style="border: none;"
  title="NELC Verified Entity"
></iframe>`
      }}
    />
  );
}
