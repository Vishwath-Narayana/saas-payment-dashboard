import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'

const COLORS = {
  card:   '#6366f1',
  upi:    '#10b981',
  wallet: '#f59e0b',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-xl">
      <p className="text-white font-medium capitalize">{d.method}</p>
      <p className="text-zinc-400 text-xs">{d.count} transactions</p>
      <p className="text-zinc-400 text-xs">{formatCurrency(d.revenue)} revenue</p>
    </div>
  )
}

export default function MethodPieChart({ data = [] }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-white font-semibold">Payment Methods</h3>
        <p className="text-zinc-400 text-xs mt-0.5">By transaction count</p>
      </div>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-zinc-500 text-sm">No data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={100}
              dataKey="count"
              nameKey="method"
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.method}
                  fill={COLORS[entry.method] || '#6366f1'}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-zinc-400 text-xs capitalize">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
