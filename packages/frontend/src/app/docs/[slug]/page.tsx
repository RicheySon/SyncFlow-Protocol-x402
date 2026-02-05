'use client';

import { MarkdownViewer } from '../../../components/MarkdownViewer';

// Map of slug to doc file info
const docFiles: Record<string, { filePath: string; title: string; githubPath: string }> = {
    'installation': {
        filePath: '/docs/INSTALLATION.md',
        title: 'Installation Guide',
        githubPath: 'docs/INSTALLATION.md'
    },
    'architecture': {
        filePath: '/docs/ARCHITECTURE.md',
        title: 'Architecture Overview',
        githubPath: 'docs/ARCHITECTURE.md'
    },
    'sdk-guide': {
        filePath: '/docs/SDK_GUIDE.md',
        title: 'SDK Guide',
        githubPath: 'docs/SDK_GUIDE.md'
    },
    'security': {
        filePath: '/docs/SECURITY.md',
        title: 'Security',
        githubPath: 'docs/SECURITY.md'
    },
    'main-track': {
        filePath: '/docs/tracks/MAIN_TRACK.md',
        title: 'Main Track - Autonomous Agents',
        githubPath: 'docs/tracks/MAIN_TRACK.md'
    },
    'agentic-finance': {
        filePath: '/docs/tracks/AGENTIC_FINANCE.md',
        title: 'Agentic Finance Track',
        githubPath: 'docs/tracks/AGENTIC_FINANCE.md'
    },
    'dev-tooling': {
        filePath: '/docs/tracks/DEV_TOOLING.md',
        title: 'Developer Tooling Track',
        githubPath: 'docs/tracks/DEV_TOOLING.md'
    },
    'ecosystem': {
        filePath: '/docs/tracks/ECOSYSTEM.md',
        title: 'Ecosystem Track',
        githubPath: 'docs/tracks/ECOSYSTEM.md'
    }
};

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function DocPage({ params }: PageProps) {
    const { slug } = await params;
    const docInfo = docFiles[slug];

    if (!docInfo) {
        return (
            <div className="container mx-auto py-10 max-w-4xl text-center">
                <h1 className="text-3xl font-bold mb-4">Document Not Found</h1>
                <p className="text-muted-foreground mb-6">
                    The documentation page &quot;{slug}&quot; could not be found.
                </p>
                <a href="/docs" className="text-primary hover:underline">
                    ← Back to Documentation
                </a>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <MarkdownViewer
                filePath={docInfo.filePath}
                title={docInfo.title}
                githubPath={docInfo.githubPath}
            />
        </div>
    );
}
