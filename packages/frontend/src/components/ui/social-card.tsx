'use client';

import React from 'react';
import styles from './social-card.module.css';
import { Twitter, Github, Gamepad2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function SocialCard() {
    return (
        <div className={styles.parent}>
            <div className={styles.card}>
                <div className={styles.logo}>
                    <span className={`${styles.circle} ${styles.circle1}`} />
                    <span className={`${styles.circle} ${styles.circle2}`} />
                    <span className={`${styles.circle} ${styles.circle3}`} />
                    <span className={`${styles.circle} ${styles.circle4}`} />
                    <div className={`${styles.circle} ${styles.circle5}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29.667 31.69" className={styles.circle5Svg}>
                            <path id="Path_6" data-name="Path 6" d="M12.827,1.628A1.561,1.561,0,0,1,14.31,0h2.964a1.561,1.561,0,0,1,1.483,1.628v11.9a9.252,9.252,0,0,1-2.432,6.852q-2.432,2.409-6.963,2.409T2.4,20.452Q0,18.094,0,13.669V1.628A1.561,1.561,0,0,1,1.483,0h2.98A1.561,1.561,0,0,1,5.947,1.628V13.191a5.635,5.635,0,0,0,.85,3.451,3.153,3.153,0,0,0,2.632,1.094,3.032,3.032,0,0,0,2.582-1.076,5.836,5.836,0,0,0,.816-3.486Z" transform="translate(0 0)" />
                            <path id="Path_7" data-name="Path 7" d="M75.207,20.857a1.561,1.561,0,0,1-1.483,1.628h-2.98a1.561,1.561,0,0,1-1.483-1.628V1.628A1.561,1.561,0,0,1,70.743,0h2.98a1.561,1.561,0,0,1,1.483,1.628Z" transform="translate(-45.91 0)" />
                            <path id="Path_8" data-name="Path 8" d="M0,80.018A1.561,1.561,0,0,1,1.483,78.39h26.7a1.561,1.561,0,0,1,1.483,1.628v2.006a1.561,1.561,0,0,1-1.483,1.628H1.483A1.561,1.561,0,0,1,0,82.025Z" transform="translate(0 -51.963)" />
                        </svg>
                    </div>
                </div>

                <div className={styles.glass} />

                <div className={styles.content}>
                    <span className={styles.title}>Connect with x402</span>
                    <span className={styles.text}>Join our developer community and build the future of agentic finance.</span>
                </div>

                <div className={styles.bottom}>
                    <div className={styles.socialButtonsContainer}>
                        <Link href="https://x.com/SyncFlow_" target="_blank" className={styles.socialButton}>
                            {/* X Logo SVG */}
                            <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.socialButtonSvg} fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </svg>
                        </Link>
                        <Link href="https://github.com/RicheySon/SyncFlow-Protocol-x402" target="_blank" className={styles.socialButton}>
                            <Github className={styles.socialButtonSvg} />
                        </Link>
                        <Link href="/discord" className={styles.socialButton}>
                            <Gamepad2 className={styles.socialButtonSvg} /> {/* Discord */}
                        </Link>
                    </div>

                    <div className={styles.viewMore}>
                        <button className={styles.viewMoreButton}>Community</button>
                        <ArrowRight className={styles.viewMoreSvg} />
                    </div>
                </div>
            </div>
        </div>
    );
}
