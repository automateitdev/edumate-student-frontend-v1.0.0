import { dateLocale } from '~/utils/i18n';

/**
 * PrimeVue's own built-in texts (calendar month/day names, password prompt and
 * strength, empty dropdown messages) in the chosen language. Month and day names
 * come from Intl, so they need no translation keys.
 */
const names = (loc, opts, count, make) => Array.from({ length: count }, (_, i) => make(i).toLocaleDateString(loc, opts));
const month = (i) => new Date(2026, i, 1);
const day = (i) => new Date(2026, 0, 4 + i); // 4 Jan 2026 is a Sunday

export const primeLocale = (t) => {
    const loc = dateLocale();
    return {
        monthNames: names(loc, { month: 'long' }, 12, month),
        monthNamesShort: names(loc, { month: 'short' }, 12, month),
        dayNames: names(loc, { weekday: 'long' }, 7, day),
        dayNamesShort: names(loc, { weekday: 'short' }, 7, day),
        dayNamesMin: names(loc, { weekday: 'narrow' }, 7, day),
        today: t('common.today'),
        clear: t('common.clear'),
        passwordPrompt: t('common.password_prompt'),
        weak: t('common.password_weak'),
        medium: t('common.password_medium'),
        strong: t('common.password_strong'),
        emptyMessage: t('common.no_options'),
        emptyFilterMessage: t('common.no_options'),
        emptySearchMessage: t('common.no_options'),
        emptySelectionMessage: t('common.no_selection'),
        accept: t('common.yes'),
        reject: t('common.no')
    };
};
