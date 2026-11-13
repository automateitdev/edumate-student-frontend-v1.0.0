<script setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { storeToRefs } from 'pinia';
import useVisibilityChange from '~/composables/useVisibilityChange';
const { isAuthenticated, institutes, user } = storeToRefs(useAuthStore());
// Mounted hook
onMounted(async () => {
    if (!isAuthenticated) {
        router.push('/auth/login');
    }
});

//  visibility hook
useVisibilityChange(async () => {
    if (!isAuthenticated) {
        router.push('/auth/login');
    }
});
</script>

<template>
    <div>
        <!-- Institute Info -->
        <Card class="w-full mb-3">
            <template #content>
                <div class="flex flex-wrap justify-content-start align-items-center gap-3">
                    <div>
                        <img :src="user.institute_logo" :alt="$t('dashboard.institute_logo_alt')" style="max-width: 7rem;">
                    </div>
                    <div>
                        <p class="p-0 m-0 text-3xl font-bold text-primary">{{ user.institute_name }}</p>
                        <p class="p-0 m-0 text-lg">{{ $t('dashboard.address') }}: {{ user.institute_address }}</p>
                        <p class="p-0 m-0 text-lg font-bold">{{ $t('dashboard.institute_id') }}: {{ user.institute_id }}</p>
                    </div>
                </div>
            </template>
        </Card>

        <!-- Student Info -->
        <div class="flex gap-3">
            <Card class="w-full">
                <template #title>
                    <i class="pi pi-user text-primary mr-2"></i>
                    <span class="text-primary">{{ $t('dashboard.student_info') }}</span>
                </template>
                <template #content>
                    <p class="capitalize text-lg m-1 p-0"><b>{{ $t('student.name') }}:</b> {{ user.student_name }}</p>
                    <p class="capitalize text-lg m-1 p-0"><b>{{ $t('student.student_id') }}:</b> {{ user.student_id }}</p>
                    <p class="capitalize text-lg m-1 p-0"><b>{{ $t('student.roll') }}:</b> {{ user.roll }}</p>
                    <p class="capitalize text-lg m-1 p-0"><b>{{ $t('student.category') }}:</b> {{ user.category }}</p>
                </template>
            </Card>

            <!-- Academic Info -->
            <Card class="w-full">
                <template #title>
                    <i class="pi pi-book text-primary mr-2"></i>
                    <span class="text-primary">{{ $t('dashboard.academic_details') }}</span>
                </template>
                <template #content>
                    <p class="capitalize text-lg m-0 p-0"><b>{{ $t('student.department') }}:</b> {{ user.department_name }}</p>
                    <p class="capitalize text-lg m-0 p-0"><b>{{ $t('student.class') }}:</b> {{ user.class_name }}</p>
                    <p class="capitalize text-lg m-0 p-0"><b>{{ $t('student.shift') }}:</b> {{ user.shift }}</p>
                    <p class="capitalize text-lg m-0 p-0"><b>{{ $t('student.section') }}:</b> {{ user.section }}</p>
                    <p class="capitalize text-lg m-0 p-0"><b>{{ $t('student.group') }}:</b> {{ user.group }}</p>
                    <p class="capitalize text-lg m-0 p-0"><b>{{ $t('student.academic_year') }}:</b> {{ user.academic_year }}</p>
                    <p class="capitalize text-lg m-0 p-0"><b>{{ $t('student.session') }}:</b> {{ user.academic_session }}</p>
                </template>
            </Card>
        </div>
    </div>
</template>
