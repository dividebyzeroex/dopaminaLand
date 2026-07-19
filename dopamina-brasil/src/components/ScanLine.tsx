'use client';

export default function ScanLine() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
      <div
        className="absolute left-0 right-0 h-[2px] animate-scan-line"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(204,255,0,0.04), transparent)',
        }}
      />
    </div>
  );
}
