import {useFormContext} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@coreModule/components/ui/form.tsx";
import {Checkbox} from "@coreModule/components/ui/checkbox.tsx";

export type EnumChecklistOption = {value: string; label: string};

type EnumChecklistProps = {
    name: string;
    label?: string;
    /** Option labels are language keys. */
    options: EnumChecklistOption[];
    resolveLanguageKey: (key: string) => unknown;
    loading?: boolean;
};

/** Several values of a fixed list (treatments wanted, documents asked for) as a grid of checkboxes. */
export default function EnumChecklist({name, label, options, resolveLanguageKey, loading = false}: EnumChecklistProps) {
    const form = useFormContext();
    return (
        <FormField
            control={form.control}
            name={name}
            render={({field}) => {
                const selected: string[] = Array.isArray(field.value) ? field.value : [];
                const toggle = (value: string, checked: boolean) =>
                    field.onChange(checked ? [...selected, value] : selected.filter((entry) => entry !== value));
                return (
                    <FormItem>
                        {label ? <FormLabel>{label}</FormLabel> : null}
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {options.map((option) => (
                                <label key={option.value} className="flex items-center gap-2 text-sm">
                                    <FormControl>
                                        <Checkbox
                                            checked={selected.includes(option.value)}
                                            disabled={loading}
                                            onCheckedChange={(checked) => toggle(option.value, checked === true)}
                                        />
                                    </FormControl>
                                    {String(resolveLanguageKey(option.label))}
                                </label>
                            ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}
