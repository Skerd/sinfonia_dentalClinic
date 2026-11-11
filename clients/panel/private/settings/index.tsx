import {compose} from "redux";
import {useLocation} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import SimpleError from "@coreModule/components/custom/errors/errorViewWrapper.tsx";
import type {ClinicConfig} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicConfig/clinicConfig.dto.ts";
import EditClinicConfig from "@dentalClinicModule/clients/panel/private/settings/editClinicConfig.tsx";
import {isClinicConfigSection, type ClinicConfigSection} from "@dentalClinicModule/clients/panel/private/settings/clinicConfigSections.ts";

const ENSURE_CONFIG_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/clinicConfig/ensure"};

/** One settings record per company: make sure it exists, then edit the open section in place. */
function ClinicSettingsGate({resolveLanguageKey}: WithLanguageType) {
    const {pathname} = useLocation();
    const segment = pathname.split("/").filter(Boolean)[3];
    const section: ClinicConfigSection = isClinicConfigSection(segment) ? segment : "booking";

    const {data: config, error} = useHttpRequest<ClinicConfig>(ENSURE_CONFIG_REQUEST, {}, 1);

    if (error) return <SimpleError title={String(resolveLanguageKey("loadError"))} />;
    if (!config) return <Loader />;
    // The route crumbs already end with the section, so the page publishes no extra title (it would repeat it).
    return <EditClinicConfig key={section} entityId={config._id} />;
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/settings/index.tsx"),
    withDebug(true, true, "clinicconfigs"),
)(ClinicSettingsGate);
