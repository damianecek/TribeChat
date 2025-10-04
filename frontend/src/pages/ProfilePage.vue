<template>
  <q-page class="profile-page flex flex-center">
    <div class="profile-grid">
      <section class="profile-copy" v-if="user">
        <div class="text-h3 text-white text-weight-bold q-mb-md">
          hi {{ user.firstName }}!
        </div>
        <p class="text-body1 text-grey-4 q-mb-xl">
          you can view your details here, change settings and get ready for next chat!
        </p>
      </section>

      <section class="profile-copy" v-else>
        <div class="text-h3 text-white text-weight-bold q-mb-md">
          oops .. something went wrong!
        </div>
        <p class="text-body1 text-grey-4 q-mb-xl">
          we could'nt load your information. try reloading the site or log in again.
        </p>
      </section>

      <section class="profile-card">
        <q-card class="auth-card">
          <q-card-section class="text-center" v-if="user">
            <div class="text-h5 text-weight-bold q-mb-xs">
              {{ user.firstName }} {{ user.lastName }}
            </div>
            <div class="text-subtitle2 text-grey-5">{{ user.email }}</div>
          </q-card-section>

          <q-banner v-else class="q-mx-md q-mt-md bg-negative text-white">
            we could not load the profile.
          </q-banner>

          <template v-if="user">
            <q-separator inset class="q-my-lg" />

            <q-card-section class="q-pt-none">
              <div class="profile-info">
                <div class="info-item">
                  <span class="label">nickname</span>
                  <span class="info-value">{{ user.nickname }}</span>
                </div>
                <div class="info-item">
                  <span class="label">email</span>
                  <span class="info-value">{{ user.email }}</span>
                </div>
              </div>
            </q-card-section>

<q-card-actions class="q-pa-md">
  <div class="row q-col-gutter-sm full-width">
    <div class="col">
      <q-btn
        color="primary"
        label="go to main"
        @click="goToMain"
        unelevated
        class="full-width"
      />
    </div>
    <div class="col">
      <q-btn
        color="negative"
        label="log out"
        @click="handleLogout"
        flat
        class="full-width"
      />
    </div>
  </div>
</q-card-actions>


          </template>
        </q-card>
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const auth = useAuthStore()
const user = computed(() => auth.user)
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  await router.push('/login')
}

async function goToMain() {
  await router.push('/main')
}
</script>

<style scoped>
.profile-page {
  width: 100%;
}

.profile-grid {
  width: 100%;
  max-width: 1080px;
  display: grid;
  gap: 48px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: center;
}

.profile-copy {
  padding: 24px;
}

.profile-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.highlight-chip {
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.15);
  color: #e2e8f0;
  font-size: 14px;
  backdrop-filter: blur(10px);
}

.profile-card {
  display: flex;
  justify-content: center;
}

.profile-info {
  display: grid;
  gap: 18px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(148, 163, 184, 0.08);
}

.info-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(226, 232, 240, 0.55);
}

.info-value {
  font-size: 16px;
  color: #e2e8f0;
  font-weight: 600;
}

.auth-card {
  width: 420px;
  max-width: 100%;
  border-radius: 18px;
  backdrop-filter: blur(12px);
  background: rgba(15, 23, 42, 0.92);
  color: #e2e8f0;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.35);
}

.auth-card :deep(.q-field__label) {
  color: rgba(226, 232, 240, 0.6);
}

.auth-card :deep(.q-separator--inset) {
  margin-left: 36px;
  margin-right: 36px;
}

@media (max-width: 599px) {
  .profile-copy {
    text-align: center;
  }

  .profile-highlights {
    justify-content: center;
  }
}
</style>
