<script setup>
import { reactive, computed, onMounted } from 'vue';
import useVisibilityChange from '~/composables/useVisibilityChange';
import { useLayout } from '../../layouts/composables/layout';
import AppConfig from '../../layouts/AppConfig.vue';
import Button from 'primevue/button';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useToast } from 'primevue/usetoast';

const { layoutConfig } = useLayout();

const logoUrl = computed(() => {
  return `/layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const toast = useToast();
const router = useRouter();
const store = useAuthStore();
const { authenticateUser } = store;
const { loading } = storeToRefs(store);

const user = reactive({
  institute_id: '',
  custom_student_id: ''
});

async function handleLogin(e) {
  e?.preventDefault();
  const { loginSuccess, error } = await authenticateUser(user);
  if (loginSuccess) {
    router.push('/');
  } else {
    toast.add({ severity: 'error', summary: 'Error Message', detail: error, life: 5000 });
  }
}

onMounted(() => {
  definePageMeta({ layout: false });
});

useVisibilityChange(() => {
  definePageMeta({ layout: false });
});
</script>

<template>
  <div>
    <div class="space-background" aria-hidden="true">
      <div class="floating-shape shape1"></div>
      <div class="floating-shape shape2"></div>
      <div class="floating-shape shape3"></div>
      <div class="floating-shape shape4"></div>
      <div class="floating-shape shape5"></div>
    </div>

    <Toast />

    <div class="main-content">
      <div class="auth-grid">
        <!-- Form -->
        <div class="form-col">
          <div class="form-card">
            <div class="text-2xl font-bold m-0 text-primary mb-3">Payment Portal</div>
            <form @submit="handleLogin">
              <IconField iconPosition="left" class="mb-2">
                <InputIcon class="pi pi-home"></InputIcon>
                <InputText
                  v-model="user.institute_id"
                  placeholder="Institute ID / EIIN"
                  class="w-full"
                  required
                />
              </IconField>

              <IconField iconPosition="left" class="mb-2">
                <InputIcon class="pi pi-user"></InputIcon>
                <InputText
                  v-model="user.custom_student_id"
                  placeholder="Student ID"
                  class="w-full"
                  required
                />
              </IconField>

              <Button
                type="submit"
                label="Continue"
                icon="pi pi-arrow-right"
                class="block py-0 mx-auto"
                rounded
                :loading="loading"
                :disabled="!user.institute_id || !user.custom_student_id"
              />
            </form>

            <div class="mt-4 gap-2 flex align-items-center justify-content-center">
              <a href="https://www.linkedin.com/company/automateitbd" target="_blank">
                <Button icon="pi pi-linkedin" class="social-button" severity="primary" rounded />
              </a>
              <a href="https://www.facebook.com/automateitbd" target="_blank">
                <Button icon="pi pi-facebook" class="social-button" severity="primary" rounded />
              </a>
              <a href="https://www.youtube.com/@automateitlimited" target="_blank">
                <Button icon="pi pi-youtube" class="social-button" severity="primary" rounded />
              </a>
              <a href="tel:+8809613241234">
                <Button icon="pi pi-phone" class="social-button" severity="primary" rounded />
              </a>
            </div>
          </div>
        </div>

        <!-- Video -->
        <div class="video-card">
          <div class="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/xtFYdAGeT-k?rel=0"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>

    <AppConfig simple />
  </div>
</template>

<style scoped>
/* Main layout */
.main-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}

/* Grid order control */
.auth-grid {
  width: min(1200px, 100%);
  display: grid;
  gap: 2rem;
  align-items: center;
  grid-template-columns: 1fr;
  grid-template-areas:
    "form"
    "video";
}
.form-col   { grid-area: form; }
.video-card { grid-area: video; }

@media (min-width: 1024px) {
  .auth-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-areas: "video form";
  }
}

/* Video */
.video-wrapper {
  position: relative;
  aspect-ratio: 16 / 9;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.15);
}
.video-wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Form Card (unchanged from your design) */
.form-card {
  width: 100%;
  max-width: 500px;
  margin-inline: auto;
  padding: 2.5rem;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.5);
}

/* Background shapes */
.space-background {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at bottom, #baf5fd, #d7f3fc, #bde4f6, #a1d4ed);
  z-index: -1;
}
.floating-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;
  filter: blur(100px);
  animation: floatAround 15s ease-in-out infinite alternate;
}
.shape1 { width: 500px; height: 500px; background: #8f4ce7; top: 5%; left: 10%; }
.shape2 { width: 350px; height: 350px; background: #60a5fa; bottom: 10%; right: 5%; }
.shape3 { width: 400px; height: 400px; background: #a855f7; top: 30%; right: 25%; }
.shape4 { width: 300px; height: 300px; background: #34d399; bottom: 20%; left: 15%; }
.shape5 { width: 600px; height: 600px; background: #15faa2; top: 40%; left: 50%; }

@keyframes floatAround {
  0%   { transform: translate(0px, 0px) scale(1); }
  25%  { transform: translate(50px, -30px) scale(1.05) rotate(3deg); }
  50%  { transform: translate(-60px, 50px) scale(0.98) rotate(-2deg); }
  75%  { transform: translate(80px, -10px) scale(1.03) rotate(1deg); }
  100% { transform: translate(-80px, 40px) scale(1) rotate(0deg); }
}
</style>
