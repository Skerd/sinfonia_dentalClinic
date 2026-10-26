import {compose} from "redux";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import type {MyAppointmentsResponse} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.response.types.ts";

function atClinic(iso: string, timeZone: string, locale: string): string {
    return new Intl.DateTimeFormat(locale, {timeZone, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"}).format(new Date(iso));
}

/** The portal account's appointments at every clinic; each opens the clinic's manage page. */
function MyAppointments({resolveLanguageKey, languageCode}: WithLanguageType) {
    const [rows, setRows] = useState<MyAppointmentsResponse["data"] | null>(null);

    useEffect(() => {
        let cancelled = false;
        apiClient.post<MyAppointmentsResponse>("/api/dentalClinic/clinicStorefront/mine", {})
            .then((res) => { if (!cancelled) setRows(res.data.data); })
            .catch(() => { if (!cancelled) setRows([]); });
        return () => { cancelled = true; };
    }, []);

    if (rows === null) return <Loader />;
    if (rows.length === 0) return <p className="text-portal-ink-muted">{resolveLanguageKey("none")}</p>;

    return (
        <ul className="flex flex-col divide-y divide-portal-border">
            {rows.map(({appointment, company, manageToken}) => (
                <li key={appointment._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                        <p className="font-medium">{appointment.serviceName} · {company.name}</p>
                        <p className="text-sm text-portal-ink-muted">
                            {atClinic(appointment.startAt, appointment.timezone, languageCode)} · {appointment.practitionerName}
                            {" · "}{appointment.number} · {resolveLanguageKey(`status.${appointment.status}`, true) ?? appointment.status}
                        </p>
                    </div>
                    <Link to={`/dentists/${company.slug}/manage?${new URLSearchParams({token: manageToken})}`} className="text-sm font-semibold text-portal-accent hover:underline">
                        {resolveLanguageKey("manage")}
                    </Link>
                </li>
            ))}
        </ul>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/portal/myAppointments.tsx"))(MyAppointments);
