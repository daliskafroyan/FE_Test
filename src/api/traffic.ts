import { useQuery } from '@tanstack/react-query'

// Base API URL - using the same base URL as auth.ts
const API_BASE_URL = 'http://localhost:8080/api'

// Types for traffic data
export interface TrafficItem {
    id: number;
    IdCabang: number;
    IdGerbang: number;
    Tanggal: string;
    Shift: number;
    IdGardu: number;
    Golongan: number;
    IdAsalGerbang: number;
    Tunai: number;
    DinasOpr: number;
    DinasMitra: number;
    DinasKary: number;
    eMandiri: number;
    eBri: number;
    eBni: number;
    eBca: number;
    eNobu: number;
    eDKI: number;
    eMega: number;
    eFlo: number;
}

export interface TrafficPagination {
    count: number;
    rows: TrafficItem[];
}

export interface TrafficData {
    total_pages: number;
    current_page: number;
    count: number;
    rows: TrafficPagination;
}

export interface TrafficResponse {
    status: boolean;
    message: string;
    code: number;
    data: TrafficData;
}

export interface TrafficQueryParams {
    tanggal?: string;
    page?: number;
    limit?: number;
}

// Traffic service functions
export const trafficApi = {
    getTrafficData: async (params: TrafficQueryParams = {}): Promise<TrafficResponse> => {
        // Build query string from params
        const queryParams = new URLSearchParams();

        if (params.tanggal) {
            queryParams.append('tanggal', params.tanggal);
        }

        if (params.page) {
            queryParams.append('page', params.page.toString());
        }

        if (params.limit) {
            queryParams.append('limit', params.limit.toString());
        }

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/lalins${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch traffic data');
        }

        return response.json();
    },
}

// React Query hooks
export function useTrafficData(params: TrafficQueryParams = {}) {
    return useQuery({
        queryKey: ['traffic', params],
        queryFn: () => trafficApi.getTrafficData(params),
    });
}

// Utility function to format data for chart
export function formatTrafficDataForChart(data: TrafficItem[]) {
    if (!data || data.length === 0) {
        return [];
    }

    // Group by Tanggal (date)
    const groupedByDate: Record<string, {
        date: string;
        total: number;
        mandiri: number;
        bri: number;
        bni: number;
        bca: number;
        others: number;
    }> = {};

    data.forEach(item => {
        const date = new Date(item.Tanggal).toISOString().split('T')[0];

        if (!groupedByDate[date]) {
            groupedByDate[date] = {
                date,
                total: 0,
                mandiri: 0,
                bri: 0,
                bni: 0,
                bca: 0,
                others: 0
            };
        }

        // Sum all payment types
        const totalForItem =
            item.Tunai +
            item.DinasOpr +
            item.DinasMitra +
            item.DinasKary +
            item.eMandiri +
            item.eBri +
            item.eBni +
            item.eBca +
            item.eNobu +
            item.eDKI +
            item.eMega +
            item.eFlo;

        groupedByDate[date].total += totalForItem;
        groupedByDate[date].mandiri += item.eMandiri;
        groupedByDate[date].bri += item.eBri;
        groupedByDate[date].bni += item.eBni;
        groupedByDate[date].bca += item.eBca;
        groupedByDate[date].others += (item.eNobu + item.eDKI + item.eMega + item.eFlo + item.Tunai + item.DinasOpr + item.DinasMitra + item.DinasKary);
    });

    return Object.values(groupedByDate);
} 