<template>
    <Card>
        <template #title>
          <div class="text-center">
            <p style="color: tomato; text-align: center; font-size: 3rem; margin: 0">Payment Failed!</p>
            <i class="pi pi-times-circle m-0" style="font-size: 5rem; color: tomato" severity="danger"></i>
          </div>
        </template>
        <template #content>
            <div class="text-center m-0 mx-auto">
                <p class="text-secondary text-xl m-0 font-bold" style="color: orange;">We could not process the payment currently</p>
                <p class="text-secondary text-xl m-0 font-bold" style="color: orange;">Please try later!</p>

                <NuxtLink to="/" target="_self" rel="noopener">
                    <Button label="Dashboard" link icon="pi pi-home" />
                </NuxtLink>
            </div>
        </template>
    </Card>
</template>
