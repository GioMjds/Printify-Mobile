import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
} from 'axios';
import * as SecureStore from 'expo-secure-store';

export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    success: boolean;
}

export interface RequestConfig {
    headers?: Record<string, string>;
    params?: Record<string, any>;
    timeout?: number;
    withCredentials?: boolean;
    data?: any;
}

export class ApiClient {
    private axiosInstance: AxiosInstance;
    private baseUrl: string;
    private endpointPrefix: string = '';

    constructor(config: AxiosRequestConfig = {}) {
        this.baseUrl = `${process.env.EXPO_PUBLIC_NESTJS_URL}/api`;

        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                ...config.headers,
            },
            withCredentials: true,
        });

        this.setupInterceptors();
    }
    
    public endpoint(url: string): ApiClient {
        const scopedClient = Object.create(this);
        scopedClient.endpointPrefix = url;
        return scopedClient;
    }

    private getFullUrl(url: string): string {
        return `${this.endpointPrefix}${url}`;
    }

    private setupInterceptors(): void {
        this.axiosInstance.interceptors.request.use(
            async (config) => {
                try {
                    const token = await SecureStore.getItemAsync('access_token');
                    if (token) {
                        config.headers = config.headers ?? {};
                        if (!config.headers['Authorization']) {
                            config.headers['Authorization'] = `Bearer ${token}`;
                        }
                    }
                } catch (error) {
                    console.error('❌ Error retrieving token from SecureStore:', error);
                }
                return config;
            },
            (error) => {
                console.error('❌ Request interceptor error:', error);
                return Promise.reject(error);
            }
        );

        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => response.data,
            async (error) => {
                const errorMsg = error.response?.data.message;
                return Promise.reject(new Error(errorMsg));
            }
        );
    }

    async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
        return this.axiosInstance.get<T>(this.getFullUrl(url), { ...config, withCredentials: true }) as Promise<T>;
    }

    async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.axiosInstance.post<T>(this.getFullUrl(url), data, { ...config, withCredentials: true }) as Promise<T>;
    }

    async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.axiosInstance.put<T>(this.getFullUrl(url), data, { ...config, withCredentials: true }) as Promise<T>;
    }

    async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.axiosInstance.patch<T>(this.getFullUrl(url), data, { ...config, withCredentials: true }) as Promise<T>;
    }

    async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
        return this.axiosInstance.delete<T>(this.getFullUrl(url), { ...config, withCredentials: true }) as Promise<T>;
    }
}

export const httpClient = new ApiClient();