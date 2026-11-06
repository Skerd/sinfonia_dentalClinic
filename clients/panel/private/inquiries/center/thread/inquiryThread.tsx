import {compose} from "redux";
import {useCallback, useEffect, useRef, useState} from "react";
import {IconPaperclip, IconSend} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import SheetMediaFilesStrip from "@coreModule/components/viewEngine/sheet/widgets/sheetMediaFilesStrip.tsx";
import {CLINIC_MESSAGE_ATTACHMENTS_MAX, CLINIC_MESSAGE_BODY_MAX, PATIENT_FILE_MIME_TYPES} from "armonia/src/modules/dentalClinic/constants/index.ts";
import type {ClinicMessage} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicMessage/clinicMessage.dto.ts";
import {Input} from "@coreModule/components/ui/input.tsx";

const THREAD_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/clinicInquiry/thread"};
const SEND_MESSAGE_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/clinicInquiry/sendMessage"};

type Props = WithLanguageType & {
    inquiryId: string;
    /** Closed requests keep their thread readable but take no new messages. */
    canReply: boolean;
    /** The request changed (first answer moves it into review). */
    onSent?: () => void;
};

/** The conversation with the patient about one request; opening it marks their messages read. */
function InquiryThread({inquiryId, canReply, onSent, resolveLanguageKey}: Props) {
    const access = useAccess("clinicmessages");
    const [messages, setMessages] = useState<ClinicMessage[] | null>(null);
    const [body, setBody] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInput = useRef<HTMLInputElement>(null);

    const [threadCount, setThreadCount] = useState(0);
    useHttpRequest<{data: ClinicMessage[]}>(THREAD_REQUEST, {_id: inquiryId}, threadCount, true, {
        success: (response) => setMessages(response.data),
        error: () => setError(String(resolveLanguageKey("loadError"))),
    });
    const load = useCallback(() => setThreadCount((count) => count + 1), []);

    useEffect(() => {
        if (access.read?.body) load();
    }, [access.read?.body, load, inquiryId]);

    // Multipart: the message and its attachments go in one request.
    const [message, setMessage] = useState<{form: FormData; count: number}>(() => ({form: new FormData(), count: 0}));
    const {loading: sending} = useHttpRequest<{data: ClinicMessage}>(SEND_MESSAGE_REQUEST, message.form, message.count, true, {
        start: () => setError(null),
        success: (response) => {
            setMessages((current) => [...(current ?? []), response.data]);
            setBody("");
            setFiles([]);
            onSent?.();
        },
        error: () => setError(String(resolveLanguageKey("sendError"))),
    });

    if (!access.read?.body) return null;

    const send = () => {
        if (!body.trim()) return;
        const form = new FormData();
        form.append("_id", inquiryId);
        form.append("body", body.trim());
        for (const file of files) form.append("attachments", file);
        setMessage((current) => ({form, count: current.count + 1}));
    };

    return (
        <section className="flex flex-col gap-3 border-t px-4 py-4">
            <h4 className="text-sm font-medium">{resolveLanguageKey("title")}</h4>
            {messages === null && !error ? <p className="text-sm text-muted-foreground">{resolveLanguageKey("loading")}</p> : null}
            {messages?.length === 0 ? <p className="text-sm text-muted-foreground">{resolveLanguageKey("empty")}</p> : null}
            <ol className="flex flex-col gap-2">
                {(messages ?? []).map((message) => (
                    <li
                        key={message._id}
                        className={cn(
                            "flex max-w-[85%] flex-col gap-1 rounded-lg px-3 py-2 text-sm",
                            message.from === "clinic" ? "self-end bg-primary/10" : "self-start bg-muted",
                        )}
                    >
                        <span className="text-xs text-muted-foreground">
                            {message.from === "clinic" ? message.authorName || resolveLanguageKey("clinic") : resolveLanguageKey("patient")}
                            {" · "}
                            {new Date(message.createdAt).toLocaleString()}
                        </span>
                        <p className="whitespace-pre-wrap break-words">{message.body}</p>
                        {message.attachments.length ? (
                            <SheetMediaFilesStrip media={message.attachments} resolveLanguageKey={resolveLanguageKey} canDownload nameOnly />
                        ) : null}
                    </li>
                ))}
            </ol>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {canReply && access.write?.body ? (
                <div className="flex flex-col gap-2">
                    <Textarea
                        rows={3}
                        value={body}
                        maxLength={CLINIC_MESSAGE_BODY_MAX}
                        placeholder={String(resolveLanguageKey("placeholder"))}
                        onChange={(e) => setBody(e.target.value)}
                        disabled={sending}
                    />
                    {files.length ? <p className="text-xs text-muted-foreground">{files.map((file) => file.name).join(", ")}</p> : null}
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            ref={fileInput}
                            type="file"
                            multiple
                            hidden
                            accept={PATIENT_FILE_MIME_TYPES.join(",")}
                            onChange={(e) => setFiles([...(e.target.files ?? [])].slice(0, CLINIC_MESSAGE_ATTACHMENTS_MAX))}
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={() => fileInput.current?.click()} disabled={sending}>
                            <IconPaperclip size={16} />
                            {resolveLanguageKey("attach")}
                        </Button>
                        <Button type="button" size="sm" onClick={send} disabled={sending || !body.trim()}>
                            <IconSend size={16} />
                            {resolveLanguageKey("send")}
                        </Button>
                    </div>
                </div>
            ) : null}
        </section>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/inquiries/center/thread/inquiryThread.tsx"),
)(InquiryThread);
