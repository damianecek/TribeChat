/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| Všetky HTTP routy pre TribeChat API
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Controllers
const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')
const ChannelsController = () => import('#controllers/channels_controller')
// const MessagesController = () => import('#controllers/messages_controller')
const UserChannelsController = () => import('#controllers/user_channels_controller')
// const BlacklistController = () => import('#controllers/blacklists_controller')
// const TypingStatusController = () => import('#controllers/typing_statuses_controller')

router.group(() => {
  router.post('/register', [AuthController, 'register'])
  router.post('/login', [AuthController, 'login'])
  router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
  router.get('/me', [AuthController, 'me']).use(middleware.auth())
})

router
  .group(() => {
    router.get('/', [UsersController, 'index'])
    // router.get('/:id', [UsersController, 'show'])
    router.patch('/status', [UsersController, 'updateStatus'])
    // router.patch('/:id', [UsersController, 'update'])
    // router.delete('/:id', [UsersController, 'destroy'])
  })
  .prefix('/users')
  .use(middleware.auth())

router
  .group(() => {
    router.get('/', [ChannelsController, 'index'])
    router.post('/', [ChannelsController, 'store'])
    router.get('/:id', [ChannelsController, 'show'])
    router.get('/:id/members', [ChannelsController, 'members'])
    router.put('/:id', [ChannelsController, 'update'])
    // router.post('/:id/invite/:userId', [ChannelsController, 'invite'])
    // router.post('/:id/revoke/:userId', [ChannelsController, 'revoke'])
    // router.post('/:id/kick/:userId', [ChannelsController, 'kick'])
    router.delete('/:id', [ChannelsController, 'destroy'])
  })
  .prefix('/channels')
  .use(middleware.auth())

// router
//   .group(() => {
//     router.get('/:id/messages', [MessagesController, 'index'])
//     router.post('/:id/messages', [MessagesController, 'store'])
//   })
//   .prefix('/channels')
//   .use(middleware.auth())

router
  .group(() => {
    router.get('/', [UserChannelsController, 'index'])
    router.post('/', [UserChannelsController, 'store'])
    router.delete('/:id', [UserChannelsController, 'destroy'])
  })
  .prefix('/user-channels')
  .use(middleware.auth())

// router
//   .group(() => {
//     router.get('/:channelId', [BlacklistController, 'index'])
//     router.post('/:userId', [BlacklistController, 'store'])
//     router.delete('/:userId', [BlacklistController, 'destroy'])
//   })
//   .prefix('/blacklist')
//   .use(middleware.auth())

// router
//   .group(() => {
//     router.post('/', [TypingStatusController, 'startTyping'])
//     router.delete('/', [TypingStatusController, 'stopTyping'])
//     router.get('/:channelId', [TypingStatusController, 'whoIsTyping'])
//   })
//   .prefix('/typing')
//   .use(middleware.auth())
