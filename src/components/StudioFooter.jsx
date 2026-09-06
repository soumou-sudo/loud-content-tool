import StudioBrand from '@/components/StudioBrand';

export default function StudioFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <StudioBrand compact />
        <p className="text-xs text-muted-foreground">Your words. A wider world.</p>
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">© {new Date().getFullYear()} Loud Content Tool</p>
      </div>
    </footer>
  );
}