import type { RouteRecordRaw } from 'vue-router'
import AppLayout from 'layouts/AppLayout.vue'
import MainLayout from 'layouts/MainLayout.vue'
import IndexPage from 'pages/IndexPage.vue'
import LoginPage from 'pages/LoginPage.vue'
import RegisterPage from 'pages/RegisterPage.vue'
import ProfilePage from 'pages/ProfilePage.vue'

import MainPage from 'pages/MainPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: IndexPage },
      { path: 'login', component: LoginPage },
      { path: 'register', component: RegisterPage },
      { path: 'profile', component: ProfilePage, meta: { requiresAuth: true } },
    ],
  },
  {
    path: '/main',
    component: AppLayout,
    children: [
      { path: '', component: MainPage, meta: { requiresAuth: true } }
    ]
  }
]

export default routes
