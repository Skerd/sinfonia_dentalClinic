import {compose} from "redux";
import {IconStarFilled} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {DetailSection} from "@coreModule/clients/portal/shared/detailPage.tsx";
import ReportButton from "@coreModule/components/custom/report/reportButton.tsx";
import type {ClinicReviewsResponse} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.response.types.ts";

const REVIEWS_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/clinicStorefront/reviews", cache: true};

function Stars({rating, label}: {rating: number; label: string}) {
    return (
        <span className="flex items-center gap-0.5" role="img" aria-label={label}>
            {[1, 2, 3, 4, 5].map((value) => (
                <IconStarFilled key={value} className={value <= Math.round(rating) ? "h-4 w-4 text-amber-500" : "h-4 w-4 text-muted"} aria-hidden />
            ))}
        </span>
    );
}

type Props = WithLanguageType & {
    /** `page`: a section of the clinic's home page; `detail`: a block of a treatment page's story. */
    layout: "page" | "detail";
};

/**
 * The clinic's published reviews (D178): written by patients after completed appointments and shown at once; each can
 * be reported to the platform (D191). Nothing is shown until there is one.
 */
function ClinicReviews({layout, resolveLanguageKey}: Props) {
    const {data} = useHttpRequest<ClinicReviewsResponse>(REVIEWS_REQUEST, {limit: 10}, 1);
    const found = data?.data;
    if (!found?.count) return null;
    const ratingLabel = (rating: number) => resolveLanguageKey("ratingLabel").replace("{rating}", String(rating));

    const content = (
        <>
            <p className="flex items-center gap-2 text-sm">
                <Stars rating={found.average} label={ratingLabel(found.average)} />
                <span className="font-medium tabular-nums">{found.average.toFixed(1)}</span>
                <span className="text-muted-foreground">
                    {resolveLanguageKey(found.count === 1 ? "countOne" : "count").replace("{count}", String(found.count))}
                </span>
            </p>
            <ul className="flex flex-col divide-y">
                {found.reviews.map((review) => (
                    <li key={review._id} className="flex flex-col gap-1.5 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Stars rating={review.rating} label={ratingLabel(review.rating)} />
                            <span className="text-xs text-muted-foreground">{formatDate(review.createdAt, {format: DATE_FORMATS.mediumDate})}</span>
                        </div>
                        {review.comment ? <p className="text-sm">{review.comment}</p> : null}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground">{review.authorName}</p>
                            <ReportButton kind="dentalClinic.review" recordId={review._id} variant="link" />
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );

    if (layout === "detail") return <DetailSection title={resolveLanguageKey("title")}>{content}</DetailSection>;
    return (
        <section className="flex max-w-3xl flex-col gap-4">
            <h2 className="font-display font-bold tracking-tight text-2xl sm:text-3xl">{resolveLanguageKey("title")}</h2>
            {content}
        </section>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/client/public/shared/clinicReviews.tsx"))(ClinicReviews);
