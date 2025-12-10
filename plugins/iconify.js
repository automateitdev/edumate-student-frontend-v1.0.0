import { addCollection } from '@iconify/vue';
import formkitIcons from '@iconify-json/formkit/icons.json';

export default defineNuxtPlugin((nuxtApp) => {
  addCollection(formkitIcons);
})
