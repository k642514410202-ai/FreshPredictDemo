import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  CloudFog,
} from 'lucide-react';

interface WeatherIconProps {
  name: string;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Sun':
      return <Sun className={`${className} text-amber-500`} />;
    case 'CloudSun':
      return <CloudSun className={`${className} text-amber-400`} />;
    case 'Cloud':
      return <Cloud className={`${className} text-slate-400`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={`${className} text-sky-400`} />;
    case 'CloudRain':
    case 'CloudRainWind':
      return <CloudRain className={`${className} text-blue-500`} />;
    case 'CloudLightning':
      return <CloudLightning className={`${className} text-purple-600`} />;
    case 'CloudFog':
      return <CloudFog className={`${className} text-slate-400`} />;
    default:
      return <Sun className={`${className} text-amber-500`} />;
  }
};
