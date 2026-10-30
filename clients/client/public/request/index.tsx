import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {useClinicConfig} from "../shared/clinicConfigContext.tsx";
import PatientRequestForm from "@dentalClinicModule/clients/portal/request/patientRequestForm.tsx";

/** Ask this clinic for an estimate: what you need, your X-rays, when you could come. */
function RequestPage({resolveLanguageKey}: WithLanguageType) {
    const {config} = useClinicConfig();
    if (!config) return null;
    if (!config.inquiriesEnabled) return <p className="text-muted-foreground">{resolveLanguageKey("unavailable")}</p>;

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="font-display text-3xl font-bold tracking-tight">{resolveLanguageKey("title")}</h1>
                <p className="text-muted-foreground">{resolveLanguageKey("subtitle")}</p>
            </div>
            <PatientRequestForm clinics={[{_id: config.company._id, name: config.company.name}]} />
        </div>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/client/public/request/index.tsx"))(RequestPage);
