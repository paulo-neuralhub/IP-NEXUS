// ============================================================
// IP-NEXUS - NICE CLASS ICON MAP
// Maps icon name strings from DB to Lucide React components
// ============================================================

import type { LucideIcon } from 'lucide-react';
import {
  FlaskConical, Paintbrush, Sparkles, Droplet, Pill,
  Box, Cog, Wrench, Cpu, Stethoscope, Lightbulb, Car,
  Bomb, Gem, Music, FileText, Package, Briefcase, Building2,
  Sofa, UtensilsCrossed, Anchor, Scissors, LayoutGrid, Shirt,
  Ribbon, Square, Gamepad2, Beef, Cookie, Wheat, Beer,
  Wine, Cigarette, Megaphone, Landmark, HardHat, Radio,
  Truck, Factory, GraduationCap, Code, Hotel, Heart, Scale
} from 'lucide-react';

// Map DB icon names to Lucide components
export const NICE_ICON_MAP: Record<string, LucideIcon> = {
  'flask': FlaskConical,
  'flask-conical': FlaskConical,
  'paint-bucket': Paintbrush,
  'paintbrush': Paintbrush,
  'sparkles': Sparkles,
  'droplet': Droplet,
  'pill': Pill,
  'box': Box,
  'cog': Cog,
  'wrench': Wrench,
  'cpu': Cpu,
  'stethoscope': Stethoscope,
  'lightbulb': Lightbulb,
  'car': Car,
  'bomb': Bomb,
  'gem': Gem,
  'music': Music,
  'file-text': FileText,
  'package': Package,
  'briefcase': Briefcase,
  'building-2': Building2,
  'building2': Building2,
  'sofa': Sofa,
  'utensils-crossed': UtensilsCrossed,
  'anchor': Anchor,
  'scissors': Scissors,
  'layout-grid': LayoutGrid,
  'grid': LayoutGrid,
  'shirt': Shirt,
  'ribbon': Ribbon,
  'square': Square,
  'gamepad-2': Gamepad2,
  'gamepad2': Gamepad2,
  'beef': Beef,
  'cookie': Cookie,
  'wheat': Wheat,
  'beer': Beer,
  'wine': Wine,
  'cigarette': Cigarette,
  'megaphone': Megaphone,
  'landmark': Landmark,
  'hard-hat': HardHat,
  'hardhat': HardHat,
  'radio': Radio,
  'truck': Truck,
  'factory': Factory,
  'graduation-cap': GraduationCap,
  'code': Code,
  'hotel': Hotel,
  'heart': Heart,
  'scale': Scale,
};

// Fallback emoji icons (when no Lucide icon or unknown name)
export const NICE_CLASS_EMOJI: Record<number, string> = {
  1: '🧪', 2: '🎨', 3: '💄', 4: '🛢️', 5: '💊', 6: '🔩', 7: '⚙️', 8: '🔧',
  9: '📱', 10: '🩺', 11: '💡', 12: '🚗', 13: '🔫', 14: '💎', 15: '🎸',
  16: '📄', 17: '🧴', 18: '👜', 19: '🧱', 20: '🪑', 21: '🍳', 22: '🪢',
  23: '🧵', 24: '🧶', 25: '👕', 26: '🪡', 27: '🧺', 28: '🎮', 29: '🥩',
  30: '🍞', 31: '🌾', 32: '🍺', 33: '🍷', 34: '🚬', 35: '📢', 36: '🏦',
  37: '🏗️', 38: '📡', 39: '🚚', 40: '🏭', 41: '🎓', 42: '🔬', 43: '🍽️',
  44: '🏥', 45: '⚖️',
};

interface NiceIconProps {
  iconName?: string | null;
  classNumber: number;
  className?: string;
}

/**
 * Renders a Nice class icon - either from DB icon name or fallback emoji
 */
export function NiceIcon({ iconName, classNumber, className = "h-5 w-5" }: NiceIconProps) {
  // Try to get Lucide icon from name
  if (iconName) {
    const normalizedName = iconName.toLowerCase().trim();
    const IconComponent = NICE_ICON_MAP[normalizedName];
    
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
  }
  
  // Fallback to emoji
  const emoji = NICE_CLASS_EMOJI[classNumber] || '📦';
  return <span className="text-lg">{emoji}</span>;
}
