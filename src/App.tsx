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

export default function App() {
  return (
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
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/leads" element={<AdminLeads />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="/admin/vehicles" element={<AdminVehicles />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
    </Routes>
  )
}
