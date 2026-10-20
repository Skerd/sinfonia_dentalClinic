import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {useClinicConfig} from "../shared/clinicConfigContext.tsx";
import {CLINIC_CARD, CLINIC_HEADING} from "../shared/clinicStyles.ts";

/** The privacy notice patients accept before booking; plain text, kept as the clinic wrote it. */
function PrivacyPage({resolveLanguageKey}: WithLanguageType) {
    const {config} = useClinicConfig();
    return (
        <article className={`${CLINIC_CARD} mx-auto flex max-w-3xl flex-col gap-4`}>
            <h1 className={`${CLINIC_HEADING} text-2xl`}>{resolveLanguageKey("title")}</h1>
            {config?.privacyNoticeVersion ? <p className="text-sm text-clinic-ink-faded">{resolveLanguageKey("version")} {config.privacyNoticeVersion}</p> : null}
            <div className="whitespace-pre-line leading-relaxed">{config?.privacyNoticeText || resolveLanguageKey("empty")}</div>
        </article>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/client/public/privacy/index.tsx"))(PrivacyPage);
