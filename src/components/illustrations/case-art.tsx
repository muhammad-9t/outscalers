import Image from "next/image";
import type { CaseStudy } from "@/content/case-studies";
import { CaseVisual } from "@/components/illustrations/case-visual";
import { cn } from "@/lib/cn";

/** A case study's artwork: the real product cover when there is one, otherwise the diagram. */
export function CaseArt({ study, className, priority }: { study: CaseStudy; className?: string; priority?: boolean }) {
  if (!study.cover) return <CaseVisual visual={study.visual} className={className} />;
  return (
    <div className={cn("relative aspect-[400/220] overflow-hidden rounded-lg bg-ink-900", className)}>
      <Image
        src={study.cover.src}
        alt={study.cover.alt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
    </div>
  );
}
