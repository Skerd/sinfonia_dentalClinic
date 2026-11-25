import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarEvent, IconStar} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {ClinicReview} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicReview/clinicReview.dto.ts";
import ClinicReviewSheetView from "@dentalClinicModule/clients/panel/private/reviews/center/sheetView/clinicReviewSheetView.tsx";
import ReportMenuItem, {REPORT_TO_PLATFORM_ACTION} from "@coreModule/components/custom/report/reportMenuItem.tsx";
import {CLINIC_REVIEW_REPORT_KIND} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicReview/clinicReview.dto.ts";
import {ReportDialog} from "@coreModule/components/custom/report/reportButton.tsx";
import PlatformHiddenBadge from "@coreModule/components/custom/report/platformHiddenBadge.tsx";

type ClinicReviewCardProps = WithLanguageType & {
    clinicReview: ClinicReview;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ClinicReview, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ClinicReview> | null>;
};

function ClinicReviewCard({
    clinicReview,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: ClinicReviewCardProps) {
    return (
        <EntityCard
            resource="clinicreviews"
            entity={clinicReview}
            fetchId={fetchId}
            singleUrl="/api/dentalClinic/clinicReview/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            hideEdit
            editPath={() => ""}
            Sheet={ClinicReviewSheetView}
            sheetEntityProp="clinicReview"
            deleteUrl="/api/dentalClinic/clinicReview"
            restoreUrl="/api/dentalClinic/clinicReview/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="authorName"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (row: Partial<ClinicReview>) => setEntity({...entity, ...row}),
            })}
            extraDialogs={({action, setAction, entity}) => (
                action === REPORT_TO_PLATFORM_ACTION ? (
                    <ReportDialog kind={CLINIC_REVIEW_REPORT_KIND} recordId={entity._id} open onOpenChange={(next) => { if (!next) setAction(""); }} />
                ) : null
            )}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="authorName"
                        title={row.authorName}
                        badgesBesideTitle
                        badges=<PlatformHiddenBadge hidden={row.hiddenByPlatform} />>
                        <ReportMenuItem hidden={row.hiddenByPlatform} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconStar}
                            label={resolveLanguageKey("rating")}
                            tooltip={resolveLanguageKey("rating")}
                            path="rating"
                            value={"★".repeat(Math.round(row.rating)) + "☆".repeat(Math.max(0, 5 - Math.round(row.rating)))}
                        />
                        {row.appointment ? (
                            <EntityCardRow
                                icon={IconCalendarEvent}
                                label={resolveLanguageKey("appointment")}
                                tooltip={resolveLanguageKey("appointment")}
                                path="appointment"
                                value={row.appointment.number}
                            />
                        ) : null}
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/reviews/center/cardView/clinicReviewCard.tsx"),
    withDebug(true, true, "clinicreviews"),
)(ClinicReviewCard);
