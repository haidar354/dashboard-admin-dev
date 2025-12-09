import type { Employee } from '../models/employee'

export interface HasEmployeeListTable {
  id?: string
  employee_id?: string
  employee?: EmployeeListTable
  [key: string]: any
}

export interface EmployeeListTable extends Employee {
  email?: string
  [key: string]: any
}
