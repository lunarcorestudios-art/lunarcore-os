export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <circle cx="16" cy="16" r="15" fill="currentColor" opacity="0.12" />
      <path
        d="M18.2 7.2a9 9 0 1 0 7.2 14.8A7.4 7.4 0 1 1 18.2 7.2z"
        fill="currentColor"
      />
    </svg>
  );
}
