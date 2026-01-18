import React from 'react';
import styles from './discord-loader.module.css';

export function DiscordLoader() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.main}>
                <div className={styles.up}>
                    <div className={styles.loaders}>
                        <div className={styles.loader} />
                        <div className={styles.loader} />
                        <div className={styles.loader} />
                        <div className={styles.loader} />
                        <div className={styles.loader} />
                        <div className={styles.loader} />
                        <div className={styles.loader} />
                        <div className={styles.loader} />
                        <div className={styles.loader} />
                        <div className={styles.loader} />
                    </div>
                    <div className={styles.loadersB}>
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className={styles.loaderA}>
                                <div className={`${styles.ball} ${styles[`ball${i}`]}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
