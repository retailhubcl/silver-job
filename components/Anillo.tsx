export default function Anillo() {
  return (
    <svg className="anillo" viewBox="0 0 32 32" aria-hidden="true">
      <g transform="rotate(-90 16 16)" fill="none" strokeWidth="5">
        <circle cx="16" cy="16" r="11" stroke="var(--vino)" strokeDasharray="19.4 49.7" />
        <circle cx="16" cy="16" r="11" stroke="var(--trigo)" strokeDasharray="19.4 49.7" strokeDashoffset="-23.04" />
        <circle cx="16" cy="16" r="11" stroke="var(--tinta)" strokeDasharray="19.4 49.7" strokeDashoffset="-46.08" />
      </g>
      <circle cx="16" cy="16" r="3.6" fill="currentColor" />
    </svg>
  );
}
