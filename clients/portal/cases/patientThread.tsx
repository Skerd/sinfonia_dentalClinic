import {compose} from "redux";
import {useCallback, useEffect, useRef, useState} from "react";
import {IconPaperclip, IconSend} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {CLINIC_MESSAGE_ATTACHMENTS_MAX, CLINIC_MESSAGE_BODY_MAX, PATIENT_FILE_MIME_TYPES} from "armonia/src/modules/dentalClinic/constants/index.ts";
import type {PatientMessage, PatientThreadResponse} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";
import {openPatientFile, uploadPatientFiles} from "./patientFiles.ts";

type Props = WithLanguageType & {
    inquiryId: string;
    clinicName: string;
    canReply: boolean;
    /** The thread was opened, so the clinic's messages are now read. */
    onRead?: () => void;
};

/** The patient's conversation with one clinic about their request. */
function PatientThread({inquiryId, clinicName, canReply, onRead, resolveLanguageKey}: Props) {
    const [messages, setMessages] = useState<PatientMessage[] | null>(null);
    const [body, setBody] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [sending, setSending] = useState(false);
    const [failed, setFailed] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);

    const load = useCallback(() => {
        apiClient.post<PatientThreadResponse>("/api/dentalClinic/patientPortal/thread", {inquiry: inquiryId})
            .then((res) => { setMessages(res.data.data); onRead?.(); })
            .catch(() => setMessages([]));
    }, [inquiryId, onRead]);

    useEffect(() => { load(); }, [load]);

    const send = async () => {
        if (!body.trim()) return;
        setSending(true);
        setFailed(false);
        try {
            const attachments = files.length ? await uploadPatientFiles(files) : [];
            await apiClient.post("/api/dentalClinic/patientPortal/message", {
                inquiry: inquiryId,
                body: body.trim(),
                attachments: attachments.map((file) => file._id),
            });
            setBody("");
            setFiles([]);
            load();
        } catch {
            setFailed(true);
        } finally {
            setSending(false);
        }
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
                            <button key={file._id} type="button" className="self-start text-xs underline" onClick={() => openPatientFile(file)}>{file.name}</button>
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
                        <input ref={fileInput} type="file" multiple hidden accept={PATIENT_FILE_MIME_TYPES.join(",") + ",.dcm,.stl,.zip"} onChange={(event) => setFiles([...(event.target.files ?? [])].slice(0, CLINIC_MESSAGE_ATTACHMENTS_MAX))} />
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
