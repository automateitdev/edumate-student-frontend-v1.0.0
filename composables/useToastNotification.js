import { useToast } from "primevue/usetoast";
import { tg } from "~/utils/i18n";
// const toast = useToast();
const nuxtApp = useNuxtApp();
const getToast = () => nuxtApp.vueApp.config.globalProperties.$toast
export default useToastNotification = () =>{

    function toastSuccess () {
        getToast.add({ severity: 'warn', summary: tg('errors.empty_field'), detail: tg('errors.missing_value'), life: 3000 });
    }



    return {
        toastSuccess
    }
}