import * as yup from 'yup'

const nonNegativeInteger = yup
  .number()
  .integer('Must be a whole number')
  .min(0, 'Cannot be negative')
  .transform((_, v) => {
    const n = parseInt(String(v), 10)
    return v === '' || v == null || isNaN(n) ? undefined : n
  })

export const createLicenseSchema = yup.object({
  company: yup.string().required('Company is required'),
  product_name: yup.string().trim().required('Product name is required').max(100),
  purchase_date: yup.string().nullable(),
  expiration_date: yup.string().nullable(),
  max_super_admins: nonNegativeInteger.default(1),
  max_company_admins: nonNegativeInteger.required('Required').min(0),
  max_users: nonNegativeInteger.required('Required').min(1, 'At least 1 normal user required'),
  location: yup.string().trim().max(255).nullable(),
  description: yup.string().trim().max(500).nullable(),
}).test(
  'role-total-positive',
  'Total allocation must be at least 1',
  (val) => {
    const sa = val?.max_super_admins ?? 0
    const ca = val?.max_company_admins ?? 0
    const u = val?.max_users ?? 0
    return sa + ca + u >= 1
  }
)

export type CreateLicenseFormValues = yup.InferType<typeof createLicenseSchema>
