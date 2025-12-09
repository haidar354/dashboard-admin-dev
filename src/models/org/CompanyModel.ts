import type { Company } from '../../types/models/company'
import OrgModel from '@/models/org/OrgModel'

class CompanyModel extends OrgModel<Company> {
  resource() {
    return 'companies'
  }
}
export default CompanyModel
