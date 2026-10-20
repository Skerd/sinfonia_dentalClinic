import {compose} from "redux";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {CLINIC_CARD, CLINIC_HEADING, CLINIC_PRIMARY_BUTTON} from "../shared/clinicStyles.ts";

function NotFoundPage({resolveLanguageKey}: WithLanguageType) {
    return (
        <div className={`${CLINIC_CARD} flex flex-col items-start gap-3`}>
            <h1 className={`${CLINIC_HEADING} text-2xl`}>{resolveLanguageKey("title")}</h1>
            <p className="text-rent-ink-muted">{resolveLanguageKey("text")}</p>
            <Link to="/" className={CLINIC_PRIMARY_BUTTON}>{resolveLanguageKey("backHome")}</Link>
        </div>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/client/public/notFound/index.tsx"))(NotFoundPage);
