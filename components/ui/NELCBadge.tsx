export default function NELCBadge() {
  return (
    <div className="fixed bottom-4 right-4 md:bottom-10 md:right-10 z-50">
      {/* NELC Entity Verification Badge */}
      <iframe
        src="https://services.futurex.sa/entity-badge?code=In0nMIrPxIi9YTjE"
        width="250"
        height="60"
        referrerPolicy="unsafe-url"
        style={{ border: "none" }}
        title="NELC Verified Entity"
      />
    </div>
  );
}
