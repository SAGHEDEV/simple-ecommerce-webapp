export interface Product {
  id: number
  title: string
  description: string
  price: number
  originalPrice: number | null
  discountPercentage: number
  category: string
  brand: string
  thumbnail: string
  images: string[]
  stock: number
  rating: number
  isNew: boolean
}
export interface User { id: number; name: string; email: string }
export type OrderStatus = 'pending' | 'paid' | 'delivered'
export interface Shipping {
  fullName: string; phone: string; address: string; city: string
  state: string; postalCode: string; country: string
}
export interface Order {
  id: number; reference: string; status: OrderStatus; total: number
  currency: string; exchangeRate: number
  createdAt: string; paidAt: string | null; shipping: Shipping
  items: { productId: number; title: string; thumbnail: string; price: number; quantity: number }[]
}
