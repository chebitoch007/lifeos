"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { CHART_COLORS } from "@/lib/constants"
import type { QuestCompletionRate } from "@/lib/types"

interface QuestCompletionDonutProps {
  data: QuestCompletionRate
}

interface TooltipPayload {
  name: string
  value: number
  payload: { fill: string }
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
      <p className="font-medium text-slate-300">{item.name}</p>
      <p className="font-bold" style={{ color: item.payload.fill }}>
        {item.value} quests
      </p>
    </div>
  )
}

// Center label rendered as a custom label element
function CenterLabel({
  cx,
  cy,
  rate,
}: {
  cx: number
  cy: number
  rate: number
}) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
      <tspan
        x={cx}
        dy="-0.3em"
        fontSize="22"
        fontWeight="bold"
        fill="white"
      >
        {Math.round(rate * 100)}%
      </tspan>
      <tspan x={cx} dy="1.4em" fontSize="11" fill={CHART_COLORS.axisText}>
        completed
      </tspan>
    </text>
  )
}

export default function QuestCompletionDonut({ data }: QuestCompletionDonutProps) {
  const { total, completed, abandoned, completion_rate } = data

  if (total === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center">
        <p className="text-sm text-slate-500">No quest data yet.</p>
      </div>
    )
  }

  const active = total - completed - abandoned

  const segments = [
    { name: "Completed", value: completed, fill: CHART_COLORS.donutCompleted },
    { name: "Abandoned", value: abandoned, fill: CHART_COLORS.donutAbandoned },
    { name: "Active", value: active, fill: CHART_COLORS.donutActive },
  ].filter((s) => s.value > 0)

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={segments}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          dataKey="value"
          strokeWidth={0}
          labelLine={false}
          label={({ cx, cy }) => (
            <CenterLabel cx={cx as number} cy={cy as number} rate={completion_rate} />
          )}
        >
          {segments.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
