export interface ItemImage {
  itemImageId?: string
  imageKeyOriginal: string
  imageKeyMedium?: string | null
  imageKeySmall?: string | null
  imageUrlOriginal?: string
  imageUrlMedium?: string
  imageUrlSmall?: string
  title?: string | null
  isPrimary: boolean
  isActive: boolean
}
