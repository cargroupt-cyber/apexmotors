import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Inventory from './pages/Inventory'
import VehicleDetail from './pages/VehicleDetail'
import SellYourCar from './pages/SellYourCar'
import Finance from './pages/Finance'
import About from './pages/About'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import AdminDashboard from './pages/AdminDashboard'
import AdminLeads from './pages/AdminLeads'
import AdminAnalytics from './pages/AdminAnalytics'
import AdminVehicles from './pages/AdminVehicles'
import AdminSettings from './pages/AdminSettings'
import AdminLogin from './pages/AdminLogin'
import AdminRouteGuard from './components/admin/AdminRouteGuard'
import WhatsAppButton from './components/WhatsAppButton'

export default function App() {
  return (
    <>
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/vehicle/:id" element={<VehicleDetail />} />
        <Route path="/sell-your-car" element={<SellYourCar />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminRouteGuard><AdminDashboard /></AdminRouteGuard>} />
      <Route path="/admin/leads" element={<AdminRouteGuard><AdminLeads /></AdminRouteGuard>} />
      <Route path="/admin/analytics" element={<AdminRouteGuard><AdminAnalytics /></AdminRouteGuard>} />
      <Route path="/admin/vehicles" element={<AdminRouteGuard><AdminVehicles /></AdminRouteGuard>} />
      <Route path="/admin/settings" element={<AdminRouteGuard><AdminSettings /></AdminRouteGuard>} />
    </Routes>
    <WhatsAppButton />
    </>
  )
}
