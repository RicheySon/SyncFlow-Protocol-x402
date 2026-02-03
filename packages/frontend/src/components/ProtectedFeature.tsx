'use client';

import { ReactNode } from 'react';
import { featureFlags } from '@/middleware/api-validation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

interface ProtectedFeatureProps {
    feature: keyof typeof featureFlags;
    fallback?: ReactNode;
    children: ReactNode;
}

/**
 * ProtectedFeature Component
 *
 * Wraps features that require specific API keys to function
 * Shows a fallback message if the feature is disabled
 */
export function ProtectedFeature({ feature, fallback, children }: ProtectedFeatureProps) {
    const isEnabled = featureFlags[feature]();

    if (isEnabled) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <Alert className="border-gray-300 bg-gray-50">
            <Lock className="h-4 w-4 text-gray-600" />
            <AlertTitle className="text-gray-800">Feature Unavailable</AlertTitle>
            <AlertDescription className="text-gray-700">
                <p className="mb-2">
                    This feature requires additional configuration to function.
                </p>
                <p className="text-sm">
                    {getFeatureRequirement(feature)}
                </p>
            </AlertDescription>
        </Alert>
    );
}

function getFeatureRequirement(feature: keyof typeof featureFlags): string {
    const requirements: Record<keyof typeof featureFlags, string> = {
        blockchainEnabled: 'Configure NEXT_PUBLIC_CRYPTOCOM_API_KEY to enable blockchain features.',
        agentExecutionEnabled: 'Configure NEXT_PUBLIC_CRYPTOCOM_API_KEY to enable agent execution.',
        transactionHistoryEnabled: 'Configure NEXT_PUBLIC_CRYPTOCOM_API_KEY to view transaction history.',
    };

    return requirements[feature] || 'Please check your environment configuration.';
}
