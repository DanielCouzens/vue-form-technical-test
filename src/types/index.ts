export type ServiceFormData = {
  name: string
  email: string
  password: string
  dateOfBirth: string
  service: string
  otherService: string
  terms: boolean
}

export interface SelectOption {
  value: string
  label: string
}
