import type { SVGProps } from 'react';

type Bar3DShapeProps = SVGProps<SVGRectElement> & {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
};

const DEPTH = 5;

function shadeColor(hex: string, amount: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return hex;
  const num = Number.parseInt(normalized, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 255) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 255) + amount));
  const b = Math.min(255, Math.max(0, (num & 255) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function ChartBar3DShape(props: Bar3DShapeProps) {
  const { x = 0, y = 0, width = 0, height = 0, fill = '#008751' } = props;

  if (width <= 0 || height <= 0) {
    return <g />;
  }

  const topFill = shadeColor(fill, 40);
  const sideFill = shadeColor(fill, -35);

  return (
    <g className="chart-bar-3d">
      <path
        d={`M${x + width} ${y} L${x + width + DEPTH} ${y - DEPTH} L${x + width + DEPTH} ${y + height - DEPTH} L${x + width} ${y + height} Z`}
        fill={sideFill}
      />
      <path
        d={`M${x} ${y} L${x + DEPTH} ${y - DEPTH} L${x + width + DEPTH} ${y - DEPTH} L${x + width} ${y} Z`}
        fill={topFill}
      />
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={1} />
    </g>
  );
}

export function Chart3DDefs({ id, color }: { id: string; color: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={shadeColor(color, 30)} />
        <stop offset="100%" stopColor={color} />
      </linearGradient>
    </defs>
  );
}
