import {createContext} from "react";

/**
 * Reloads the open request sheet. The thread is a sheet token (rendered by the view engine), so it reaches the
 * sheet through context: a staff reply moves a new request into review, and the sheet must show that.
 */
export const InquirySheetRefresh = createContext<() => void>(() => {});
