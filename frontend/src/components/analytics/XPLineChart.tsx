"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { CHART_COLORS } from "@/lib/constants"
import type { XPDataPoint } from "@/lib/types"

interface XPLineChartProps {
  data: XPDataPoint[]
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

interface TooltipPayload {
  value: number
  payload: XPDataPoint
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-lg"
      style={{
        backgroundColor: CHART_COLORS.tooltipBg,
        borderColor: CHART_COLORS.tooltipBorder,
      }}
    >
      <p className="mb-1 font-medium text-slate-300">{label ? formatDate(label) : ""}</p>
      <p className="font-bold text-blue-400">{payload[0]?.value ?? 0} XP</p>
    </div>
  )
}

export default function XPLineChart({ data }: XPLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center">
        <p className="text-sm text-slate-500">No XP data yet.</p>
      </div>
    )
  }

  // Show every 7th label to avoid crowding on mobile
  const tickInterval = Math.max(0, Math.floor(data.length / 5) - 1)

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={CHART_COLORS.gridLines}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          interval={tickInterval}
          tick={{ fill: CHART_COLORS.axisText, fontSize: 11 }}
          axisLine={{ stroke: CHART_COLORS.gridLines }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: CHART_COLORS.axisText, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="xp"
          stroke={CHART_COLORS.xpLine}
          strokeWidth={2}
          dot={{ fill: CHART_COLORS.xpLine, r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: CHART_COLORS.xpLine }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
