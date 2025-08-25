import type { DataTableHeader } from 'vuetify'

export type TableHeader = {
  title: string
  key: string
  sortable?: boolean
  align?: 'start' | 'end' | 'center'
  width?: string
}

export type TableHeaders<T> = DataTableHeader<T>[]
