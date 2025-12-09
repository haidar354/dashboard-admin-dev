export interface FileUpload {
  id?: string
  file?: File
  url?: string
}

export interface MultipleImageUpload {
  id: string | undefined
  file: File | undefined
  url: string | undefined
}
