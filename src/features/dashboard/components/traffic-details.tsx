import { useMemo, useState } from 'react'
import { useTrafficData } from '@/api/traffic'
import { LineChart, Line, BarChart, Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search, Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format, parse } from 'date-fns'

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
    gol5: '#607D8B',
    bca: '#FF8C00',
    bri: '#4B0082',
    bni: '#008080',
    dki: '#DC143C',
    mandiri: '#0000CD',
    flo: '#32CD32',
    ktp: '#FF69B4',
    tunai: '#FFD700',
    ruas1: '#1E88E5',
    ruas2: '#E53935',
    ruas3: '#43A047',
    ruas4: '#FB8C00',
    ruas5: '#8E24AA'
};

// Define types for shift and golongan
type ShiftKey = '1' | '2' | '3';
type GolonganKey = '1' | '2' | '3' | '4' | '5';
type ColorKey = keyof typeof COLORS;

export function TrafficDetails({ selectedDate }: TrafficDetailsProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [datePickerOpen, setDatePickerOpen] = useState(false)
    const [selectedDateState, setSelectedDateState] = useState<Date | undefined>(
        selectedDate ? parse(selectedDate, 'yyyy-MM-dd', new Date()) : new Date()
    )

    // Format the date for display
    const formattedDate = selectedDateState
        ? format(selectedDateState, 'PPP')
        : 'Select date'

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
        topGarduGolongan,
        paymentMethodData,
        ruasData,
        filteredData
    } = useMemo(() => {
        if (!trafficResponse || !trafficResponse.data || !trafficResponse.data.rows || !trafficResponse.data.rows.rows) {
            return {
                shiftData: [],
                golonganData: [],
                garduData: [],
                hourlyEstimate: [],
                topGarduGolongan: [],
                paymentMethodData: [],
                ruasData: [],
                filteredData: []
            };
        }

        let trafficItems = trafficResponse.data.rows.rows;

        // Filter data based on search term if provided
        if (searchTerm) {
            trafficItems = trafficItems.filter(item =>
                String(item.IdGerbang).includes(searchTerm) ||
                String(item.IdCabang).includes(searchTerm) ||
                String(item.IdGardu).includes(searchTerm) ||
                String(item.Golongan).includes(searchTerm)
            );
        }

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

        // Group by payment method
        const paymentMethodTotals = {
            eMandiri: 0,
            eBri: 0,
            eBni: 0,
            eBca: 0,
            eDKI: 0,
            eFlo: 0,
            KTP: 0, // DinasOpr + DinasMitra + DinasKary
            Tunai: 0
        };

        // Group by toll gate (Gardu)
        const garduMap = new Map<string, number>();

        // Group by ruas (cabang)
        const ruasMap = new Map<string, number>();

        // Gardu-Golongan combinations
        const garduGolonganMap = new Map<string, { gardu: string; golongan: string; total: number }>();

        trafficItems.forEach(item => {
            // Calculate total transactions
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

            // Add to payment method totals
            paymentMethodTotals.eMandiri += item.eMandiri;
            paymentMethodTotals.eBri += item.eBri;
            paymentMethodTotals.eBni += item.eBni;
            paymentMethodTotals.eBca += item.eBca;
            paymentMethodTotals.eDKI += item.eDKI;
            paymentMethodTotals.eFlo += item.eFlo;
            paymentMethodTotals.KTP += (item.DinasOpr + item.DinasMitra + item.DinasKary);
            paymentMethodTotals.Tunai += item.Tunai;

            // Track by gardu
            const garduKey = `Gerbang ${item.IdGerbang}`;
            if (!garduMap.has(garduKey)) {
                garduMap.set(garduKey, 0);
            }
            garduMap.set(garduKey, garduMap.get(garduKey)! + total);

            // Track by ruas (cabang)
            const ruasKey = `Ruas ${item.IdCabang}`;
            if (!ruasMap.has(ruasKey)) {
                ruasMap.set(ruasKey, 0);
            }
            ruasMap.set(ruasKey, ruasMap.get(ruasKey)! + total);

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
                    color: COLORS[colorKey],
                    percentage: 0 // Will be calculated below
                };
            });

        // Calculate percentages for shift data
        const shiftTotal = shiftChartData.reduce((sum, item) => sum + item.value, 0);
        shiftChartData.forEach(item => {
            item.percentage = shiftTotal > 0 ? Math.round((item.value / shiftTotal) * 100) : 0;
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

        // Payment method chart data
        const paymentMethodChartData = [
            { name: 'Mandiri', value: paymentMethodTotals.eMandiri, color: COLORS.mandiri },
            { name: 'BRI', value: paymentMethodTotals.eBri, color: COLORS.bri },
            { name: 'BNI', value: paymentMethodTotals.eBni, color: COLORS.bni },
            { name: 'BCA', value: paymentMethodTotals.eBca, color: COLORS.bca },
            { name: 'DKI', value: paymentMethodTotals.eDKI, color: COLORS.dki },
            { name: 'Flo', value: paymentMethodTotals.eFlo, color: COLORS.flo },
            { name: 'KTP', value: paymentMethodTotals.KTP, color: COLORS.ktp },
            { name: 'Tunai', value: paymentMethodTotals.Tunai, color: COLORS.tunai }
        ].filter(item => item.value > 0);

        // Convert gardu map to sorted array
        const garduChartData = Array.from(garduMap.entries())
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10 toll gates

        // Convert ruas map to chart data
        const ruasChartData = Array.from(ruasMap.entries())
            .filter(([_, value]) => value > 0)
            .map(([name, value], index) => {
                const colorKey = `ruas${(index % 5) + 1}` as ColorKey;
                return {
                    name,
                    value,
                    color: COLORS[colorKey],
                    percentage: 0 // Will be calculated below
                };
            });

        // Calculate percentages for ruas data
        const ruasTotal = ruasChartData.reduce((sum, item) => sum + item.value, 0);
        ruasChartData.forEach(item => {
            item.percentage = ruasTotal > 0 ? Math.round((item.value / ruasTotal) * 100) : 0;
        });

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
            topGarduGolongan: topGarduGolonganData,
            paymentMethodData: paymentMethodChartData,
            ruasData: ruasChartData,
            filteredData: trafficItems
        };
    }, [trafficResponse, searchTerm]);

    // Handle date change
    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setSelectedDateState(date);
            // Update URL to reflect the change
            const formattedDate = format(date, 'yyyy-MM-dd');
            const url = new URL(window.location.href);
            url.searchParams.set('date', formattedDate);
            window.history.replaceState({}, '', url);
        }
        setDatePickerOpen(false);
    };

    // Function to export data as CSV
    const exportToCSV = (type: 'payment' | 'gate' | 'shift' | 'ruas' | 'all') => {
        if (!filteredData || filteredData.length === 0) return;

        let csvContent = '';
        let filename = '';

        if (type === 'payment') {
            // Export payment method data
            csvContent = 'Payment Method,Transactions\n';
            paymentMethodData.forEach(item => {
                csvContent += `${item.name},${item.value}\n`;
            });
            filename = `payment_methods_${selectedDate}.csv`;
        }
        else if (type === 'gate') {
            // Export toll gate data
            csvContent = 'Toll Gate,Transactions\n';
            garduData.forEach(item => {
                csvContent += `${item.name},${item.value}\n`;
            });
            filename = `toll_gates_${selectedDate}.csv`;
        }
        else if (type === 'shift') {
            // Export shift data
            csvContent = 'Shift,Transactions,Percentage\n';
            shiftData.forEach(item => {
                csvContent += `${item.name},${item.value},${item.percentage}%\n`;
            });
            filename = `shifts_${selectedDate}.csv`;
        }
        else if (type === 'ruas') {
            // Export ruas data
            csvContent = 'Ruas,Transactions,Percentage\n';
            ruasData.forEach(item => {
                csvContent += `${item.name},${item.value},${item.percentage}%\n`;
            });
            filename = `ruas_${selectedDate}.csv`;
        }
        else {
            // Export all raw data
            csvContent = 'Tanggal,IdCabang,IdGerbang,IdGardu,Shift,Golongan,Tunai,E-Mandiri,E-BRI,E-BNI,E-BCA,E-FLO,KTP\n';
            filteredData.forEach(item => {
                const ktpTotal = item.DinasOpr + item.DinasMitra + item.DinasKary;
                csvContent += `${item.Tanggal},${item.IdCabang},${item.IdGerbang},${item.IdGardu},${item.Shift},${item.Golongan},${item.Tunai},${item.eMandiri},${item.eBri},${item.eBni},${item.eBca},${item.eFlo},${ktpTotal}\n`;
            });
            filename = `all_traffic_data_${selectedDate}.csv`;
        }

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
        <div className="mt-4">
            <Tabs defaultValue="payment-method" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="payment-method">Payment Method</TabsTrigger>
                    <TabsTrigger value="toll-gates">Toll Gates</TabsTrigger>
                    <TabsTrigger value="shift-distribution">Shift Analysis</TabsTrigger>
                    <TabsTrigger value="ruas-distribution">Ruas Analysis</TabsTrigger>
                    <TabsTrigger value="hourly">Hourly Estimate</TabsTrigger>
                </TabsList>

                {/* Payment Method Tab */}
                <TabsContent value="payment-method" className="mt-4">
                    <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Traffic by Payment Method</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => exportToCSV('payment')}>
                                <Download className="mr-2 h-4 w-4" /> Export
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={paymentMethodData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
                                    <Tooltip formatter={(value) => [`${value.toLocaleString()}`, 'Transactions']} />
                                    <Legend />
                                    <Bar dataKey="value" name="Transactions">
                                        {paymentMethodData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Toll Gates Tab */}
                <TabsContent value="toll-gates" className="mt-4">
                    <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Traffic by Toll Gate</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => exportToCSV('gate')}>
                                <Download className="mr-2 h-4 w-4" /> Export
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={garduData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" tickFormatter={(value) => `${value.toLocaleString()}`} />
                                    <YAxis type="category" dataKey="name" width={90} />
                                    <Tooltip formatter={(value) => [`${value.toLocaleString()}`, 'Transactions']} />
                                    <Legend />
                                    <Bar dataKey="value" name="Transactions" fill="#1E90FF" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Shift Distribution Tab */}
                <TabsContent value="shift-distribution" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Shift Distribution</CardTitle>
                                <Button variant="outline" size="sm" onClick={() => exportToCSV('shift')}>
                                    <Download className="mr-2 h-4 w-4" /> Export
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={shiftData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                                        >
                                            {shiftData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value.toLocaleString()}`, 'Transactions']} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Traffic by Vehicle Class</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
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

                {/* Ruas (Cabang) Distribution Tab */}
                <TabsContent value="ruas-distribution" className="mt-4">
                    <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Traffic by Ruas (Cabang)</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => exportToCSV('ruas')}>
                                <Download className="mr-2 h-4 w-4" /> Export
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={ruasData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                                    >
                                        {ruasData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value.toLocaleString()}`, 'Transactions']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hourly" className="mt-4">
                    <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Estimated Hourly Traffic Distribution</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => exportToCSV('all')}>
                                <Download className="mr-2 h-4 w-4" /> Export All Data
                            </Button>
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
            </Tabs>
        </div>
    )
} 