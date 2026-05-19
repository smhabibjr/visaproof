import Svg, {
  Circle,
  Line,
  Path,
  Polyline,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

interface Props {
  width?: number;
}

// viewBox is 320×80 — height scales proportionally
export default function Wordmark({ width = 200 }: Props) {
  const height = Math.round(width * (80 / 320));

  return (
    <Svg width={width} height={height} viewBox="0 0 320 80">
      {/* ── Mini icon ─────────────────────────────── */}
      {/* Background square */}
      <Rect x="4" y="4" width="72" height="72" rx="14" fill="#1e3a5f" />

      {/* Passport book */}
      <Rect x="18" y="16" width="26" height="34" rx="3" fill="#2563eb" />
      {/* Passport spine */}
      <Rect x="18" y="16" width="4" height="34" rx="2" fill="#1d4ed8" />

      {/* Passport lines */}
      <Line x1="25" y1="23" x2="40" y2="23" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="25" y1="29" x2="40" y2="29" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" />

      {/* Photo box */}
      <Rect x="25" y="34" width="8" height="8" rx="1" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="1" />
      {/* Photo head */}
      <Circle cx="29" cy="36" r="1.5" fill="#93c5fd" />
      {/* Photo shoulders */}
      <Path d="M26,42 Q29,39 32,42" fill="#93c5fd" />

      {/* Shield */}
      <Path d="M43,38 L58,32 L58,44 Q58,55 43,61 Q28,55 28,44 L28,32 Z" fill="#059669" />
      {/* Checkmark in shield */}
      <Polyline
        points="36,46 42,52 54,37"
        fill="none"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── Wordmark text ──────────────────────────── */}
      {/* "VISA" label */}
      <SvgText
        x="92"
        y="34"
        fontFamily="Arial, sans-serif"
        fontSize="13"
        fontWeight="400"
        fill="#64748b"
        letterSpacing="2"
      >
        VISA
      </SvgText>

      {/* "Proof" main text */}
      <SvgText
        x="90"
        y="58"
        fontFamily="Arial, sans-serif"
        fontSize="26"
        fontWeight="700"
        fill="#1e3a5f"
        letterSpacing="1"
      >
        Proof
      </SvgText>

      {/* Accent circle on the "o" in Proof */}
      <Circle cx="238" cy="32" r="7" fill="#2563eb" opacity="0.15" />
      {/* Checkmark inside accent circle */}
      <Polyline
        points="233,32 237,37 244,26"
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Tagline */}
      <SvgText
        x="92"
        y="74"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fill="#94a3b8"
        letterSpacing="0.5"
      >
        Verify before you trust
      </SvgText>
    </Svg>
  );
}
