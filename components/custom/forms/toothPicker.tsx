import {useState} from "react";
import {useFormContext} from "react-hook-form";
import {FormField, FormItem, FormLabel, FormMessage} from "@coreModule/components/ui/form.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {FDI_PERMANENT_TEETH, FDI_PRIMARY_TEETH} from "armonia/src/modules/dentalClinic/constants/index.ts";

type ToothPickerProps = {
    name: string;
    label?: string;
    /** Language keys for the toggle between adult and children's teeth. */
    primaryLabel: string;
    permanentLabel: string;
    loading?: boolean;
};

/** Upper jaw on top, lower below, patient's right on the left: the chart as the dentist reads it. */
function rows(teeth: readonly string[]): [string[], string[]] {
    const half = teeth.length / 2;
    return [teeth.slice(0, half), teeth.slice(half)];
}

/** Picks teeth on an FDI chart; the value is the list of FDI numbers. */
export default function ToothPicker({name, label, primaryLabel, permanentLabel, loading = false}: ToothPickerProps) {
    const form = useFormContext();
    const [primary, setPrimary] = useState(false);
    const [upper, lower] = rows(primary ? FDI_PRIMARY_TEETH : FDI_PERMANENT_TEETH);

    return (
        <FormField
            control={form.control}
            name={name}
            render={({field}) => {
                const selected: string[] = Array.isArray(field.value) ? field.value : [];
                const toggle = (tooth: string) =>
                    field.onChange(selected.includes(tooth) ? selected.filter((entry) => entry !== tooth) : [...selected, tooth]);
                const row = (teeth: string[]) => (
                    <div className="flex flex-wrap gap-1">
                        {teeth.map((tooth, index) => (
                            <button
                                key={tooth}
                                type="button"
                                disabled={loading}
                                onClick={() => toggle(tooth)}
                                aria-pressed={selected.includes(tooth)}
                                className={cn(
                                    "h-7 w-8 rounded border text-xs tabular-nums",
                                    index === teeth.length / 2 && "ml-2",
                                    selected.includes(tooth) ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted",
                                )}
                            >
                                {tooth}
                            </button>
                        ))}
                    </div>
                );
                return (
                    <FormItem>
                        <div className="flex items-center justify-between gap-2">
                            {label ? <FormLabel>{label}</FormLabel> : <span />}
                            <Button type="button" variant="ghost" size="sm" onClick={() => setPrimary((current) => !current)}>
                                {primary ? permanentLabel : primaryLabel}
                            </Button>
                        </div>
                        <div className="flex flex-col gap-1">
                            {row(upper)}
                            {row(lower)}
                        </div>
                        {selected.length ? <p className="text-xs text-muted-foreground">{[...selected].sort().join(", ")}</p> : null}
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}
