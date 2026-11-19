import axios from 'axios';
import { watch } from 'vue';
import { primeLocale } from '~/utils/primevueLocale';
import { currentLocale, setTranslator } from '~/utils/i18n';

/**
 * Wires the chosen language into the rest of the app:
 *  - plain JS modules can translate through utils/i18n (tg),
 *  - every API call carries Accept-Language so the backend answers in kind,
 *  - <html lang dir> follows the locale, so Arabic lays out right-to-left.
 */
export default defineNuxtPlugin({
    name: 'i18n-bridge',
    dependsOn: ['i18n:plugin'],
    setup(nuxtApp) {
        const i18n = nuxtApp.$i18n;
        setTranslator((key, params) => i18n.t(key, params ?? {}));

        // Mounted PrimeVue Password inputs, so their prompt can follow a language switch.

        const passwords = new Set();

        nuxtApp.vueApp.mixin({

            mounted() {

                if (this.$options.name === 'Password') passwords.add(this);

            },

            unmounted() {

                if (this.$options.name === 'Password') passwords.delete(this);

            }

        });


        // PrimeVue's built-in texts (calendar names, password prompt, empty messages).

        const applyPrime = () => {

            const primevue = nuxtApp.vueApp.config.globalProperties.$primevue;

            if (primevue?.config?.locale) Object.assign(primevue.config.locale, primeLocale((key) => i18n.t(key)));
            // Password copies its prompt once when it mounts; refresh the ones already on screen.
            for (const pw of passwords) if (!pw.meter) pw.infoText = pw.promptText;

        };


        const apply = (code) => {
            currentLocale.value = code;
            axios.defaults.headers.common['Accept-Language'] = code;
            const meta = i18n.locales.value.find((l) => (typeof l === 'string' ? l : l.code) === code);
            if (typeof document !== 'undefined') {
                document.documentElement.lang = meta?.language ?? code;
                document.documentElement.dir = meta?.dir ?? 'ltr';
            }
            applyPrime();
        };

        apply(i18n.locale.value);

        // PrimeVue installs after this plugin; set its texts once it exists, before anything renders.
        nuxtApp.hook('app:beforeMount', applyPrime);
        watch(i18n.locale, apply);
    }
});
