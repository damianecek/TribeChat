/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import User from '#models/user'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Nová route pre testovanie userov
router.get('/test-users', async () => {
  const users = await User.all() // načíta všetkých userov z DB
  return users
})

