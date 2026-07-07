import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react'

const quickLinks = [
  { label: 'Inventory', path: '/inventory' },
  { label: 'Sell Your Car', path: '/sell-your-car' },
  { label: 'Finance', path: '/finance' },
  { label: 'About Us', path: '/about' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/contact' },
]

const services = [
  { label: 'Part Exchange', path: '/sell-your-car' },
  { label: 'Finance Calculator', path: '/finance' },
  { label: 'Vehicle Warranty', path: '/about' },
  { label: 'RAC Inspection', path: '/about' },
  { label: 'Home Delivery', path: '/contact' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

export default function Footer() {
  return (
    <footer className="bg-obsidian border-t border-slate/20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="container-apex pt-24 pb-12"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <motion.div variants={itemVariants}>
            <Link to="/" className="inline-block" draggable={false}>
              <img
                src="/logo.png"
                alt="CarZee"
                draggable={false}
                className="h-12 w-auto object-contain select-none"
              />
            </Link>
            <p className="mt-4 text-sm text-chrome leading-relaxed max-w-[280px]">
              Redefining the pre-owned experience. Over 400+ RAC-approved vehicles, inspected, certified, and ready to drive away.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full flex items-center justify-center glass text-frost hover:text-electric-blue hover:border-electric-blue/30 transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display font-semibold text-pure-white mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-chrome hover:text-frost transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display font-semibold text-pure-white mb-5">Services</h4>
            <ul className="space-y-3">
              {services.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-chrome hover:text-frost transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display font-semibold text-pure-white mb-5">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-electric-blue mt-0.5 shrink-0" />
                <span className="text-sm text-chrome">
                  Based In London
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-electric-blue shrink-0" />
                <a href="tel:07983183814" className="text-sm font-mono text-chrome hover:text-electric-blue transition-colors">
                  07983183814
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-electric-blue shrink-0" />
                <a href="mailto:sales.carzee@gmail.com" className="text-sm text-chrome hover:text-electric-blue transition-colors">
                  sales.carzee@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={16} className="text-electric-blue shrink-0" />
                <span className="text-sm text-chrome">
                  Mon – Sat: 9am – 7pm<br />Sun: 10am – 4pm
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          variants={itemVariants}
          className="mt-16 pt-8 border-t border-slate/20 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-slate">
            &copy; 2023 CarZee Automotive. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-slate hover:text-frost cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-xs text-slate hover:text-frost cursor-pointer transition-colors">Terms of Service</span>
            <span className="text-xs text-slate hover:text-frost cursor-pointer transition-colors">Cookie Policy</span>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  )
}
