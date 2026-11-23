import React from 'react';
import { Award, Bird, Crown, Flame, Shield, Sparkles, Star, Zap } from 'lucide-react';
import { TeamTheme } from '../types/game';

interface TeamEmblemProps {
  emblem: TeamTheme['emblem'];
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TeamEmblem: React.FC<TeamEmblemProps> = ({ emblem, color, size = 'md' }) => {
  const dim =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 28 : 20;

  const renderIcon = () => {
    switch (emblem) {
      case 'garuda':
        return <Crown size={iconSize} strokeWidth={2.2} />;
      case 'rajawali':
        return <Flame size={iconSize} strokeWidth={2.2} />;
      case 'komodo':
        return <Shield size={iconSize} strokeWidth={2.2} />;
      case 'cenderawasih':
        return <Star size={iconSize} strokeWidth={2.2} />;
      case 'harimau':
        return <Zap size={iconSize} strokeWidth={2.2} />;
      case 'merpati':
        return <Bird size={iconSize} strokeWidth={2.2} />;
      case 'elang':
        return <Sparkles size={iconSize} strokeWidth={2.2} />;
      case 'banteng':
      default:
        return <Award size={iconSize} strokeWidth={2.2} />;
    }
  };

  return (
    <div
      className={`${dim} rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {renderIcon()}
    </div>
  );
};
