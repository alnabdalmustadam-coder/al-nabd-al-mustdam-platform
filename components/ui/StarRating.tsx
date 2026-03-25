interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function StarRating({ rating, size = "md", className = "" }: StarRatingProps) {
  const sizeMap = { sm: 14, md: 18, lg: 22 };
  const s = sizeMap[size];
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <div className={`flex items-center gap-0.5 ${className}`} dir="ltr">
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f-${i}`} width={s} height={s} viewBox="0 0 24 24" fill="#E8A020" stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {hasHalf && (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="none">
          <defs>
            <linearGradient id="halfGrad">
              <stop offset="50%" stopColor="#E8A020" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#halfGrad)" />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e-${i}`} width={s} height={s} viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)" stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}
