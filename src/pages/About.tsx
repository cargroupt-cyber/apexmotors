import SEO from '@/components/SEO'
import { motion } from 'framer-motion'
import { Shield, Award, Users, Clock } from 'lucide-react'

export default function About() {
  return (
    <>
      <SEO
        title="About CarZee"
        description="Learn about CarZee, London's trusted premium car dealership. Discover our story, values, and commitment to delivering exceptional vehicles and customer service."
        canonical="/about"
      />

      {/* Hero */}
      <section className="relative bg-obsidian pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/showroom-wide.jpg"
            alt="CarZee showroom"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/80 to-obsidian" />
        </div>
        <div className="container-apex relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-pure-white mb-6">
              About CarZee
            </h1>
            <p className="text-lg md:text-xl text-frost leading-relaxed">
              London's premier destination for premium pre-owned vehicles. We combine
              curated luxury cars with transparent service and tailored finance solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story & Values */}
      <section className="bg-obsidian section-padding">
        <div className="container-apex">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-3xl font-bold text-pure-white mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-frost leading-relaxed">
                <p>
                  CarZee was founded on a simple belief: buying a premium car should be
                  as enjoyable as driving one. What started as a small showroom in London
                  has grown into a trusted name for discerning drivers across the UK.
                </p>
                <p>
                  Every vehicle in our collection is hand-picked by our experienced buyers
                  and prepared to the highest standards before it reaches the forecourt.
                  We focus on quality over quantity, so you can browse with confidence.
                </p>
                <p>
                  From Mercedes-Benz and BMW to Porsche and Tesla, we specialise in
                  luxury marques that deliver performance, comfort, and long-term value.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid sm:grid-cols-2 gap-6"
            >
              <div className="glass-dark rounded-2xl p-6">
                <Shield className="w-10 h-10 text-electric-blue mb-4" />
                <h3 className="font-display text-lg font-semibold text-pure-white mb-2">
                  Trusted Quality
                </h3>
                <p className="text-sm text-frost">
                  Every car undergoes a rigorous multi-point inspection before sale.
                </p>
              </div>
              <div className="glass-dark rounded-2xl p-6">
                <Award className="w-10 h-10 text-electric-blue mb-4" />
                <h3 className="font-display text-lg font-semibold text-pure-white mb-2">
                  Premium Selection
                </h3>
                <p className="text-sm text-frost">
                  Only the best luxury vehicles make it into our curated inventory.
                </p>
              </div>
              <div className="glass-dark rounded-2xl p-6">
                <Users className="w-10 h-10 text-electric-blue mb-4" />
                <h3 className="font-display text-lg font-semibold text-pure-white mb-2">
                  Customer First
                </h3>
                <p className="text-sm text-frost">
                  Transparent advice, no pressure, and support throughout your journey.
                </p>
              </div>
              <div className="glass-dark rounded-2xl p-6">
                <Clock className="w-10 h-10 text-electric-blue mb-4" />
                <h3 className="font-display text-lg font-semibold text-pure-white mb-2">
                  Ongoing Support
                </h3>
                <p className="text-sm text-frost">
                  Finance, warranty, and aftercare options designed around you.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="bg-obsidian section-padding border-t border-white/5">
        <div className="container-apex">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold text-pure-white mb-4">
              Our Locations
            </h2>
            <p className="text-frost">
              Visit one of our showrooms in London, Birmingham or Manchester.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { city: 'London', address: '120 Park Lane, London W1K 7AF' },
              { city: 'Birmingham', address: '456 Carriageway Rd, Birmingham B1 1AA' },
              { city: 'Manchester', address: '789 Autobahn St, Manchester M1 1AA' },
            ].map((loc) => (
              <div
                key={loc.city}
                className="glass-dark rounded-2xl p-6 text-center"
              >
                <h3 className="font-display text-xl font-semibold text-pure-white mb-2">
                  {loc.city}
                </h3>
                <p className="text-frost text-sm">{loc.address}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
