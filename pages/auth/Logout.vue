<script setup>
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';
const authStore = useAuthStore();
const { authLogout } = authStore;
const router = useRouter();
const { isAuthenticated, user } = storeToRefs(useAuthStore());
const logout = async() => {
    await authLogout();
    authStore.$reset();
    router.push('/auth/login');
};

// Mounted hook
onMounted(async () => {
  await logout();
});
//  visibility hook
useVisibilityChange(async () => {
  await logout();
});
</script>

<template>
  <div></div>
</template>
