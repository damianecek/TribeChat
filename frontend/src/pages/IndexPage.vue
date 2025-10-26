<template>
  <q-page class="landing-page flex flex-center">
    <div class="landing-grid">
      <section class="landing-copy">
        <div class="text-h2 text-white text-weight-bold q-mb-md">welcome to tribechat</div>
        <p class="text-body1 text-grey-4 q-mb-xl">
          keep in touch with your tribe!
        </p>
      </section>

      <section class="landing-form">
        <login-form />
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import LoginForm from 'components/LoginForm.vue'
</script>

<style scoped>
.landing-page {
  width: 100%;
}

.landing-grid {
  width: 100%;
  max-width: 1080px;
  display: grid;
  gap: 48px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: center;
}

.landing-copy {
  padding: 24px;
}

.landing-highlights {
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

.landing-form {
  display: flex;
  justify-content: center;
}

@media (max-width: 599px) {
  .landing-copy {
    text-align: center;
  }

  .landing-highlights {
    justify-content: center;
  }
}
</style>
