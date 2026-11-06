import {compose} from "redux";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle} from "@coreModule/components/ui/item.tsx";
import {useCompanyLink} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import type {MyAppointmentsResponse} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.response.types.ts";

function atClinic(iso: string, timeZone: string, locale: string): string {
    return new Intl.DateTimeFormat(locale, {timeZone, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"}).format(new Date(iso));
}

const MINE_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/clinicStorefront/mine"};

/** The portal account's appointments at every clinic; each opens the clinic's manage page. */
function MyAppointments({resolveLanguageKey, languageCode}: WithLanguageType) {
    const companyLink = useCompanyLink();
    const mine = useHttpRequest<MyAppointmentsResponse>(MINE_REQUEST, {}, 1);
    const rows = mine.error ? [] : mine.data?.data ?? null;

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
