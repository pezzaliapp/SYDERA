/// <reference types="vite/client" />

/**
 * Release identity, injected at build time from package.json and git.
 * Declared here so the application can show which build it is running.
 */
declare const __SYDERA_VERSION__: string
declare const __SYDERA_COMMIT__: string
declare const __SYDERA_BUILD_DATE__: string
/** Fingerprints of the shipped place datasets; see vite.config.ts. */
declare const __SYDERA_PLACES_IT_VERSION__: string
declare const __SYDERA_PLACES_WORLD_VERSION__: string
