import type { RouteRecordRaw } from 'vue-router'
import MainLayout from 'layouts/MainLayout.vue'
//import IndexPage from 'pages/IndexPage.vue'
import LoginPage from 'pages/LoginPage.vue'
import RegisterPage from 'pages/RegisterPage.vue'
import ProfilePage from 'pages/ProfilePage.vue'

import TabsPage from 'pages/TabsPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: TabsPage },
      { path: 'login', component: LoginPage },
      { path: 'register', component: RegisterPage },
      { path: 'profile', component: ProfilePage },
    ],
  },
]

export default routes
