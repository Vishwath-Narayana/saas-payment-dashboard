import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-canvas border border-hairline rounded-md p-3 shadow-md">
      <p className="text-stone text-[11px] font-medium mb-1 uppercase tracking-widest">{label}</p>
      <p className="text-ink font-semibold">{formatCurrency(payload[0].value)}</p>
      <p className="text-slate text-xs mt-0.5">{payload[1]?.value} transactions</p>
    </div>
  )
}

export default function RevenueChart({ data = [] }) {
  return (
    <div className="bg-canvas border border-hairline rounded-[12px] p-6">
      <div className="mb-4">
        <h3 className="text-ink font-semibold tracking-tight">Daily Revenue</h3>
        <p className="text-slate text-[13px] mt-0.5">Last 30 days</p>
      </div>
      {data.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center">
          <p className="text-stone text-sm">No data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#5645d4" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#5645d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e3df" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#a4a097', fontSize: 11, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.slice(5)}  // show MM-DD only
              dy={10}
            />
            <YAxis
              tick={{ fill: '#a4a097', fontSize: 11, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e3df', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#5645d4"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              activeDot={{ r: 4, strokeWidth: 0, fill: '#5645d4' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
