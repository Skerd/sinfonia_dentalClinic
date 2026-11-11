import {compose} from "redux";
import {IconAlertTriangle, IconCircleCheck, IconClipboardX, IconPill, IconSignature} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import DisplayCard from "@coreModule/components/viewEngine/widgets/display/displayCard.tsx";
import type {MedicalHistory} from "armonia/src/modules/dentalClinic/dto/medicalHistory.dto.ts";

type Props = WithLanguageType & {history?: MedicalHistory};

const SIGNED_AT: Intl.DateTimeFormatOptions = {...DATE_FORMATS.mediumDate, hour: "2-digit", minute: "2-digit"};

/**
 * The patient's signed questionnaire, for the dentist, as the sheet's own cards: what they answered "yes" or
 * "not sure" to first (amber, with their details), then medicines, who signed and when, and everything answered "no".
 */
function MedicalHistoryAnswers({history, resolveLanguageKey}: Props) {
    const t = (key: string) => String(resolveLanguageKey(key));
    if (!history) {
        return <DisplayCard show title={t("noneTitle")} tooltip={t("noneTitle")} Icon={IconClipboardX} value={t("none")} />;
    }
    const flagged = history.answers.filter((row) => row.answer !== "no");
    const clear = history.answers.filter((row) => row.answer === "no");
    return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {flagged.map((row) => {
                const question = t(`question.${row.question}`);
                const answer = t(`answer.${row.answer}`);
                return (
                    <DisplayCard
                        key={row.question}
                        show
                        variant="warning"
                        title={question}
                        tooltip={question}
                        Icon={IconAlertTriangle}
                        value={row.detail ? `${answer} · ${row.detail}` : answer}
                    />
                );
            })}
            {history.medications ? (
                <DisplayCard show title={t("medications")} tooltip={t("medications")} Icon={IconPill} value={history.medications} />
            ) : null}
            <DisplayCard
                show
                title={t("signedTitle")}
                tooltip={t("signedTitle")}
                Icon={IconSignature}
                value={`${history.signedName} · ${formatDate(history.submittedAt, {format: SIGNED_AT})}`}
            />
            {clear.length ? (
                <div className="sm:col-span-2">
                    <DisplayCard
                        show
                        title={t("answeredNoTitle")}
                        tooltip={t("answeredNoTitle")}
                        Icon={IconCircleCheck}
                        // An element wraps over several lines instead of being cut to one.
                        value={<span>{clear.map((row) => t(`question.${row.question}`)).join(", ")}</span>}
                    />
                </div>
            ) : null}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/patients/center/sheetView/medicalHistoryAnswers.tsx"),
)(MedicalHistoryAnswers);
