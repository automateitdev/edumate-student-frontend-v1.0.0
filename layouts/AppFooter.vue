<script setup>
import { useLayout } from './composables/layout';
import { computed } from 'vue';
const { layoutConfig } = useLayout();
const logoUrl = computed(() => {
    return `/layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});
</script>

<template>
    <div class="layout-footer mt-5">
        <!-- by
        <span class="font-medium ml-2">Automate IT Limited</span> -->
    </div>
</template>
<style lang="scss" scoped></style>
