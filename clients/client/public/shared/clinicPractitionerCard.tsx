import type {ReactNode} from "react";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {ClinicStorefrontPractitioner} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.response.types.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {languageNames} from "./clinicFormat.ts";

type ClinicPractitionerCardProps = {
    practitioner: ClinicStorefrontPractitioner;
    roleLabel: string;
    locationsLabel?: string;
    selected?: boolean;
    onSelect?: () => void;
    children?: ReactNode;
};

/** Photo, name, role, languages and bio — the same facts on the clinic home and a treatment. */
export function ClinicPractitionerCard({practitioner, roleLabel, locationsLabel, selected, onSelect, children}: ClinicPractitionerCardProps) {
    const photo = practitioner.photo ? (
        <img src={practitioner.photo} alt="" className="size-16 shrink-0 rounded-full object-cover" />
    ) : (
        <div className="size-16 shrink-0 rounded-full bg-muted" aria-hidden />
    );
    const body = (
        <>
            {photo}
            <div className="min-w-0 flex-1">
                <p className="font-display text-base font-semibold tracking-tight">{practitioner.displayName}</p>
                <p className="text-sm text-muted-foreground">{roleLabel}</p>
                {practitioner.languages.length ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">{languageNames(practitioner.languages)}</p>
                ) : null}
                {practitioner.bio ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{practitioner.bio}</p>
                ) : null}
                {locationsLabel ? (
                    <p className="mt-2 text-xs text-muted-foreground">{locationsLabel}</p>
                ) : null}
                {children}
            </div>
        </>
    );
    const className = cn(
        "flex w-full gap-4 rounded-2xl border bg-card p-4 text-left",
        onSelect && "transition-colors hover:border-foreground",
        selected && "border-foreground ring-1 ring-foreground",
    );
    if (onSelect) {
        return (
            <Button type="button" variant="bare" className={className} aria-pressed={selected} onClick={onSelect}>
                {body}
            </Button>
        );
    }
    return <div className={className}>{body}</div>;
}
