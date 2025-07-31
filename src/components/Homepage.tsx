import { motion } from 'framer-motion'
import { Shield, Clock, Users, Lock, ArrowRight, CheckCircle, Heart, FileText, Smartphone, Globe, Key } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Homepage() {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Digital Will Creation",
      description: "Create comprehensive digital wills that define what happens to your online accounts and digital assets.",
      image: "https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Asset Transfer",
      description: "Seamlessly transfer digital assets to trusted recipients according to your wishes.",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Dead Man's Switch",
      description: "Automated monitoring system that triggers your digital will when you stop checking in.",
      image: "https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    
    {
      icon: <Key className="w-8 h-8" />,
      title: "Blockchain Secure",
      description: "Military-grade encryption and blockchain technology ensure your digital legacy remains secure and tamper-proof.",
      image: "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
    
  ]

  const platforms = [
    { name: "Social Media", icon: <Heart className="w-6 h-6" /> },
    { name: "Email Accounts", icon: <FileText className="w-6 h-6" /> },
    { name: "Cloud Storage", icon: <Globe className="w-6 h-6" /> },
    { name: "File Security", icon: <Smartphone className="w-6 h-6" /> }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                <Shield className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DataGhost</h1>
                <p className="text-xs text-gray-500">Digital Legacy Manager</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  to="/auth"
                  className="relative px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:text-blue-600 transition-all duration-300 group overflow-hidden"
                >
                  <span className="relative z-10">Sign In</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl opacity-0 group-hover:opacity-100"
                    initial={false}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
              <motion.div 
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 8px 25px rgba(59, 130, 246, 0.4)"
                }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative"
              >
                <Link
                  to="/auth"
                  state={{ isSignUp: true }}
                  className="relative inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <span className="relative z-10">Get Started</span>
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.div
              variants={itemVariants}
              className="mb-8"
            >
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
                Your Digital
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Legacy Matters
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Take control of what happens to your digital life after you're gone. 
                Create a comprehensive digital will and ensure your online presence is handled according to your wishes.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <motion.div 
                whileHover={{ 
                  scale: 1.05,
                  y: -3,
                  boxShadow: "0 15px 35px rgba(59, 130, 246, 0.4)"
                }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative"
              >
                <Link
                  to="/auth"
                  state={{ isSignUp: true }}
                  className="relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  <span className="relative z-10">Start Your Digital Will</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  y: -3,
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.15)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative inline-flex items-center gap-3 px-8 py-4 bg-white/95 backdrop-blur-sm text-gray-700 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl border border-gray-200/50 hover:border-gray-300/50 transition-all duration-300 group overflow-hidden"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <Lock className="w-5 h-5 text-blue-600" />
                </motion.div>
                <span className="relative z-10">Learn More</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-70"
                  initial={false}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <div className="relative mx-auto max-w-4xl">
                <motion.img
                  src="https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Digital privacy and security"
                  className="w-full h-96 object-cover rounded-2xl shadow-2xl cursor-pointer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -10,
                    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
                    rotateY: 5,
                    rotateX: 5
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.4,
                    hover: { duration: 0.3, ease: "easeOut" }
                  }}
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"
                  whileHover={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.1), transparent)"
                  }}
                  transition={{ duration: 0.3 }}
                ></motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-70"
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-indigo-200 rounded-full opacity-70"
          animate={{
            y: [0, 25, 0],
            x: [0, -10, 0],
            rotate: [360, 180, 0],
            scale: [1, 0.8, 1.1, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-60 left-1/4 w-16 h-16 bg-purple-200 rounded-full opacity-60"
          animate={{
            y: [0, -20, 10, 0],
            x: [0, 20, -5, 0],
            rotate: [0, 90, 270, 360],
            scale: [1, 1.3, 0.9, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-40 right-1/3 w-20 h-20 bg-cyan-200 rounded-full opacity-65"
          animate={{
            y: [0, 15, -25, 0],
            x: [0, -15, 10, 0],
            rotate: [0, -90, -180, -360],
            scale: [1, 1.1, 1.4, 1]
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-32 right-1/4 w-14 h-14 bg-pink-200 rounded-full opacity-55"
          animate={{
            y: [0, -15, 20, 0],
            x: [0, 25, -10, 0],
            rotate: [0, 120, 240, 360],
            scale: [1, 0.7, 1.2, 1]
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-28 h-28 bg-green-200 rounded-full opacity-50"
          animate={{
            y: [0, 30, -10, 0],
            x: [0, -20, 15, 0],
            rotate: [0, -45, -135, -360],
            scale: [1, 1.25, 0.85, 1]
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How DataGhost Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform ensures your digital legacy is preserved and managed exactly as you intended.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative mb-6">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <div className="absolute -bottom-4 left-6 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Manage All Your Digital Assets
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From social media accounts to cloud storage, DataGhost helps you manage every aspect of your digital presence.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {platform.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {platform.name}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Built with Privacy & Security First
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Your digital legacy is precious. That's why we've built DataGhost with enterprise-grade security, 
                end-to-end encryption, and complete transparency about how your data is handled.
              </p>
              
              <div className="space-y-4">
                {[
                  "End-to-end encryption for all data",
                  "Zero-knowledge architecture",
                  "Regular security audits",
                  "GDPR compliant infrastructure"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Security and privacy"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
              <motion.div
                className="absolute -top-6 -right-6 w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl"
                animate={{
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Lock className="w-12 h-12" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Start Protecting Your Digital Legacy Today
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join and control of your digital afterlife. 
              Create your digital will in minutes and gain peace of mind.
            </p>
            
            <motion.div
              whileHover={{ 
                scale: 1.05,
                y: -3,
                boxShadow: "0 20px 40px rgba(255, 255, 255, 0.3)"
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative"
            >
              <Link
                to="/auth"
                state={{ isSignUp: true }}
                className="relative inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden group"
              >
                <span className="relative z-10">Create Your Digital Will</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-blue-50 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">DataGhost</h3>
                <p className="text-gray-400 text-sm">Digital Legacy Manager</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                © 2025 DataGhost. All rights reserved.
                Made with ❤️ by the DataGhost Team
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Protecting your digital legacy with care and security.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}