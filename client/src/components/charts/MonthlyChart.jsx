import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-canvas border border-hairline rounded-md p-3 shadow-md">
      <p className="text-stone text-[11px] font-medium mb-2 uppercase tracking-widest">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-sm font-medium" style={{ color: p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function MonthlyChart({ data = [] }) {
  return (
    <div className="bg-canvas border border-hairline rounded-[12px] p-6 h-full flex flex-col">
      <div className="mb-4 shrink-0">
        <h3 className="text-ink font-semibold tracking-tight">Monthly Trends</h3>
        <p className="text-slate text-[13px] mt-0.5">Last 6 months</p>
      </div>
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone text-sm">No data yet</p>
        </div>
      ) : (
        <div className="flex-1 min-h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e3df" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#a4a097', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fill: '#a4a097', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f6f5f4' }} />
              <Legend
                formatter={(v) => (
                  <span className="text-slate text-[13px] font-medium capitalize">{v}</span>
                )}
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Bar dataKey="success" fill="#1aae39" radius={[4,4,0,0]} barSize={20} />
              <Bar dataKey="failed"  fill="#e03131" radius={[4,4,0,0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
