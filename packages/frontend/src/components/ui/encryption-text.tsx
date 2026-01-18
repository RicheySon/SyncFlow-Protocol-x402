'use client';

import { useEffect, useState } from 'react';

const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface EncryptionTextProps {
    text: string;
    interval?: number;
    className?: string;
}

export function EncryptionText({ text, interval = 50, className = '' }: EncryptionTextProps) {
    const [displayText, setDisplayText] = useState(text);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (!isHovering) {
            setDisplayText(text);
            return;
        }

        let iteration = 0;
        const timer = setInterval(() => {
            setDisplayText((prev) =>
                text
                    .split('')
                    .map((char, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)];
                    })
                    .join('')
            );

            if (iteration >= text.length) {
                clearInterval(timer);
            }

            iteration += 1 / 3;
        }, interval);

        return () => clearInterval(timer);
    }, [isHovering, text, interval]);

    return (
        <span
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`font-mono cursor-default inline-block ${className}`}
        >
            {displayText}
        </span>
    );
}
