import {compose} from "redux";
import {useCallback, useEffect, useRef, useState} from "react";
import {IconFileUpload} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
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
    PatientUploadResponse,
} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";
import PatientThread from "./patientThread.tsx";
import CaseOffers from "./caseOffers.tsx";
import CaseMedicalHistory from "./caseMedicalHistory.tsx";
import {openPatientFile, PATIENT_UPLOAD_REQUEST, patientFilesForm} from "./patientFiles.ts";
import {Input} from "@coreModule/components/ui/input.tsx";

const OPEN: InquiryStatus[] = ["new", "in_review", "info_requested", "quoted"];

const CASE_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/patientPortal/case"};
/** The url is the action (`shareContact` or `withdraw`), set per call. */
const INQUIRY_ACTION_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/patientPortal"};
const ATTACH_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/patientPortal/attach"};

type Props = WithLanguageType & {
    requestGroup: string;
    onClose: () => void;
    /** Something changed (read, withdrawn, files added): the list should refresh. */
    onChanged: () => void;
};

/** One request: each clinic's answer, what it asked for, the files and the conversation. */
function CaseDialog({requestGroup, onClose, onChanged, resolveLanguageKey}: Props) {
    const [patientCase, setPatientCase] = useState<PatientCase | null>(null);
    const [failed, setFailed] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);
    const [uploadFor, setUploadFor] = useState<PatientInquiry | null>(null);

    const [caseCount, setCaseCount] = useState(0);
    useHttpRequest<PatientCaseResponse>(CASE_REQUEST, {requestGroup}, caseCount, true, {
        success: (response) => setPatientCase(response.data),
        error: () => setFailed(true),
    });
    const load = useCallback(() => setCaseCount((count) => count + 1), []);

    useEffect(() => { load(); }, [load, requestGroup]);

    const replace = (updated: PatientInquiry) => {
        setPatientCase((current) => current && {...current, inquiries: current.inquiries.map((inquiry) => (inquiry._id === updated._id ? updated : inquiry))});
        onChanged();
    };
    const inquiryLifecycle = {
        start: () => setFailed(false),
        success: (response: PatientInquiryResponse) => replace(response.data),
        error: () => setFailed(true),
    };

    const [action, setAction] = useState<{path: "shareContact" | "withdraw"; inquiry: string; count: number}>({path: "withdraw", inquiry: "", count: 0});
    const actRequest = useHttpRequest<PatientInquiryResponse>(INQUIRY_ACTION_REQUEST, {inquiry: action.inquiry}, action.count, true, inquiryLifecycle, {
        url: `${INQUIRY_ACTION_REQUEST.url}/${action.path}`,
    });
    const act = (inquiry: PatientInquiry, path: "shareContact" | "withdraw") =>
        setAction((current) => ({path, inquiry: inquiry._id, count: current.count + 1}));

    // Attaching uploads the files first, then names them on the inquiry.
    const [attachment, setAttachment] = useState<{payload: Record<string, unknown>; count: number}>({payload: {}, count: 0});
    const attachRequest = useHttpRequest<PatientInquiryResponse>(ATTACH_REQUEST, attachment.payload, attachment.count, true, inquiryLifecycle);
    const finishUpload = () => {
        setUploadFor(null);
        if (fileInput.current) fileInput.current.value = "";
    };
    const [upload, setUpload] = useState<{form: FormData; count: number}>(() => ({form: new FormData(), count: 0}));
    const uploadRequest = useHttpRequest<PatientUploadResponse>(PATIENT_UPLOAD_REQUEST, upload.form, upload.count, true, {
        start: () => setFailed(false),
        success: (response) => {
            if (uploadFor) {
                setAttachment((current) => ({
                    payload: {inquiry: uploadFor._id, files: response.data.map((file) => file._id), fulfils: uploadFor.openInfoRequests},
                    count: current.count + 1,
                }));
            }
            finishUpload();
        },
        error: () => {
            setFailed(true);
            finishUpload();
        },
    });
    const attach = (picked: File[]) => {
        if (!uploadFor || !picked.length) return;
        setUpload((current) => ({form: patientFilesForm(picked), count: current.count + 1}));
    };
    const busy = uploadRequest.loading || actRequest.loading || attachRequest.loading;

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
                <Input ref={fileInput} type="file" multiple hidden accept={PATIENT_FILE_MIME_TYPES.join(",") + ",.dcm,.stl,.zip"} onChange={(event) => attach([...(event.target.files ?? [])])} />
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
                                            <Button key={file._id} type="button" variant="bare" className="self-start text-sm underline" onClick={() => openPatientFile(file)}>{file.name}</Button>
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
