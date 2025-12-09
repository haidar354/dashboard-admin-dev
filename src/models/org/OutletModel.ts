import OrgModel from '@/models/org/OrgModel'
import type { Outlet } from '@/types/models/outlet'

class OutletModel extends OrgModel<Outlet> {
  resource() {
    return 'outlets'
  }
}
export default OutletModel
