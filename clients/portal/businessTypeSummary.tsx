import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";

/** Dental clinic as a business a person may create on the portal (D178): its name and a one-line pitch. */
function BusinessTypeSummary({resolveLanguageKey}: WithLanguageType) {
    return (
        <span className="flex flex-col gap-1">
            <span className="font-semibold text-foreground">{resolveLanguageKey("name")}</span>
            <span className="text-sm text-muted-foreground">{resolveLanguageKey("pitch")}</span>
        </span>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/portal/businessTypeSummary.tsx"))(BusinessTypeSummary);
