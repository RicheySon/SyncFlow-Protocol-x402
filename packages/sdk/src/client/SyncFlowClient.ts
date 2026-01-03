import axios, { AxiosInstance } from 'axios';
import { SyncFlowConfig } from '../types';

export class SyncFlowClient {
    protected api: AxiosInstance;

    constructor(config: SyncFlowConfig) {
        this.api = axios.create({
            baseURL: config.baseUrl || 'http://localhost:3001',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }
}
