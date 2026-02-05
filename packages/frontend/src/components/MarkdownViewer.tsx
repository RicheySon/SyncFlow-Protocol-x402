'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Github, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface MarkdownViewerProps {
    filePath: string;
    title: string;
    githubPath: string;
}

export function MarkdownViewer({ filePath, title, githubPath }: MarkdownViewerProps) {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMarkdown() {
            try {
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error('Failed to load documentation');
                }
                const text = await response.text();
                setContent(text);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load');
            } finally {
                setLoading(false);
            }
        }
        fetchMarkdown();
    }, [filePath]);

    const renderMarkdown = (md: string) => {
        // Simple markdown to HTML conversion
        let html = md
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3 text-foreground">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-foreground border-b pb-2">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-6 text-foreground">$1</h1>')
            // Bold and Italic
            .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm"><code>$2</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/gim, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
            // Unordered lists
            .replace(/^\s*[-*] (.*$)/gim, '<li class="ml-4">$1</li>')
            // Ordered lists
            .replace(/^\s*\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
            // Blockquotes
            .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">$1</blockquote>')
            // Horizontal rules
            .replace(/^---$/gim, '<hr class="my-8 border-border" />')
            // Paragraphs
            .replace(/\n\n/gim, '</p><p class="my-4 text-muted-foreground leading-relaxed">')
            // Line breaks
            .replace(/\n/gim, '<br />');

        // Wrap in paragraph
        html = `<p class="my-4 text-muted-foreground leading-relaxed">${html}</p>`;

        // Fix list wrapping
        html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/gim, (match) => `<ul class="my-4 space-y-2">${match}</ul>`);

        return html;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-destructive mb-4">{error}</p>
                <Link href="/docs">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Documentation
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b">
                <Link href="/docs">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Docs
                    </Button>
                </Link>
                <a
                    href={`https://github.com/RicheySon/SyncFlow-Protocol-x402/blob/Backend/${githubPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button variant="outline" size="sm">
                        <Github className="mr-2 h-4 w-4" />
                        View on GitHub
                        <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                </a>
            </div>

            {/* Content */}
            <article
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />

            {/* Footer */}
            <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                <p>
                    Found an issue?{' '}
                    <a
                        href={`https://github.com/RicheySon/SyncFlow-Protocol-x402/edit/Backend/${githubPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                    >
                        Edit this page on GitHub
                    </a>
                </p>
            </div>
        </div>
    );
}
