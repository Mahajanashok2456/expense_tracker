import React from 'react';
// Fix: Import HelpCircle directly to use as a fallback icon.
import { icons, LucideProps, HelpCircle } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const LucideIcon = icons[name as keyof typeof icons];

  if (!LucideIcon) {
    // Fallback icon
    // Fix: Use the directly imported HelpCircle component to prevent type errors.
    return <HelpCircle {...props} />;
  }

  return <LucideIcon {...props} />;
};

export default DynamicIcon;
