/**
 * Which build is running.
 *
 * A user reporting a problem, and anyone verifying a deployment, needs to know
 * this without opening developer tools — a green deployment does not prove the
 * browser received the new application.
 */
export const release = Object.freeze({
  version: __SYDERA_VERSION__,
  commit: __SYDERA_COMMIT__,
  buildDate: __SYDERA_BUILD_DATE__,
  /** "SYDERA v0.2.1 · a1b2c3d" */
  get label(): string {
    return `SYDERA v${__SYDERA_VERSION__} · ${__SYDERA_COMMIT__}`
  },
})
