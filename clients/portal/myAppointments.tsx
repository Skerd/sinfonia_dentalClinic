import {compose} from "redux";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle} from "@coreModule/components/ui/item.tsx";
import {useCompanyLink} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import type {MyAppointmentsResponse} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.response.types.ts";

function atClinic(iso: string, timeZone: string, locale: string): string {
    return new Intl.DateTimeFormat(locale, {timeZone, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"}).format(new Date(iso));
}

/** The portal account's appointments at every clinic; each opens the clinic's manage page. */
function MyAppointments({resolveLanguageKey, languageCode}: WithLanguageType) {
    const companyLink = useCompanyLink();
    const [rows, setRows] = useState<MyAppointmentsResponse["data"] | null>(null);

    useEffect(() => {
        let cancelled = false;
        apiClient.post<MyAppointmentsResponse>("/api/dentalClinic/clinicStorefront/mine", {})
            .then((res) => { if (!cancelled) setRows(res.data.data); })
            .catch(() => { if (!cancelled) setRows([]); });
        return () => { cancelled = true; };
    }, []);

    if (rows === null) return <Loader />;
    if (rows.length === 0) return <p className="text-muted-foreground">{resolveLanguageKey("none")}</p>;

    return (
        <ItemGroup className="gap-2">
            {rows.map(({appointment, company, manageToken}) => (
                <Item key={appointment._id} variant="outline">
                    <ItemContent>
                        <ItemTitle>{appointment.serviceName} · {company.name}</ItemTitle>
                        <ItemDescription>
                            {atClinic(appointment.startAt, appointment.timezone, languageCode)} · {appointment.practitionerName}
                            {" · "}{appointment.number}
                        </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <Badge variant="secondary">{resolveLanguageKey(`status.${appointment.status}`, true) ?? appointment.status}</Badge>
                        <Button asChild variant="outline">
                            <Link to={companyLink("dentists", company.slug, `/manage?${new URLSearchParams({token: manageToken})}`)}>{resolveLanguageKey("manage")}</Link>
                        </Button>
                    </ItemActions>
                </Item>
            ))}
        </ItemGroup>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/portal/myAppointments.tsx"))(MyAppointments);
