import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell, PieChart, Pie } from 'recharts'
import { useTrafficData } from '@/api/traffic'

interface OverviewProps {
  selectedDate: string;
}

const COLORS = {
  eMandiri: '#00A9FF',
  eBri: '#005BAA',
  eBni: '#F48320',
  eBca: '#006778',
  eNobu: '#7C2B83',
  eDKI: '#00573F',
  eMega: '#ED1C24',
  eFlo: '#F58220',
  Tunai: '#888888',
  Dinas: '#333333'
};

export function Overview({ selectedDate }: OverviewProps) {
  const { data: trafficResponse, isLoading, error } = useTrafficData({
    tanggal: selectedDate,
  });

  const { barData, pieData, totalTransactions } = useMemo(() => {
    if (!trafficResponse || !trafficResponse.data || !trafficResponse.data.rows || !trafficResponse.data.rows.rows) {
      return { barData: [], pieData: [], totalTransactions: 0 };
    }

    const trafficItems = trafficResponse.data.rows.rows;

    const paymentTotals = {
      eMandiri: 0,
      eBri: 0,
      eBni: 0,
      eBca: 0,
      eNobu: 0,
      eDKI: 0,
      eMega: 0,
      eFlo: 0,
      Tunai: 0,
      Dinas: 0,
    };

    trafficItems.forEach(item => {
      paymentTotals.eMandiri += item.eMandiri;
      paymentTotals.eBri += item.eBri;
      paymentTotals.eBni += item.eBni;
      paymentTotals.eBca += item.eBca;
      paymentTotals.eNobu += item.eNobu;
      paymentTotals.eDKI += item.eDKI;
      paymentTotals.eMega += item.eMega;
      paymentTotals.eFlo += item.eFlo;
      paymentTotals.Tunai += item.Tunai;
      paymentTotals.Dinas += (item.DinasOpr + item.DinasMitra + item.DinasKary);
    });

    const total = Object.values(paymentTotals).reduce((sum, count) => sum + count, 0);

    const barChartData = [
      { name: 'Mandiri', value: paymentTotals.eMandiri, color: COLORS.eMandiri },
      { name: 'BRI', value: paymentTotals.eBri, color: COLORS.eBri },
      { name: 'BNI', value: paymentTotals.eBni, color: COLORS.eBni },
      { name: 'BCA', value: paymentTotals.eBca, color: COLORS.eBca },
      { name: 'Nobu', value: paymentTotals.eNobu, color: COLORS.eNobu },
      { name: 'DKI', value: paymentTotals.eDKI, color: COLORS.eDKI },
      { name: 'Mega', value: paymentTotals.eMega, color: COLORS.eMega },
      { name: 'Flo', value: paymentTotals.eFlo, color: COLORS.eFlo },
    ].filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    const pieChartData = [
      ...barChartData,
      ...(paymentTotals.Tunai > 0 ? [{ name: 'Cash', value: paymentTotals.Tunai, color: COLORS.Tunai }] : []),
      ...(paymentTotals.Dinas > 0 ? [{ name: 'Service', value: paymentTotals.Dinas, color: COLORS.Dinas }] : []),
    ];

    return {
      barData: barChartData,
      pieData: pieChartData,
      totalTransactions: total
    };
  }, [trafficResponse]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-[350px]">Loading data...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-[350px] text-red-500">Error loading data</div>;
  }

  if (!barData || barData.length === 0) {
    return (
      <div className="flex justify-center items-center h-[350px] text-muted-foreground">
        No data available for the selected date
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-center">
        <h3 className="text-lg font-medium">Total Transactions: {totalTransactions.toLocaleString()}</h3>
        <p className="text-sm text-muted-foreground">Data for {selectedDate}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h3 className="text-base font-medium mb-2 text-center">Transaction Distribution by Bank</h3>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                stroke='#888888'
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#888888' }}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke='#888888'
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#888888' }}
                width={80}
              />
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), 'Transactions']}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey='value' name="Transactions">
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-base font-medium mb-2 text-center">Transaction Percentage by Payment Method</h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), 'Transactions']}
                labelFormatter={(name) => `${name}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
