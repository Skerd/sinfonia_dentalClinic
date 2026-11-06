import {compose} from "redux";
import {useCallback, useEffect, useRef, useState} from "react";
import {IconPaperclip, IconSend} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {CLINIC_MESSAGE_ATTACHMENTS_MAX, CLINIC_MESSAGE_BODY_MAX, PATIENT_FILE_MIME_TYPES} from "armonia/src/modules/dentalClinic/constants/index.ts";
import type {PatientMessage, PatientThreadResponse, PatientUploadResponse} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";
import {openPatientFile, PATIENT_UPLOAD_REQUEST, patientFilesForm} from "./patientFiles.ts";
import {Input} from "@coreModule/components/ui/input.tsx";

const THREAD_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/patientPortal/thread"};
const MESSAGE_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/patientPortal/message"};

type Props = WithLanguageType & {
    inquiryId: string;
    clinicName: string;
    canReply: boolean;
    /** The thread was opened, so the clinic's messages are now read. */
    onRead?: () => void;
};

/** The patient's conversation with one clinic about their request. */
function PatientThread({inquiryId, clinicName, canReply, onRead, resolveLanguageKey}: Props) {
    const [threadCount, setThreadCount] = useState(0);
    const thread = useHttpRequest<PatientThreadResponse>(THREAD_REQUEST, {inquiry: inquiryId}, threadCount, true, {
        success: () => onRead?.(),
    });
    const messages: PatientMessage[] | null = thread.error ? [] : thread.data?.data ?? null;
    const [body, setBody] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    // The message is sent once its attachments are uploaded; the payload names them.
    const [message, setMessage] = useState<{payload: Record<string, unknown>; count: number}>({payload: {}, count: 0});
    const fileInput = useRef<HTMLInputElement>(null);

    const load = useCallback(() => setThreadCount((count) => count + 1), []);

    useEffect(() => { load(); }, [load, inquiryId]);

    const messageRequest = useHttpRequest(MESSAGE_REQUEST, message.payload, message.count, true, {
        success: () => {
            setBody("");
            setFiles([]);
            load();
        },
    });
    const sendMessage = (attachments: string[]) => setMessage((current) => ({
        payload: {inquiry: inquiryId, body: body.trim(), attachments},
        count: current.count + 1,
    }));
    const [upload, setUpload] = useState<{form: FormData; count: number}>(() => ({form: new FormData(), count: 0}));
    const uploadRequest = useHttpRequest<PatientUploadResponse>(PATIENT_UPLOAD_REQUEST, upload.form, upload.count, true, {
        success: (response) => sendMessage(response.data.map((file) => file._id)),
    });
    const sending = uploadRequest.loading || messageRequest.loading;
    const failed = !!uploadRequest.error || !!messageRequest.error;

    const send = () => {
        if (!body.trim()) return;
        if (files.length) setUpload((current) => ({form: patientFilesForm(files), count: current.count + 1}));
        else sendMessage([]);
    };

    return (
        <div className="flex flex-col gap-3">
            {messages === null ? <p className="text-sm text-muted-foreground">{resolveLanguageKey("loading")}</p> : null}
            {messages?.length === 0 ? <p className="text-sm text-muted-foreground">{resolveLanguageKey("empty")}</p> : null}
            <ol className="flex max-h-80 flex-col gap-2 overflow-y-auto">
                {(messages ?? []).map((message) => (
                    <li key={message._id} className={cn("flex max-w-[85%] flex-col gap-1 rounded-lg px-3 py-2 text-sm", message.from === "patient" ? "self-end bg-primary/10" : "self-start bg-muted")}>
                        <span className="text-xs text-muted-foreground">
                            {message.from === "patient" ? resolveLanguageKey("you") : clinicName}{" · "}{new Date(message.createdAt).toLocaleString()}
                        </span>
                        <p className="whitespace-pre-wrap break-words">{message.body}</p>
                        {message.attachments.map((file) => (
                            <Button key={file._id} type="button" variant="bare" className="self-start text-xs underline" onClick={() => openPatientFile(file)}>{file.name}</Button>
                        ))}
                    </li>
                ))}
            </ol>
            {canReply ? (
                <div className="flex flex-col gap-2">
                    <Textarea rows={3} value={body} maxLength={CLINIC_MESSAGE_BODY_MAX} placeholder={resolveLanguageKey("placeholder")} onChange={(event) => setBody(event.target.value)} disabled={sending} />
                    {files.length ? <p className="text-xs text-muted-foreground">{files.map((file) => file.name).join(", ")}</p> : null}
                    {failed ? <p className="text-sm text-destructive">{resolveLanguageKey("failed")}</p> : null}
                    <div className="flex items-center justify-between gap-2">
                        <Input ref={fileInput} type="file" multiple hidden accept={PATIENT_FILE_MIME_TYPES.join(",") + ",.dcm,.stl,.zip"} onChange={(event) => setFiles([...(event.target.files ?? [])].slice(0, CLINIC_MESSAGE_ATTACHMENTS_MAX))} />
                        <Button type="button" variant="ghost" size="sm" onClick={() => fileInput.current?.click()} disabled={sending}>
                            <IconPaperclip size={16} />{resolveLanguageKey("attach")}
                        </Button>
                        <Button type="button" size="sm" onClick={send} disabled={sending || !body.trim()}>
                            <IconSend size={16} />{resolveLanguageKey("send")}
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/portal/cases/patientThread.tsx"))(PatientThread);
