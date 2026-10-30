import {compose} from "redux";
import {useCallback, useEffect, useRef, useState} from "react";
import {IconFileUpload} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@coreModule/components/ui/dialog.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@coreModule/components/ui/tabs.tsx";
import {PATIENT_FILE_MIME_TYPES, type InquiryStatus} from "armonia/src/modules/dentalClinic/constants/index.ts";
import type {
    PatientCase,
    PatientCaseResponse,
    PatientInquiry,
    PatientInquiryResponse,
} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";
import PatientThread from "./patientThread.tsx";
import CaseOffers from "./caseOffers.tsx";
import CaseMedicalHistory from "./caseMedicalHistory.tsx";
import {openPatientFile, uploadPatientFiles} from "./patientFiles.ts";

const OPEN: InquiryStatus[] = ["new", "in_review", "info_requested", "quoted"];

type Props = WithLanguageType & {
    requestGroup: string;
    onClose: () => void;
    /** Something changed (read, withdrawn, files added): the list should refresh. */
    onChanged: () => void;
};

/** One request: each clinic's answer, what it asked for, the files and the conversation. */
function CaseDialog({requestGroup, onClose, onChanged, resolveLanguageKey}: Props) {
    const [patientCase, setPatientCase] = useState<PatientCase | null>(null);
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);
    const [uploadFor, setUploadFor] = useState<PatientInquiry | null>(null);

    const load = useCallback(() => {
        apiClient.post<PatientCaseResponse>("/api/dentalClinic/patientPortal/case", {requestGroup})
            .then((res) => setPatientCase(res.data.data))
            .catch(() => setFailed(true));
    }, [requestGroup]);

    useEffect(() => { load(); }, [load]);

    const replace = (updated: PatientInquiry) => {
        setPatientCase((current) => current && {...current, inquiries: current.inquiries.map((inquiry) => (inquiry._id === updated._id ? updated : inquiry))});
        onChanged();
    };

    const act = async (inquiry: PatientInquiry, path: "shareContact" | "withdraw") => {
        setBusy(true);
        setFailed(false);
        try {
            const res = await apiClient.post<PatientInquiryResponse>(`/api/dentalClinic/patientPortal/${path}`, {inquiry: inquiry._id});
            replace(res.data.data);
        } catch {
            setFailed(true);
        } finally {
            setBusy(false);
        }
    };

    const attach = async (picked: File[]) => {
        if (!uploadFor || !picked.length) return;
        setBusy(true);
        setFailed(false);
        try {
            const files = await uploadPatientFiles(picked);
            const res = await apiClient.post<PatientInquiryResponse>("/api/dentalClinic/patientPortal/attach", {
                inquiry: uploadFor._id,
                files: files.map((file) => file._id),
                fulfils: uploadFor.openInfoRequests,
            });
            replace(res.data.data);
        } catch {
            setFailed(true);
        } finally {
            setBusy(false);
            setUploadFor(null);
            if (fileInput.current) fileInput.current.value = "";
        }
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{resolveLanguageKey("title")}</DialogTitle>
                    <DialogDescription>
                        {patientCase ? patientCase.treatmentsWanted.map((treatment) => resolveLanguageKey(`treatment.${treatment}`)).join(", ") : null}
                    </DialogDescription>
                </DialogHeader>
                {!patientCase && !failed ? <Loader /> : null}
                {failed ? <p className="text-sm text-destructive">{resolveLanguageKey("failed")}</p> : null}
                <input ref={fileInput} type="file" multiple hidden accept={PATIENT_FILE_MIME_TYPES.join(",") + ",.dcm,.stl,.zip"} onChange={(event) => attach([...(event.target.files ?? [])])} />
                {patientCase ? <CaseOffers requestGroup={requestGroup} onAccepted={() => { load(); onChanged(); }} /> : null}
                {patientCase ? <CaseMedicalHistory patientCase={patientCase} onSaved={(updated: PatientCase) => { setPatientCase(updated); onChanged(); }} /> : null}
                {patientCase ? (
                    <Tabs defaultValue={patientCase.inquiries[0]?._id}>
                        <TabsList className="flex-wrap">
                            {patientCase.inquiries.map((inquiry) => (
                                <TabsTrigger key={inquiry._id} value={inquiry._id}>
                                    {inquiry.clinic.name}
                                    {inquiry.unreadForPatient ? <Badge className="ml-2">{inquiry.unreadForPatient}</Badge> : null}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {patientCase.inquiries.map((inquiry) => {
                            const open = OPEN.includes(inquiry.status);
                            return (
                                <TabsContent key={inquiry._id} value={inquiry._id} className="flex flex-col gap-5 pt-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary">{resolveLanguageKey(`status.${inquiry.status}`)}</Badge>
                                        <span className="text-xs text-muted-foreground">{inquiry.number}</span>
                                    </div>

                                    {inquiry.openInfoRequests.length ? (
                                        <div className="flex flex-col gap-2 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
                                            <p className="text-sm font-medium">{resolveLanguageKey("askedFor")}</p>
                                            <ul className="list-inside list-disc text-sm">
                                                {inquiry.infoRequests.filter((request) => !request.fulfilledAt).map((request) => (
                                                    <li key={`${request.kind}-${request.requestedAt}`}>
                                                        {resolveLanguageKey(`kind.${request.kind}`)}{request.note ? ` — ${request.note}` : ""}
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button type="button" size="sm" className="self-start" disabled={busy} onClick={() => { setUploadFor(inquiry); fileInput.current?.click(); }}>
                                                <IconFileUpload size={16} />{resolveLanguageKey("sendFiles")}
                                            </Button>
                                        </div>
                                    ) : null}

                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium">{resolveLanguageKey("files")}</p>
                                        {inquiry.files.length ? inquiry.files.map((file) => (
                                            <button key={file._id} type="button" className="self-start text-sm underline" onClick={() => openPatientFile(file)}>{file.name}</button>
                                        )) : <p className="text-sm text-muted-foreground">{resolveLanguageKey("noFiles")}</p>}
                                        {open && !inquiry.openInfoRequests.length ? (
                                            <Button type="button" variant="outline" size="sm" className="mt-1 self-start" disabled={busy} onClick={() => { setUploadFor(inquiry); fileInput.current?.click(); }}>
                                                <IconFileUpload size={16} />{resolveLanguageKey("addFiles")}
                                            </Button>
                                        ) : null}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-medium">{resolveLanguageKey("conversation")}</p>
                                        <PatientThread
                                            inquiryId={inquiry._id}
                                            clinicName={inquiry.clinic.name}
                                            canReply={open || inquiry.status === "converted"}
                                            onRead={inquiry.unreadForPatient ? onChanged : undefined}
                                        />
                                    </div>

                                    {open ? (
                                        <div className="flex flex-wrap gap-2 border-t pt-4">
                                            {!inquiry.contactShared ? (
                                                <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => act(inquiry, "shareContact")}>
                                                    {resolveLanguageKey("shareContact")}
                                                </Button>
                                            ) : <span className="text-xs text-muted-foreground">{resolveLanguageKey("contactShared")}</span>}
                                            <Button type="button" variant="ghost" size="sm" className="text-destructive" disabled={busy} onClick={() => act(inquiry, "withdraw")}>
                                                {resolveLanguageKey("withdraw")}
                                            </Button>
                                        </div>
                                    ) : null}
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/portal/cases/caseDialog.tsx"))(CaseDialog);
