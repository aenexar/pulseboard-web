import { Framework } from "@/types";
import { Monitor, Smartphone } from "lucide-react";
import {
  siReact,
  siExpo,
  siFlutter,
  siIonic,
  siAndroid,
  siApple,
  siAngular,
  siVuedotjs,
  siNextdotjs,
  siNuxt,
  siElectron,
  siLinux,
} from "simple-icons";

const FRAMEWORK_ICONS: Partial<
  Record<Framework, { path: string; hex: string }>
> = {
  "react-native-cli": siReact,
  "react-native-expo": siExpo,
  flutter: siFlutter,
  ionic: siIonic,
  android: siAndroid,
  ios: siApple,
  macos: siApple,
  react: siReact,
  angular: siAngular,
  vue: siVuedotjs,
  nextjs: siNextdotjs,
  nuxt: siNuxt,
  electron: siElectron,
  linux: siLinux,
};

// Frameworks not available in simple-icons — use Lucide fallbacks
const LUCIDE_FALLBACKS: Partial<Record<Framework, React.ElementType>> = {
  windows: Monitor,
  xamarin: Smartphone,
};

interface FrameworkIconProps {
  framework: Framework;
  size?: number;
  className?: string;
  colored?: boolean;
}

export function FrameworkIcon({
  framework,
  size = 16,
  className,
  colored = true,
}: FrameworkIconProps) {
  const LucideIcon = LUCIDE_FALLBACKS[framework];
  if (LucideIcon) {
    return <LucideIcon width={size} height={size} className={className} />;
  }

  const icon = FRAMEWORK_ICONS[framework];
  if (!icon) return null;

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={colored ? `#${icon.hex}` : "currentColor"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={icon.path} />
    </svg>
  );
}
