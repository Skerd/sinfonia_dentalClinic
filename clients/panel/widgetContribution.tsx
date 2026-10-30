import type {CompoundFormWidgetRenderer, WidgetContribution} from "@coreModule/helpers/types/widgetContribution.types.ts";
import EnumChecklist, {type EnumChecklistOption} from "@dentalClinicModule/components/custom/forms/enumChecklist.tsx";
import ToothPicker from "@dentalClinicModule/components/custom/forms/toothPicker.tsx";

const isOption = (value: unknown): value is EnumChecklistOption =>
    !!value && typeof value === "object" && typeof (value as {value?: unknown}).value === "string" && typeof (value as {label?: unknown}).label === "string";

/** `widgetProps.options` are `{value, label}` with language-key labels, translated by the form. */
const enumChecklist: CompoundFormWidgetRenderer = ({Widget, binding, resolveLanguageKey, extra}) => (
    <Widget
        name={binding.name}
        label={binding.label ? String(resolveLanguageKey(binding.label)) : undefined}
        options={Array.isArray(binding.widgetProps?.options) ? binding.widgetProps.options.filter(isOption) : []}
        resolveLanguageKey={resolveLanguageKey}
        loading={extra?.loading ?? false}
    />
);

/** FDI chart; the adult/children toggle labels come from the form's language file. */
const toothPicker: CompoundFormWidgetRenderer = ({Widget, binding, resolveLanguageKey, extra}) => (
    <Widget
        name={binding.name}
        label={binding.label ? String(resolveLanguageKey(binding.label)) : undefined}
        primaryLabel={String(resolveLanguageKey("form.toothPickerPrimary"))}
        permanentLabel={String(resolveLanguageKey("form.toothPickerPermanent"))}
        loading={extra?.loading ?? false}
    />
);

const dentalClinicWidgetContribution: WidgetContribution = {
    id: "dentalClinic",
    order: 37,
    widgets: {
        "#EnumChecklist": EnumChecklist,
        "#ToothPicker": ToothPicker,
    },
    compoundFormWidgetRenderers: {
        "#EnumChecklist": enumChecklist,
        "#ToothPicker": toothPicker,
    },
};

export default dentalClinicWidgetContribution;
