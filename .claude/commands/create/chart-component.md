---
description: Create a reusable Recharts wrapper component
argument-hint: [chart-type]
---

Create a Recharts wrapper component: **$1**

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/chart-component-builder.md

## Reference

- Architecture Plan: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md (Phase 4)
- Unified Architecture: @docs/UNIFIED-COMPONENT-ARCHITECTURE.md (Phase 4)
- Tech: Recharts 3.2.1

## Available Chart Types

| Type | Component | Description |
|------|-----------|-------------|
| `line` | LineChartWrapper | Time series, trends |
| `bar` | BarChartWrapper | Comparisons, categories |
| `pie` | PieChartWrapper | Proportions, distributions |
| `area` | AreaChartWrapper | Cumulative values |
| `tooltip` | ChartTooltip | Shared tooltip component |

## Directory

All chart components go in: `src/components/charts/`

---

## LineChartWrapper Example

Create `src/components/charts/LineChartWrapper.jsx`:

```javascript
import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import ChartTooltip from './ChartTooltip';

const DEFAULT_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'];

function LineChartWrapper({
  data,
  lines,
  xDataKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = false,
  valueFormatter,
  className,
}) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-separator)" />
          )}
          <XAxis
            dataKey={xDataKey}
            stroke="var(--color-label-secondary)"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="var(--color-label-secondary)"
            fontSize={12}
            tickLine={false}
            tickFormatter={valueFormatter}
          />
          <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
          {showLegend && <Legend />}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name || line.dataKey}
              stroke={line.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

LineChartWrapper.propTypes = {
  data: PropTypes.array.isRequired,
  lines: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string,
      color: PropTypes.string,
    })
  ).isRequired,
  xDataKey: PropTypes.string,
  height: PropTypes.number,
  showGrid: PropTypes.bool,
  showLegend: PropTypes.bool,
  valueFormatter: PropTypes.func,
  className: PropTypes.string,
};

export default LineChartWrapper;
```

---

## ChartTooltip Component

Create `src/components/charts/ChartTooltip.jsx`:

```javascript
import PropTypes from 'prop-types';

function ChartTooltip({ active, payload, label, valueFormatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-surface-elevated border border-separator rounded-lg p-3 shadow-elevation-3">
      <p className="text-body-sm font-medium text-label-primary mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-body-sm">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-label-secondary">{entry.name}:</span>
          <span className="text-label-primary font-medium">
            {valueFormatter ? valueFormatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

ChartTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
  valueFormatter: PropTypes.func,
};

export default ChartTooltip;
```

---

## BarChartWrapper Example

Create `src/components/charts/BarChartWrapper.jsx`:

```javascript
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import ChartTooltip from './ChartTooltip';

const DEFAULT_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'];

function BarChartWrapper({
  data,
  bars,
  xDataKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = false,
  horizontal = false,
  stacked = false,
  valueFormatter,
  className,
}) {
  const ChartComponent = BarChart;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-separator)" />
          )}
          {horizontal ? (
            <>
              <XAxis type="number" tickFormatter={valueFormatter} />
              <YAxis dataKey={xDataKey} type="category" width={80} />
            </>
          ) : (
            <>
              <XAxis dataKey={xDataKey} />
              <YAxis tickFormatter={valueFormatter} />
            </>
          )}
          <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
          {showLegend && <Legend />}
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name || bar.dataKey}
              fill={bar.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              stackId={stacked ? 'stack' : undefined}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

BarChartWrapper.propTypes = {
  data: PropTypes.array.isRequired,
  bars: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string,
      color: PropTypes.string,
    })
  ).isRequired,
  xDataKey: PropTypes.string,
  height: PropTypes.number,
  showGrid: PropTypes.bool,
  showLegend: PropTypes.bool,
  horizontal: PropTypes.bool,
  stacked: PropTypes.bool,
  valueFormatter: PropTypes.func,
  className: PropTypes.string,
};

export default BarChartWrapper;
```

---

## Barrel Export

Create `src/components/charts/index.js`:

```javascript
export { default as ChartTooltip } from './ChartTooltip';
export { default as LineChartWrapper } from './LineChartWrapper';
export { default as BarChartWrapper } from './BarChartWrapper';
export { default as PieChartWrapper } from './PieChartWrapper';
export { default as AreaChartWrapper } from './AreaChartWrapper';
```

---

## Usage Example

```javascript
import { LineChartWrapper } from '../components/charts';
import { formatCompactNumber } from '../utils/formatters';

function AnalyticsDashboard() {
  const data = [
    { date: 'Mon', visitors: 1200, unique: 800 },
    { date: 'Tue', visitors: 1800, unique: 1200 },
    // ...
  ];

  return (
    <LineChartWrapper
      data={data}
      lines={[
        { dataKey: 'visitors', name: 'Total Visitors', color: '#8b5cf6' },
        { dataKey: 'unique', name: 'Unique Visitors', color: '#06b6d4' },
      ]}
      xDataKey="date"
      height={300}
      showLegend
      valueFormatter={formatCompactNumber}
    />
  );
}
```

## Verification

```bash
npm run lint
npm run build
```

## Success Criteria

- [ ] Chart component created in `src/components/charts/`
- [ ] Uses Recharts ResponsiveContainer
- [ ] Supports dark mode via CSS variables
- [ ] Has prop-types validation
- [ ] Exported from barrel file
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
