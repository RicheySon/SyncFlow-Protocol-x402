'use client';

import { useEffect, useState } from 'react';
import { validateAppConfiguration, ValidationResult } from '@/middleware/api-validation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

/**
 * ConfigurationStatus Component
 *
 * Displays the current configuration status and warnings for missing API keys
 */
export function ConfigurationStatus() {
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const result = validateAppConfiguration();
        setValidation(result);
    }, []);

    if (!validation || !isVisible) {
        return null;
    }

    if (validation.valid && validation.warnings.length === 0) {
        return (
            <Alert className="mb-4 border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Configuration Valid</AlertTitle>
                <AlertDescription className="text-green-700">
                    All required services are configured and ready to use.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-4 mb-4">
            {!validation.valid && validation.missingKeys.length > 0 && (
                <Alert className="border-red-500 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">Missing Configuration</AlertTitle>
                    <AlertDescription className="text-red-700">
                        <div className="mt-2">
                            <p className="font-semibold">Missing API keys:</p>
                            <ul className="list-disc list-inside mt-1">
                                {validation.missingKeys.map((key) => (
                                    <li key={key} className="font-mono text-sm">
                                        {key}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {validation.warnings.length > 0 && (
                <Alert className="border-yellow-500 bg-yellow-50">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Configuration Warnings</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                        <ul className="list-disc list-inside space-y-2 mt-2">
                            {validation.warnings.map((warning, index) => (
                                <li key={index} className="text-sm">
                                    {warning}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="mt-3 text-sm underline hover:no-underline"
                        >
                            Dismiss
                        </button>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
