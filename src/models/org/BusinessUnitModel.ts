import type { BusinessUnit } from '../../types/models/business-unit'
import OrgModel from '@/models/org/OrgModel'

class BusinessUnitModel extends OrgModel<BusinessUnit> {
  resource() {
    return 'business-units'
  }
}
export default BusinessUnitModel
