// src/components/common/Charts.tsx
import React, { useState } from 'react';

// ==================== KPI STAT CARD ====================
interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number; // percentage, e.g. +12 or -4
    isPositive?: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  color?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'indigo'
}) => {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 font-display">{value}</h3>
        </div>
        {icon && (
          <div className={`p-2.5 rounded-lg border ${colorMap[color]}`}>
            {icon}
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="mt-3 flex items-center text-xs text-slate-500 gap-2">
          {trend && (
            <span className={`inline-flex items-center font-semibold px-1.5 py-0.5 rounded ${
              trend.value >= 0 
                ? 'bg-emerald-50 text-emerald-700' 
                : 'bg-rose-50 text-rose-700'
            }`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
          <span>{trend?.label || subtitle}</span>
        </div>
      )}
    </div>
  );
};

// ==================== INTERACTIVE LINE / AREA CHART ====================
interface LineChartProps {
  data: { label: string; value: number; secondaryValue?: number }[];
  primaryLabel?: string;
  secondaryLabel?: string;
  height?: number;
  showArea?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  primaryLabel = 'Value',
  secondaryLabel,
  height = 200,
  showArea = true
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No trend data available</div>;
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.secondaryValue || 0)), 10);
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = 500;
  const chartHeight = height;

  const getX = (index: number) => paddingX + (index / (data.length - 1 || 1)) * (chartWidth - paddingX * 2);
  const getY = (val: number) => chartHeight - paddingY - (val / maxValue) * (chartHeight - paddingY * 2);

  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const areaPoints = `${getX(0)},${chartHeight - paddingY} ${points} ${getX(data.length - 1)},${chartHeight - paddingY}`;

  const secondaryPoints = secondaryLabel 
    ? data.map((d, i) => `${getX(i)},${getY(d.secondaryValue || 0)}`).join(' ') 
    : '';

  return (
    <div className="w-full relative">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = chartHeight - paddingY - pct * (chartHeight - paddingY * 2);
          const gridVal = Math.round(pct * maxValue);
          return (
            <g key={i}>
              <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
              <text x={paddingX - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#94a3b8">{gridVal}</text>
            </g>
          );
        })}

        {/* Area fill */}
        {showArea && (
          <polygon points={areaPoints} fill="url(#primaryAreaGrad)" />
        )}

        {/* Primary Line */}
        <polyline
          fill="none"
          stroke="#4f46e5"
          strokeWidth="2.5"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Secondary Line if present */}
        {secondaryLabel && (
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4 4"
            points={secondaryPoints}
            strokeLinecap="round"
          />
        )}

        {/* Data points & hover triggers */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.value);
          const isHovered = hoveredIndex === i;

          return (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 3.5}
                fill={isHovered ? '#312e81' : '#4f46e5'}
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-all"
              />
              <text x={cx} y={chartHeight - 8} textAnchor="middle" fontSize="10" fill="#64748b">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="absolute z-10 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(getX(hoveredIndex) / chartWidth) * 100}%`,
            top: `${(getY(data[hoveredIndex].value) / chartHeight) * 100}%`,
          }}
        >
          <div className="font-semibold">{data[hoveredIndex].label}</div>
          <div className="text-indigo-300">{primaryLabel}: {data[hoveredIndex].value}</div>
          {secondaryLabel && (
            <div className="text-emerald-300">{secondaryLabel}: {data[hoveredIndex].secondaryValue || 0}</div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-indigo-600 rounded"></span>
          <span>{primaryLabel}</span>
        </div>
        {secondaryLabel && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 rounded border-dashed border-b border-emerald-500"></span>
            <span>{secondaryLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== BAR CHART ====================
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value), 5);

  return (
    <div className="w-full" style={{ height }}>
      <div className="h-full flex items-end gap-3 pt-6 pb-6 px-2">
        {data.map((item, index) => {
          const heightPercent = Math.max(8, (item.value / maxValue) * 100);
          return (
            <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group">
              <span className="text-[11px] font-semibold text-slate-600 mb-1 opacity-80 group-hover:opacity-100">
                {item.value}
              </span>
              <div 
                className="w-full max-w-[42px] rounded-t-md transition-all duration-300 group-hover:brightness-110"
                style={{ 
                  height: `${heightPercent}%`, 
                  backgroundColor: item.color || '#6366f1' 
                }}
              />
              <span className="text-[10px] text-slate-500 mt-2 truncate max-w-[56px] text-center" title={item.label}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== DONUT CHART ====================
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, size = 180 }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {data.map((item, i) => {
            const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle;
            accumulatedAngle += (item.value / total) * circumference;

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 hover:opacity-80"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-bold font-display text-slate-900">{total}</span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Total</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 text-xs">
        {data.map((item, i) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 font-medium">{item.label}:</span>
              <span className="font-bold text-slate-900 ml-auto">{item.value} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
