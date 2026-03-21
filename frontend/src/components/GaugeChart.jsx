import { useState, useEffect } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

const getColor = (score) => {
  if (score >= 70) return '#10b981';  // green
  if (score >= 40) return '#f59e0b';  // amber
  return '#ef4444';                   // red
};

const getLabel = (score) => {
  if (score >= 70) return 'Strong';
  if (score >= 40) return 'Moderate';
  return 'Needs Work';
};

export default function GaugeChart({ score = 0, size = 200 }) {
  const pct = Math.round(Math.min(100, Math.max(0, score * 100)));
  const color = getColor(pct);
  const label = getLabel(pct);

  const data = [{ value: pct, fill: color }];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size / 1.3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="85%"
            innerRadius="60%" outerRadius="100%"
            startAngle={180} endAngle={0}
            data={data}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            {/* Background track */}
            <RadialBar
              background={{ fill: 'rgba(255,255,255,0.05)' }}
              dataKey="value"
              angleAxisId={0}
              data={[{ value: 100, fill: 'rgba(255,255,255,0.06)' }]}
              cornerRadius={6}
            />
            {/* Score bar */}
            <RadialBar
              dataKey="value"
              angleAxisId={0}
              cornerRadius={6}
              isAnimationActive={true}
              animationDuration={1400}
              animationEasing="ease-out"
            />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div style={{
          position: 'absolute', bottom: -4, left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>
            {pct}%
          </div>
          <div style={{
            fontSize: '0.75rem', fontWeight: 600,
            color, opacity: 0.8,
            background: `${color}22`, borderRadius: 100,
            padding: '2px 10px', marginTop: 4,
          }}>
            {label}
          </div>
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 8, textAlign: 'center' }}>
        AI Success Score
      </p>
    </div>
  );
}
