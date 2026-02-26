import { FlaskConical, HandHeart, Leaf, Sparkles } from "lucide-react";

interface HerbalLoaderProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function HerbalLoader({
  title = "Brewing your wellness blend",
  subtitle = "Picking herbs, infusing in a beaker, and creating gut-cleansing magic...",
  compact = false,
}: HerbalLoaderProps) {
  return (
    <div className={`herbal-loader${compact ? " herbal-loader--compact" : ""}`} role="status" aria-live="polite">
      <div className="herbal-loader-scene" aria-hidden="true">
        <HandHeart className="herbal-loader-hand" size={28} />
        <Leaf className="herbal-loader-leaf herbal-loader-leaf--one" size={17} />
        <Leaf className="herbal-loader-leaf herbal-loader-leaf--two" size={15} />
        <Leaf className="herbal-loader-leaf herbal-loader-leaf--three" size={13} />
        <FlaskConical className="herbal-loader-beaker" size={42} />
        <Sparkles className="herbal-loader-spark herbal-loader-spark--one" size={14} />
        <Sparkles className="herbal-loader-spark herbal-loader-spark--two" size={11} />
      </div>
      <p className="herbal-loader-title">{title}</p>
      <p className="herbal-loader-subtitle">{subtitle}</p>
    </div>
  );
}
