import { useMemo } from 'react'
import { useTrafficData } from '@/api/traffic'
import { LineChart, Line, BarChart, Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TrafficDetailsProps {
    selectedDate: string;
}

const COLORS = {
    shift1: '#005BBB',
    shift2: '#8A2BE2',
    shift3: '#FF4500',
    gol1: '#4CAF50',
    gol2: '#2196F3',
    gol3: '#FF5722',
    gol4: '#9C27B0',
    gol5: '#607D8B'
};

// Define types for shift and golongan
type ShiftKey = '1' | '2' | '3';
type GolonganKey = '1' | '2' | '3' | '4' | '5';
type ColorKey = keyof typeof COLORS;

export function TrafficDetails({ selectedDate }: TrafficDetailsProps) {
    // Fetch traffic data from API for the selected date
    const { data: trafficResponse, isLoading, error } = useTrafficData({
        tanggal: selectedDate,
    });

    // Process data for analysis
    const {
        shiftData,
        golonganData,
        garduData,
        hourlyEstimate,
        topGarduGolongan
    } = useMemo(() => {
        if (!trafficResponse || !trafficResponse.data || !trafficResponse.data.rows || !trafficResponse.data.rows.rows) {
            return {
                shiftData: [],
                golonganData: [],
                garduData: [],
                hourlyEstimate: [],
                topGarduGolongan: []
            };
        }

        const trafficItems = trafficResponse.data.rows.rows;

        // Group by shift
        const shiftTotals: Record<ShiftKey, number> = {
            '1': 0,
            '2': 0,
            '3': 0
        };

        // Group by vehicle class (Golongan)
        const golonganTotals: Record<GolonganKey, number> = {
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0
        };

        // Group by toll gate (Gardu)
        const garduMap = new Map<string, number>();

        // Gardu-Golongan combinations
        const garduGolonganMap = new Map<string, { gardu: string; golongan: string; total: number }>();

        trafficItems.forEach(item => {
            const total = (
                item.Tunai + item.DinasOpr + item.DinasMitra + item.DinasKary +
                item.eMandiri + item.eBri + item.eBni + item.eBca +
                item.eNobu + item.eDKI + item.eMega + item.eFlo
            );

            // Add to shift totals
            const shiftKey = String(item.Shift) as ShiftKey;
            if (shiftTotals[shiftKey] !== undefined) {
                shiftTotals[shiftKey] += total;
            }

            // Add to golongan totals
            const golonganKey = String(item.Golongan) as GolonganKey;
            if (golonganTotals[golonganKey] !== undefined) {
                golonganTotals[golonganKey] += total;
            }

            // Track by gardu
            const garduKey = `Gardu ${item.IdGardu}`;
            if (!garduMap.has(garduKey)) {
                garduMap.set(garduKey, 0);
            }
            garduMap.set(garduKey, garduMap.get(garduKey)! + total);

            // Track gardu-golongan combinations
            const garduGolKey = `${garduKey}-Gol ${item.Golongan}`;
            if (!garduGolonganMap.has(garduGolKey)) {
                garduGolonganMap.set(garduGolKey, {
                    gardu: garduKey,
                    golongan: `Golongan ${item.Golongan}`,
                    total: 0
                });
            }
            garduGolonganMap.get(garduGolKey)!.total += total;
        });

        // Convert to arrays for the charts
        const shiftChartData = Object.entries(shiftTotals)
            .filter(([_, value]) => value > 0)
            .map(([shift, value]) => {
                const colorKey = `shift${shift}` as ColorKey;
                return {
                    name: `Shift ${shift}`,
                    value,
                    color: COLORS[colorKey]
                };
            });

        const golonganChartData = Object.entries(golonganTotals)
            .filter(([_, value]) => value > 0)
            .map(([golongan, value]) => {
                const colorKey = `gol${golongan}` as ColorKey;
                return {
                    name: `Golongan ${golongan}`,
                    value,
                    color: COLORS[colorKey]
                };
            });

        // Convert gardu map to sorted array
        const garduChartData = Array.from(garduMap.entries())
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10 toll gates

        // Create hourly estimate based on shift data (rough approximation)
        const hourlyData = [];
        // Shift 1: typically 06:00-14:00 (morning)
        if (shiftTotals['1'] > 0) {
            const avgPerHour = shiftTotals['1'] / 8;
            for (let hour = 6; hour < 14; hour++) {
                // Create small variations
                const variance = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 variance
                hourlyData.push({
                    hour: `${hour.toString().padStart(2, '0')}:00`,
                    traffic: Math.round(avgPerHour * variance),
                    shift: 'Shift 1'
                });
            }
        }

        // Shift 2: typically 14:00-22:00 (afternoon/evening)
        if (shiftTotals['2'] > 0) {
            const avgPerHour = shiftTotals['2'] / 8;
            for (let hour = 14; hour < 22; hour++) {
                const variance = 0.8 + Math.random() * 0.4;
                hourlyData.push({
                    hour: `${hour.toString().padStart(2, '0')}:00`,
                    traffic: Math.round(avgPerHour * variance),
                    shift: 'Shift 2'
                });
            }
        }

        // Shift 3: typically 22:00-06:00 (night/early morning)
        if (shiftTotals['3'] > 0) {
            const avgPerHour = shiftTotals['3'] / 8;
            for (let hour = 22; hour < 24; hour++) {
                const variance = 0.8 + Math.random() * 0.4;
                hourlyData.push({
                    hour: `${hour.toString().padStart(2, '0')}:00`,
                    traffic: Math.round(avgPerHour * variance),
                    shift: 'Shift 3'
                });
            }
            for (let hour = 0; hour < 6; hour++) {
                const variance = 0.8 + Math.random() * 0.4;
                hourlyData.push({
                    hour: `${hour.toString().padStart(2, '0')}:00`,
                    traffic: Math.round(avgPerHour * variance),
                    shift: 'Shift 3'
                });
            }
        }

        // Sort by hour
        hourlyData.sort((a, b) => {
            const hourA = parseInt(a.hour.split(':')[0]);
            const hourB = parseInt(b.hour.split(':')[0]);
            return hourA - hourB;
        });

        // Get top gardu-golongan combinations
        const topGarduGolonganData = Array.from(garduGolonganMap.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        return {
            shiftData: shiftChartData,
            golonganData: golonganChartData,
            garduData: garduChartData,
            hourlyEstimate: hourlyData,
            topGarduGolongan: topGarduGolonganData
        };
    }, [trafficResponse]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-[200px]">Loading detailed analysis...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-[200px] text-red-500">Error loading detailed data</div>;
    }

    // If no data is available
    if (!shiftData || shiftData.length === 0) {
        return (
            <div className="flex justify-center items-center h-[200px] text-muted-foreground">
                No detailed data available for the selected date
            </div>
        );
    }

    return (
        <div className="mt-8">
            <Tabs defaultValue="distribution" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="distribution">Traffic Distribution</TabsTrigger>
                    <TabsTrigger value="hourly">Hourly Estimate</TabsTrigger>
                    <TabsTrigger value="topGates">Top Gates</TabsTrigger>
                </TabsList>

                <TabsContent value="distribution" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Shift Distribution */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Traffic by Shift</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={shiftData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
                                        <Tooltip formatter={(value) => [`${value.toLocaleString()}`, 'Transactions']} />
                                        <Bar dataKey="value" name="Transactions">
                                            {shiftData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Vehicle Class Distribution */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Traffic by Vehicle Class</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={golonganData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
                                        <Tooltip formatter={(value) => [`${value.toLocaleString()}`, 'Transactions']} />
                                        <Bar dataKey="value" name="Transactions">
                                            {golonganData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="hourly" className="mt-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Estimated Hourly Traffic Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground mb-2">
                                Note: This is an approximation based on shift data
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={hourlyEstimate}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" />
                                    <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
                                    <Tooltip formatter={(value) => [`${value.toLocaleString()}`, 'Transactions']} />
                                    <Bar dataKey="traffic" name="Estimated Traffic" fill="#8884d8">
                                        {hourlyEstimate.map((entry, index) => {
                                            const shiftColor = entry.shift === 'Shift 1'
                                                ? COLORS.shift1
                                                : (entry.shift === 'Shift 2' ? COLORS.shift2 : COLORS.shift3);
                                            return <Cell key={`cell-${index}`} fill={shiftColor} />;
                                        })}
                                    </Bar>
                                    <Line type="monotone" dataKey="traffic" stroke="#ff7300" dot={false} activeDot={{ r: 8 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="topGates" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Top Toll Gates */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Top 10 Toll Gates by Traffic</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={garduData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" tickFormatter={(value) => `${value.toLocaleString()}`} />
                                        <YAxis type="category" dataKey="name" width={80} />
                                        <Tooltip formatter={(value) => [`${value.toLocaleString()}`, 'Transactions']} />
                                        <Bar dataKey="value" name="Transactions" fill="#1E90FF" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Top Gate-Golongan Combinations */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Top Gate-Vehicle Class Combinations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] overflow-auto">
                                    <table className="w-full">
                                        <thead className="sticky top-0 bg-background">
                                            <tr className="border-b">
                                                <th className="text-left p-2">Gate</th>
                                                <th className="text-left p-2">Vehicle Class</th>
                                                <th className="text-right p-2">Traffic</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topGarduGolongan.map((item, index) => (
                                                <tr key={index} className="border-b hover:bg-muted/50">
                                                    <td className="p-2">{item.gardu}</td>
                                                    <td className="p-2">{item.golongan}</td>
                                                    <td className="p-2 text-right">{item.total.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
} 