import {compose} from "redux";
import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import SimpleError from "@coreModule/components/custom/errors/errorViewWrapper.tsx";
import type {ClinicConfig} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicConfig/clinicConfig.dto.ts";
import EditClinicConfig from "@dentalClinicModule/clients/panel/private/settings/editClinicConfig.tsx";
import {isClinicConfigSection, type ClinicConfigSection} from "@dentalClinicModule/clients/panel/private/settings/clinicConfigSections.ts";

/** One settings record per company: make sure it exists, then edit the open section in place. */
function ClinicSettingsGate({resolveLanguageKey}: WithLanguageType) {
    const {pathname} = useLocation();
    const segment = pathname.split("/").filter(Boolean)[3];
    const section: ClinicConfigSection = isClinicConfigSection(segment) ? segment : "booking";

    const [configId, setConfigId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        apiClient
            .post<ClinicConfig>("/api/dentalClinic/clinicConfig/ensure", {})
            .then((res) => {
                if (!cancelled) setConfigId(res.data._id);
            })
            .catch(() => {
                if (!cancelled) setError(String(resolveLanguageKey("loadError")));
            });
        return () => {
            cancelled = true;
        };
    }, [resolveLanguageKey]);

    if (error) return <SimpleError title={error} />;
    if (!configId) return <Loader />;
    const sectionTitle = String(resolveLanguageKey(`menus.tenancy.systemSettings.clinicConfig.${section}.title`));
    return <EditClinicConfig key={section} entityId={configId} entityName={sectionTitle} />;
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/settings/index.tsx"),
    withDebug(true, true, "clinicconfigs"),
)(ClinicSettingsGate);
