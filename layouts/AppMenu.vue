<script setup>
import { computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const { t } = useI18n();
// computed so the labels re-translate when the language changes
const model = computed(() => [
    {
        label: t('nav.home'),
        items: [{ label: t('nav.dashboard'), icon: 'pi pi-fw pi-home', to: '/' }]
    },
  

    {
        label: t('nav.payments'),
        items: [
       
            { 
                label: t('nav.invoices'),
                icon: 'pi pi-fw pi-file',
                to: '/payment/invoices' 
            },
            {
                label: t('nav.available_payment'),
                icon: 'pi pi-fw pi-wallet',
                to: '/payment/payable'
            }
        ],

    },

    {
        items: [
            {
                label: t('nav.logout'),
                icon: 'pi pi-fw pi-sign-out',
                to: '/auth/Logout'
            }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
        <!-- <li>
            <a href="https://www.primefaces.org/primeblocks-vue/#/" target="_blank">
                <img src="/layout/images/banner-primeblocks.png" alt="Prime Blocks" class="w-full mt-3" />
            </a>
        </li> -->
    </ul>
</template>

<style lang="scss" scoped></style>
