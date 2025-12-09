import type { App } from 'vue'

import { createMongoAbility } from '@casl/ability'
import { abilitiesPlugin } from '@casl/vue'
import { getUserAbilities } from '@/composables/auth/authorization'

export default function (app: App) {
  const initialAbility = createMongoAbility(getUserAbilities())

  app.use(abilitiesPlugin, initialAbility, {
    useGlobalProperties: true,
  })
}
