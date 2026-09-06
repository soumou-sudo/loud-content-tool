import { Link } from 'react-router-dom';

export default function StudioBrand({ compact = false }) {
  return (
    <Link to="/" aria-label="Loud Content Tool home" className="flex items-center gap-3 text-foreground">
      <span aria-hidden="true" className="flex h-9 w-9 items-end justify-center gap-1 bg-primary p-2 text-primary-foreground">
        <span className="h-3 w-1 bg-current" /><span className="h-5 w-1 bg-current" /><span className="h-4 w-1 bg-current" />
      </span>
      <span className="font-heading text-2xl font-bold leading-none tracking-[-0.06em]">LOUD<span className="text-primary">.</span></span>
      {!compact && <span className="hidden border-l border-border pl-3 text-[10px] font-medium uppercase leading-relaxed tracking-[0.14em] xl:block">Content<br />studio</span>}
    </Link>
  );
}