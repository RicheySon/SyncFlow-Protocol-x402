/**
 * API Key Validation Middleware for Frontend
 *
 * Validates that required API keys are configured before allowing access to features
 */

import { isCryptoComConfigured } from '@/lib/cryptocom-client';

export interface ValidationResult {
    valid: boolean;
    missingKeys: string[];
    warnings: string[];
}

/**
 * Validates that Crypto.com API key is configured
 */
export function validateCryptoComApiKey(): ValidationResult {
    const result: ValidationResult = {
        valid: true,
        missingKeys: [],
        warnings: [],
    };

    if (!isCryptoComConfigured()) {
        result.valid = false;
        result.missingKeys.push('NEXT_PUBLIC_CRYPTOCOM_API_KEY');
        result.warnings.push(
            'Crypto.com Developer Platform API key is not configured. ' +
            'Blockchain features will not be available. ' +
            'Get your API key from: https://developer-platform.crypto.com/'
        );
    }

    return result;
}

/**
 * Validates backend connection
 */
export function validateBackendConnection(): ValidationResult {
    const result: ValidationResult = {
        valid: true,
        missingKeys: [],
        warnings: [],
    };

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl || backendUrl === 'http://localhost:3001') {
        result.warnings.push(
            'Using default backend URL (http://localhost:3001). ' +
            'Make sure the backend server is running.'
        );
    }

    return result;
}

/**
 * Validates all required configuration
 */
export function validateAppConfiguration(): ValidationResult {
    const result: ValidationResult = {
        valid: true,
        missingKeys: [],
        warnings: [],
    };

    const cryptoComResult = validateCryptoComApiKey();
    const backendResult = validateBackendConnection();

    result.valid = cryptoComResult.valid && backendResult.valid;
    result.missingKeys = [...cryptoComResult.missingKeys, ...backendResult.missingKeys];
    result.warnings = [...cryptoComResult.warnings, ...backendResult.warnings];

    return result;
}

/**
 * Feature flags based on API key availability
 */
export const featureFlags = {
    blockchainEnabled: () => isCryptoComConfigured(),
    agentExecutionEnabled: () => isCryptoComConfigured(),
    transactionHistoryEnabled: () => isCryptoComConfigured(),
};
