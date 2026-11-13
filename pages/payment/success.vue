<template>
    <Card>
        <template #title>
          <div class="text-center">
            <p style="color: lightseagreen; text-align: center; font-size: 3rem; margin: 0">{{ $t('payment.success.title') }}</p>
            <i class="pi pi-check-circle m-0" style="font-size: 5rem; color: lightseagreen" severity="danger"></i>
          </div>
        </template>
        <template #content>
            <div class="text-center m-0 mx-auto">
                <p class="text-secondary text-xl m-0 font-bold" style="color: green;">{{ $t('payment.success.message') }}</p>
                <p class="text-secondary text-xl m-0 font-bold" style="color: green;">{{ $t('payment.success.thanks') }}</p>
                <NuxtLink to="/" target="_self" rel="noopener">
                    <Button :label="$t('common.dashboard')" link icon="pi pi-home" />
                </NuxtLink>
            </div>
        </template>
    </Card>
</template>