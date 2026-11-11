import mainConfig from "@coreModule/assets/languages/mainConfig.json";
import {PATIENT_LANGUAGES} from "armonia/src/modules/dentalClinic/constants/index.ts";

/** The instance's default language as a patient language: what a new patient or request starts with (UX-06). */
export const INSTANCE_PATIENT_LANGUAGE = PATIENT_LANGUAGES.find((code) => code === mainConfig.defaults.language) ?? "en-US";
