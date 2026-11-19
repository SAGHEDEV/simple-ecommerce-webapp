import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Auth from './pages/Auth'
import Checkout from './pages/Checkout'
import Home from './pages/Home'
import Pay from './pages/Pay'
import OrderConfirm from './pages/OrderConfirm'
import Orders from './pages/Orders'
import ProductPage from './pages/ProductPage'
import Shop from './pages/Shop'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:id" element={<ProductPage />} />
        <Route path="auth" element={<Auth />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders/:id/pay" element={<Pay />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id/confirm" element={<OrderConfirm />} />
        <Route path="*" element={<p className="container section center">Page not found.</p>} />
      </Route>
    </Routes>
  )
}
