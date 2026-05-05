import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'

const COLORS = {
  card:   '#5645d4', // primary
  upi:    '#1aae39', // brand-green
  wallet: '#ff64c8', // brand-pink
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-canvas border border-hairline rounded-md p-3 shadow-md">
      <p className="text-ink font-semibold capitalize tracking-tight">{d.method}</p>
      <p className="text-slate text-xs mt-1">{d.count} transactions</p>
      <p className="text-slate text-xs">{formatCurrency(d.revenue)} revenue</p>
    </div>
  )
}

export default function MethodPieChart({ data = [] }) {
  return (
    <div className="bg-canvas border border-hairline rounded-[12px] p-6 h-full flex flex-col">
      <div className="mb-4 shrink-0">
        <h3 className="text-ink font-semibold tracking-tight">Payment Methods</h3>
        <p className="text-slate text-[13px] mt-0.5">By transaction count</p>
      </div>
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone text-sm">No data yet</p>
        </div>
      ) : (
        <div className="flex-1 min-h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
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
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.method}
                    fill={COLORS[entry.method] || '#5645d4'}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-slate text-[13px] font-medium capitalize">{value}</span>
                )}
                wrapperStyle={{ paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
