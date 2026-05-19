import Svg, {
  Circle,
  Line,
  Path,
  Polyline,
  Rect,
} from 'react-native-svg';

interface Props {
  size?: number;
}

export default function Logo({ size = 80 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {/* Background rounded square */}
      <Rect width="200" height="200" rx="40" fill="#1e3a5f" />

      {/* Passport book body */}
      <Rect x="52" y="54" width="72" height="90" rx="8" fill="#2563eb" />
      {/* Passport spine */}
      <Rect x="52" y="54" width="11" height="90" rx="4" fill="#1d4ed8" />

      {/* Passport text lines */}
      <Line x1="70" y1="76" x2="116" y2="76" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
      <Line x1="70" y1="90" x2="116" y2="90" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />

      {/* Photo box */}
      <Rect x="70" y="103" width="22" height="22" rx="3" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="1.5" />
      {/* Photo head */}
      <Circle cx="81" cy="109" r="4" fill="#93c5fd" />
      {/* Photo shoulders */}
      <Path d="M73,125 Q81,118 89,125" fill="#93c5fd" />

      {/* Shield overlay */}
      <Path d="M118,112 L152,96 L152,124 Q152,148 118,162 Q84,148 84,124 L84,96 Z" fill="#059669" />

      {/* Checkmark in shield */}
      <Polyline
        points="103,130 115,142 142,112"
        fill="none"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
