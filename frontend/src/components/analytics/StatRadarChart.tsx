"use client"

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import { CHART_COLORS } from "@/lib/constants"
import type { StatDistribution } from "@/lib/types"

interface StatRadarChartProps {
  data: StatDistribution[]
}

const STAT_LABELS: Record<string, string> = {
  FITNESS: "Fitness",
  CODING: "Coding",
  LEARNING: "Learning",
  FINANCES: "Finances",
  COMMUNICATION: "Comm.",
  DISCIPLINE: "Discipline",
}

interface TooltipPayload {
  value: number
  payload: StatDistribution
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayload[]
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  if (!item) return null
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-lg"
      style={{
        backgroundColor: CHART_COLORS.tooltipBg,
        borderColor: CHART_COLORS.tooltipBorder,
      }}
    >
      <p className="font-medium text-slate-300">
        {STAT_LABELS[item.payload.stat_name] ?? item.payload.stat_name}
      </p>
      <p className="font-bold text-blue-400">{item.value}</p>
    </div>
  )
}

export default function StatRadarChart({ data }: StatRadarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">No stat data yet.</p>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    stat: STAT_LABELS[d.stat_name] ?? d.stat_name,
    value: d.value,
    stat_name: d.stat_name,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
        <PolarGrid stroke={CHART_COLORS.gridLines} />
        <PolarAngleAxis
          dataKey="stat"
          tick={{ fill: CHART_COLORS.axisText, fontSize: 11 }}
        />
        <Radar
          dataKey="value"
          stroke={CHART_COLORS.radarStroke}
          fill={CHART_COLORS.radarFill}
          strokeWidth={2}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
