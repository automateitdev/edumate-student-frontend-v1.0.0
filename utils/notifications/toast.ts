import { useToast } from "primevue/usetoast";
import { tg } from "~/utils/i18n";

// Defaults are read at call time so they follow the current language.
export function toastSuccess(summary: any = tg("common.success_title"), detail: any = tg("errors.data_added")) {
    useToast().add({ severity: 'success', summary, detail, life: 3000 })
}

export function toastWarn(summary: any = tg("common.warning_title"), detail: any = tg("errors.generic")) {
    useToast().add({ severity: 'warn', summary, detail, life: 3000 })
}

export function toastError(summary: any = tg("common.error_title"), detail: any = tg("errors.generic")) {
    useToast().add({ severity: 'error', summary, detail, life: 3000 })
}
