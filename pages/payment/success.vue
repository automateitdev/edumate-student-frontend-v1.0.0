<template>
    <Card>
        <template #title>
          <div class="text-center">
            <p style="color: lightseagreen; text-align: center; font-size: 3rem; margin: 0">Payment Successful!</p>
            <i class="pi pi-check-circle m-0" style="font-size: 5rem; color: lightseagreen" severity="danger"></i>
          </div>
        </template>
        <template #content>
            <div class="text-center m-0 mx-auto">
                <p class="text-secondary text-xl m-0 font-bold" style="color: green;">Your payment has been processed successfully.</p>
                <p class="text-secondary text-xl m-0 font-bold" style="color: green;">Thank you for your transaction! </p>
                <NuxtLink to="/" target="_self" rel="noopener">
                    <Button label="Dashboard" link icon="pi pi-home" />
                </NuxtLink>
            </div>
        </template>
    </Card>
</template>