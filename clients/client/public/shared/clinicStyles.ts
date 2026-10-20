/** Shared class names for the clinic site, built on the `--color-clinic-*` tokens. */
export const CLINIC_CARD = "rounded-2xl border border-clinic-border bg-clinic-card p-5 sm:p-6";
export const CLINIC_INPUT =
    "h-11 w-full rounded-lg border border-clinic-border bg-white px-3 text-[15px] text-clinic-ink placeholder:text-clinic-ink-faded disabled:opacity-60";
export const CLINIC_LABEL = "text-sm font-medium text-clinic-ink";
export const CLINIC_PRIMARY_BUTTON =
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-clinic-accent px-5 text-[15px] font-semibold text-white transition-colors hover:bg-clinic-accent-strong disabled:cursor-not-allowed disabled:opacity-60";
export const CLINIC_SECONDARY_BUTTON =
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-clinic-border bg-white px-5 text-[15px] font-semibold text-clinic-ink transition-colors hover:bg-clinic-surface disabled:opacity-60";
export const CLINIC_HEADING = "font-[family-name:var(--font-clinic-display)] font-semibold tracking-tight text-clinic-ink";
/** A selectable tile (treatment, location, dentist, time); `aria-pressed` marks the chosen one. */
export const CLINIC_CHOICE =
    "rounded-xl border border-clinic-border bg-white p-4 text-left transition-colors hover:border-clinic-accent aria-pressed:border-clinic-accent aria-pressed:bg-clinic-accent-soft";
