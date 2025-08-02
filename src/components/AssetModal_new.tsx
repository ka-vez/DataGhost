import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { DigitalAsset } from '../hooks/useDigitalAssets'

interface AssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, data: any) => Promise<void> | ((data: any) => Promise<void>)
  asset?: DigitalAsset
}

export function AssetModal({ isOpen, onClose, onSave, asset }: AssetModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  
  // Step 1 form data (asset details)
  const [assetData, setAssetData] = useState({
    platform_name: '',
    action: 'Delete' as 'Delete' | 'Transfer' | 'Archive',
    recipient_email: '',
    time_delay: '00:00:00'
  })
  
  // Step 2 form data (platform credentials)
  const [credentialsData, setCredentialsData] = useState({
    platform_email: '',
    platform_password: '',
    platform_username: '',
    platform_phone: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (asset) {
      setAssetData({
        platform_name: asset.platform_name,
        action: asset.action,
        recipient_email: asset.recipient_email || '',
        time_delay: asset.time_delay
      })
      setCredentialsData({
        platform_email: asset.platform_email || '',
        platform_password: asset.platform_password || '',
        platform_username: asset.platform_username || '',
        platform_phone: asset.platform_phone || ''
      })
    } else {
      setAssetData({
        platform_name: '',
        action: 'Delete',
        recipient_email: '',
        time_delay: '00:00:00'
      })
      setCredentialsData({
        platform_email: '',
        platform_password: '',
        platform_username: '',
        platform_phone: ''
      })
    }
    setCurrentStep(1)
    setError('')
  }, [asset, isOpen])

  const handleStep1Continue = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate step 1
    if (!assetData.platform_name.trim()) {
      setError('Platform name is required')
      return
    }
    
    if (assetData.action === 'Transfer' && !assetData.recipient_email.trim()) {
      setError('Recipient email is required for transfer actions')
      return
    }
    
    setCurrentStep(2)
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate step 2
    if (!credentialsData.platform_email.trim()) {
      setError('Platform email is required')
      setLoading(false)
      return
    }
    
    if (!credentialsData.platform_password.trim()) {
      setError('Platform password is required')
      setLoading(false)
      return
    }

    try {
      const completeData = {
        ...assetData,
        ...credentialsData
      }
      
      if (asset) {
        await onSave(asset.id, completeData)
      } else {
        await onSave(completeData)
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
    setError('')
  }

  const handleClose = () => {
    setCurrentStep(1)
    setError('')
    onClose()
  }

  const timeDelayOptions = [
    { value: '00:00:00', label: 'Immediately' },
    { value: '01:00:00', label: '1 hour' },
    { value: '24:00:00', label: '1 day' },
    { value: '168:00:00', label: '1 week' },
    { value: '720:00:00', label: '1 month' },
    { value: '4320:00:00', label: '6 months' },
    { value: '8760:00:00', label: '1 year' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {asset ? 'Edit Asset' : 'Add New Asset'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Step {currentStep} of 2
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <div className={`flex-1 h-1 mx-3 ${
                  currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                }`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
              </div>

              {currentStep === 1 ? (
                <form onSubmit={handleStep1Continue} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={assetData.platform_name}
                      onChange={(e) => setAssetData(prev => ({ ...prev, platform_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Gmail, Facebook, Twitter"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action
                    </label>
                    <select
                      value={assetData.action}
                      onChange={(e) => setAssetData(prev => ({ ...prev, action: e.target.value as 'Delete' | 'Transfer' | 'Archive' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Delete">Delete</option>
                      <option value="Transfer">Transfer</option>
                      <option value="Archive">Archive</option>
                    </select>
                  </div>

                  {assetData.action === 'Transfer' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipient Email
                      </label>
                      <input
                        type="email"
                        value={assetData.recipient_email}
                        onChange={(e) => setAssetData(prev => ({ ...prev, recipient_email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="recipient@example.com"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Delay
                    </label>
                    <select
                      value={assetData.time_delay}
                      onChange={(e) => setAssetData(prev => ({ ...prev, time_delay: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {timeDelayOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Platform Credentials</h3>
                    <p className="text-sm text-gray-600">
                      Enter the login credentials for {assetData.platform_name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={credentialsData.platform_email}
                      onChange={(e) => setCredentialsData(prev => ({ ...prev, platform_email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={credentialsData.platform_password}
                        onChange={(e) => setCredentialsData(prev => ({ ...prev, platform_password: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={credentialsData.platform_username}
                      onChange={(e) => setCredentialsData(prev => ({ ...prev, platform_username: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Username or handle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={credentialsData.platform_phone}
                      onChange={(e) => setCredentialsData(prev => ({ ...prev, platform_phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Saving...' : 'Save Asset'}
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
