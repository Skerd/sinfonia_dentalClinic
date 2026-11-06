import {compose} from "redux";
import {useCallback, useState} from "react";
import {Link, useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle} from "@coreModule/components/ui/item.tsx";
import {usePortalSite} from "@coreModule/clients/portal/shared/portalSiteContext.tsx";
import type {PatientCasesResponse} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";
import CaseDialog from "./caseDialog.tsx";

const CASES_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/patientPortal/cases"};

/** The portal account's estimate requests, each with every clinic's status; `?case=` opens one. */
function MyDentalCases({resolveLanguageKey, languageCode}: WithLanguageType) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [casesCount, setCasesCount] = useState(1);
    const casesRequest = useHttpRequest<PatientCasesResponse>(CASES_REQUEST, {}, casesCount);
    const cases = casesRequest.error ? [] : casesRequest.data?.data ?? null;
    const openCase = searchParams.get("case");
    // A clinic's own site asks that clinic; the portal lets the patient pick several.
    const requestHref = usePortalSite().site?.scope === "company" ? "/dentists/request" : "/dentists/request-quotes";

    const load = useCallback(() => setCasesCount((count) => count + 1), []);

    const setOpenCase = (requestGroup: string | null) => {
        const next = new URLSearchParams(searchParams);
        if (requestGroup) next.set("case", requestGroup);
        else next.delete("case");
        setSearchParams(next, {replace: true});
    };

    if (cases === null) return <Loader />;

    return (
        <div className="flex flex-col gap-3">
            {cases.length === 0 ? (
                <div className="flex flex-col gap-2">
                    <p className="text-muted-foreground">{resolveLanguageKey("none")}</p>
                    <Button asChild variant="outline" className="self-start"><Link to={requestHref}>{resolveLanguageKey("start")}</Link></Button>
                </div>
            ) : (
                <ItemGroup className="gap-2">
                    {cases.map((patientCase) => {
                        const unread = patientCase.inquiries.reduce((total, inquiry) => total + inquiry.unreadForPatient, 0);
                        const asked = patientCase.inquiries.some((inquiry) => inquiry.openInfoRequests.length);
                        return (
                            <Item key={patientCase.requestGroup} variant="outline">
                                <ItemContent>
                                    <ItemTitle>{patientCase.treatmentsWanted.map((treatment) => resolveLanguageKey(`treatment.${treatment}`)).join(", ")}</ItemTitle>
                                    <ItemDescription>
                                        {new Intl.DateTimeFormat(languageCode, {dateStyle: "medium"}).format(new Date(patientCase.createdAt))}
                                        {" · "}
                                        {patientCase.inquiries.map((inquiry) => `${inquiry.clinic.name}: ${resolveLanguageKey(`status.${inquiry.status}`)}`).join(" · ")}
                                    </ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    {asked ? <Badge variant="outline">{resolveLanguageKey("actionNeeded")}</Badge> : null}
                                    {unread ? <Badge>{resolveLanguageKey("unread").replace("{count}", String(unread))}</Badge> : null}
                                    <Button variant="outline" onClick={() => setOpenCase(patientCase.requestGroup)}>{resolveLanguageKey("open")}</Button>
                                </ItemActions>
                            </Item>
                        );
                    })}
                </ItemGroup>
            )}
            {openCase ? <CaseDialog requestGroup={openCase} onClose={() => setOpenCase(null)} onChanged={load} /> : null}
        </div>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/portal/cases/myDentalCases.tsx"))(MyDentalCases);
