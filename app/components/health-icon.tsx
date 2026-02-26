import type { SiteIconName } from "@/app/config/site";
import type { SVGProps } from "react";

interface HealthIconProps {
  name: SiteIconName;
  size?: number;
  className?: string;
}

function IconShell({
  size,
  className,
  children,
}: {
  size: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

function StrokePath(props: SVGProps<SVGPathElement>) {
  return (
    <path
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export function HealthIcon({ name, size = 18, className }: HealthIconProps) {
  const mergedClassName = className ? `health-icon ${className}` : "health-icon";

  if (name === "leaf") {
    return (
      <IconShell size={size} className={mergedClassName}>
        <StrokePath d="M5 14C5 8.9 9.3 5 15 5C15 10.5 11.3 16 6.5 16" />
        <StrokePath d="M6 18C8.2 15.7 10.8 13.8 15 11.6" />
      </IconShell>
    );
  }

  if (name === "shield-check") {
    return (
      <IconShell size={size} className={mergedClassName}>
        <StrokePath d="M12 3L18.5 6V11.6C18.5 15.7 15.8 19.2 12 21C8.2 19.2 5.5 15.7 5.5 11.6V6L12 3Z" />
        <StrokePath d="M9 12.3L11 14.3L15.2 10.2" />
      </IconShell>
    );
  }

  if (name === "heart-pulse") {
    return (
      <IconShell size={size} className={mergedClassName}>
        <StrokePath d="M12 20C9.2 17.6 4.5 14.1 4.5 9.5C4.5 6.8 6.6 5 9 5C10.5 5 11.5 5.7 12 6.7C12.5 5.7 13.5 5 15 5C17.4 5 19.5 6.8 19.5 9.5C19.5 14.1 14.8 17.6 12 20Z" />
        <StrokePath d="M7.5 11.2H10L11.2 9L12.9 13L14 11.2H16.5" />
      </IconShell>
    );
  }

  if (name === "sparkles") {
    return (
      <IconShell size={size} className={mergedClassName}>
        <StrokePath d="M12 4L13.2 7.2L16.5 8.4L13.2 9.6L12 12.8L10.8 9.6L7.5 8.4L10.8 7.2L12 4Z" />
        <StrokePath d="M18 13.5L18.7 15.3L20.5 16L18.7 16.7L18 18.5L17.3 16.7L15.5 16L17.3 15.3L18 13.5Z" />
        <StrokePath d="M6 14.5L6.6 16.1L8.2 16.7L6.6 17.3L6 18.9L5.4 17.3L3.8 16.7L5.4 16.1L6 14.5Z" />
      </IconShell>
    );
  }

  if (name === "stethoscope") {
    return (
      <IconShell size={size} className={mergedClassName}>
        <StrokePath d="M8 5V10C8 12.2 9.8 14 12 14C14.2 14 16 12.2 16 10V5" />
        <StrokePath d="M6 5H10" />
        <StrokePath d="M14 5H18" />
        <StrokePath d="M12 14V16.2C12 18.3 13.7 20 15.8 20H16.5" />
        <StrokePath d="M19.5 20C19.5 21.1 18.6 22 17.5 22C16.4 22 15.5 21.1 15.5 20C15.5 18.9 16.4 18 17.5 18C18.6 18 19.5 18.9 19.5 20Z" />
      </IconShell>
    );
  }

  if (name === "sun") {
    return (
      <IconShell size={size} className={mergedClassName}>
        <StrokePath d="M12 7.2V4.2" />
        <StrokePath d="M12 19.8V16.8" />
        <StrokePath d="M6.5 12H3.8" />
        <StrokePath d="M20.2 12H17.5" />
        <StrokePath d="M7.9 7.9L5.9 5.9" />
        <StrokePath d="M18.1 18.1L16.1 16.1" />
        <StrokePath d="M16.1 7.9L18.1 5.9" />
        <StrokePath d="M5.9 18.1L7.9 16.1" />
        <StrokePath d="M15.5 12C15.5 13.9 13.9 15.5 12 15.5C10.1 15.5 8.5 13.9 8.5 12C8.5 10.1 10.1 8.5 12 8.5C13.9 8.5 15.5 10.1 15.5 12Z" />
      </IconShell>
    );
  }

  if (name === "moon") {
    return (
      <IconShell size={size} className={mergedClassName}>
        <StrokePath d="M15.9 4.8C13.6 5.7 12 8 12 10.6C12 14.2 14.9 17.1 18.5 17.1C18.7 17.1 18.9 17.1 19.2 17.1C17.8 19.4 15.3 20.9 12.5 20.9C8.1 20.9 4.5 17.3 4.5 12.9C4.5 8.7 7.7 5.3 11.8 4.9C13.1 4.8 14.5 4.8 15.9 4.8Z" />
      </IconShell>
    );
  }

  if (name === "sprout") {
    return (
      <IconShell size={size} className={mergedClassName}>
        <StrokePath d="M12 20V11.8" />
        <StrokePath d="M12 14C10 14 8.1 12.8 7.2 10.9C9.7 9.6 12.4 10.2 13.9 12.1" />
        <StrokePath d="M12 12.9C13.1 10.2 15.6 8.5 18.5 8.5C18.5 11.7 16 14.3 12.8 14.3" />
      </IconShell>
    );
  }

  return (
    <IconShell size={size} className={mergedClassName}>
      <StrokePath d="M9.3 3.8H14.7" />
      <StrokePath d="M10.2 3.8V6.8L6.2 14.2C5.4 15.7 6.5 17.5 8.2 17.5H15.8C17.5 17.5 18.6 15.7 17.8 14.2L13.8 6.8V3.8" />
      <StrokePath d="M8.8 12.8H15.2" />
    </IconShell>
  );
}
