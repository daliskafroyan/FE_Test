import { useMutation, useQuery } from '@tanstack/react-query'

// Base API URL - using the same base URL as other API files
const API_BASE_URL = 'http://localhost:8080/api'

// Types for gerbang (gate) data
export interface GerbangItem {
    id: number;
    IdCabang: number;
    NamaGerbang: string;
    NamaCabang: string;
}

export interface GerbangPagination {
    count: number;
    rows: GerbangItem[];
}

export interface GerbangData {
    total_pages: number;
    current_page: number;
    count: number;
    rows: GerbangPagination;
}

export interface GerbangResponse {
    status: boolean;
    message: string;
    code: number;
    data: GerbangData;
}

export interface GerbangCreateRequest {
    id: number;
    IdCabang: number;
    NamaGerbang: string;
    NamaCabang: string;
}

export interface GerbangUpdateRequest {
    id: number;
    IdCabang: number;
    NamaGerbang: string;
    NamaCabang: string;
}

export interface GerbangDeleteRequest {
    id: number;
    IdCabang: number;
}

export interface GerbangCreateResponse {
    status: boolean;
    message: string;
    code: number;
    id: GerbangItem & {
        updatedAt: string;
        createdAt: string;
    };
}

export interface GerbangUpdateResponse {
    status: boolean;
    message: string;
    code: number;
    id: GerbangItem & {
        updatedAt: string;
        createdAt: string;
    };
}

export interface GerbangDeleteResponse {
    status: boolean;
    message: string;
    code: number;
    IdGerbang: number;
    IdCabang: number;
}

export interface GerbangQueryParams {
    page?: number;
    limit?: number;
    cabang?: number;
}

// Gerbang service functions
export const gerbangApi = {
    getGerbangs: async (params: GerbangQueryParams = {}): Promise<GerbangResponse> => {
        // Build query string from params
        const queryParams = new URLSearchParams();

        if (params.page) {
            queryParams.append('page', params.page.toString());
        }

        if (params.limit) {
            queryParams.append('limit', params.limit.toString());
        }

        if (params.cabang) {
            queryParams.append('cabang', params.cabang.toString());
        }

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/gerbangs${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch gerbang data');
        }

        return response.json();
    },

    createGerbang: async (data: GerbangCreateRequest): Promise<GerbangCreateResponse> => {
        const response = await fetch(`${API_BASE_URL}/gerbangs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to create gerbang');
        }

        return response.json();
    },

    updateGerbang: async (data: GerbangUpdateRequest): Promise<GerbangUpdateResponse> => {
        const response = await fetch(`${API_BASE_URL}/gerbangs`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to update gerbang');
        }

        return response.json();
    },

    deleteGerbang: async (data: GerbangDeleteRequest): Promise<GerbangDeleteResponse> => {
        const response = await fetch(`${API_BASE_URL}/gerbangs`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to delete gerbang');
        }

        return response.json();
    },
}

// React Query hooks
export function useGerbangs(params: GerbangQueryParams = {}) {
    return useQuery({
        queryKey: ['gerbangs', params],
        queryFn: () => gerbangApi.getGerbangs(params),
    });
}

export function useCreateGerbang() {
    return useMutation({
        mutationFn: (data: GerbangCreateRequest) => gerbangApi.createGerbang(data),
    });
}

export function useUpdateGerbang() {
    return useMutation({
        mutationFn: (data: GerbangUpdateRequest) => gerbangApi.updateGerbang(data),
    });
}

export function useDeleteGerbang() {
    return useMutation({
        mutationFn: (data: GerbangDeleteRequest) => gerbangApi.deleteGerbang(data),
    });
} 