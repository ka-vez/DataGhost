import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Save } from 'lucide-react'
import { DigitalAsset } from '../hooks/useDigitalAssets'
import { hashCredentials } from '../utils/credentialHashing'

interface NewAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, data: any) => Promise<void> | ((data: any) => Promise<void>)
  asset?: DigitalAsset
  preselectedAction?: 'Delete' | 'Transfer' | 'Archive'
}

export function NewAssetModal({ isOpen, onClose, onSave, asset, preselectedAction }: NewAssetModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [assetData, setAssetData] = useState({
    platform_name: '',
    action: 'Delete' as 'Delete' | 'Transfer' | 'Archive',
    recipient_email: '',
    time_delay: '00:00:00'
  })
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
      // For editing existing assets, we'll show placeholder text since credentials are hashed
      // and cannot be decrypted for display
      setCredentialsData({
        platform_email: asset.platform_email ? '••••••••••••••••••••••••' : '',
        platform_password: asset.platform_password ? '••••••••••••••••••••••••' : '',
        platform_username: asset.platform_username ? '••••••••••••••••••••••••' : '',
        platform_phone: asset.platform_phone ? '••••••••••••••••••••••••' : ''
      })
    } else {
      setAssetData({
        platform_name: '',
        action: preselectedAction || 'Delete',
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
  }, [asset, isOpen, preselectedAction])

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate asset data
    if (!assetData.platform_name) {
      setError('Platform name is required')
      return
    }

    // Validate email if action is Transfer
    if (assetData.action === 'Transfer' && !assetData.recipient_email) {
      setError('Recipient email is required for transfer actions')
      return
    }

    // For Delete and Archive actions, skip credentials and submit directly
    if (assetData.action === 'Delete' || assetData.action === 'Archive') {
      handleDirectSubmit()
      return
    }

    // For Transfer action, move to credentials step
    setCurrentStep(2)
  }

  const handleDirectSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const finalData = {
        platform_name: assetData.platform_name,
        action: assetData.action,
        recipient_email: assetData.action === 'Transfer' ? assetData.recipient_email : null,
        time_delay: assetData.time_delay,
        // For Delete and Archive, no credentials needed
        platform_email: null,
        platform_password: null,
        platform_username: null,
        platform_phone: null
      }

      if (asset) {
        // Editing case
        await onSave(asset.id, finalData)
      } else {
        // Adding case - cast to single parameter function
        await (onSave as (data: any) => Promise<void>)(finalData)
      }
      
      handleClose()
    } catch (error: any) {
      console.error('Failed to save asset:', error)
      setError(error.message || 'Failed to save asset. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // For editing assets, check if user wants to keep existing credentials
    const isEditing = !!asset
    const hasNewEmail = credentialsData.platform_email && !credentialsData.platform_email.startsWith('••••••')
    const hasNewPassword = credentialsData.platform_password && !credentialsData.platform_password.startsWith('••••••')
    
    // For new assets, require email and password
    if (!isEditing) {
      if (!credentialsData.platform_email) {
        setError('Platform email is required')
        setLoading(false)
        return
      }
      if (!credentialsData.platform_password) {
        setError('Platform password is required')
        setLoading(false)
        return
      }
    }
    
    // For editing assets, only require new values if user is updating
    if (isEditing && !hasNewEmail && !hasNewPassword) {
      setError('Please enter new credentials to update, or click back to keep existing ones')
      setLoading(false)
      return
    }

    try {
      // Prepare credentials for hashing
      const credentialsToHash: any = {}
      
      // Only hash credentials that are new (not placeholder text)
      if (credentialsData.platform_email && !credentialsData.platform_email.startsWith('••••••')) {
        credentialsToHash.platform_email = credentialsData.platform_email
      }
      if (credentialsData.platform_password && !credentialsData.platform_password.startsWith('••••••')) {
        credentialsToHash.platform_password = credentialsData.platform_password
      }
      if (credentialsData.platform_username && !credentialsData.platform_username.startsWith('••••••')) {
        credentialsToHash.platform_username = credentialsData.platform_username
      }
      if (credentialsData.platform_phone && !credentialsData.platform_phone.startsWith('••••••')) {
        credentialsToHash.platform_phone = credentialsData.platform_phone
      }

      // Hash the new credential data
      const hashedCredentials = await hashCredentials(credentialsToHash)

      // For editing, only include the fields that are being updated
      const fullData = {
        ...assetData,
        ...(Object.keys(hashedCredentials).length > 0 ? hashedCredentials : {})
      }

      if (asset) {
        // For editing, pass the asset ID and data
        await onSave(asset.id, fullData)
      } else {
        // For adding, we need to check if onSave expects one or two parameters
        // The function signature is overloaded to handle both cases
        await (onSave as (data: any) => Promise<void>)(fullData)
      }
      onClose()
    } catch (error) {
      console.error('Save failed:', error)
      setError('Failed to save asset. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setError('')
    onClose()
  }

  const handleBackToAssetInfo = () => {
    setCurrentStep(1)
    setError('')
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

  if (!isOpen) {
    return null
  }

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
                  {/* Only show step info for Transfer actions */}
                  {assetData.action === 'Transfer' && (
                    <p className="text-sm text-gray-500 mt-1">
                      Step {currentStep} of 2
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step Indicator - Only show for Transfer actions */}
              {assetData.action === 'Transfer' && (
                <div className="flex items-center mb-6">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    1
                  </div>
                  <div className={`flex-1 h-1 mx-3 ${
                    currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    2
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Step 1: Asset Information */}
              {currentStep === 1 && (
                <form onSubmit={handleAssetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={assetData.platform_name}
                      onChange={(e) => setAssetData(prev => ({ ...prev, platform_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Facebook, Gmail, Instagram"
                      required
                    />
                  </div>

                  {/* Only show action selector if no preselected action */}
                  {!preselectedAction && (
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
                  )}

                  {/* Show selected action as read-only if preselected */}
                  {preselectedAction && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected Action
                      </label>
                      <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                        {assetData.action}
                      </div>
                    </div>
                  )}

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
                        placeholder="Enter recipient email"
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

                  <div className="flex justify-end pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : assetData.action === 'Delete' || assetData.action === 'Archive' ? (
                        <>
                          <Save className="w-4 h-4" />
                          {asset ? 'Update' : 'Save'} Asset
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              )}

              {/* Step 2: Platform Credentials */}
              {currentStep === 2 && (
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Platform Credentials
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Enter the login credentials for {assetData.platform_name}
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-xs text-blue-700">
                        🔒 Your credentials are encrypted using SHA-256 hashing before being stored securely.
                      </p>
                    </div>
                    {asset && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-amber-700">
                          ℹ️ Existing credentials are shown as dots. Enter new values to update them, or leave unchanged to keep current ones.
                        </p>
                      </div>
                    )}
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
                      placeholder="Enter platform email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={credentialsData.platform_password}
                      onChange={(e) => setCredentialsData(prev => ({ ...prev, platform_password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter platform password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={credentialsData.platform_username}
                      onChange={(e) => setCredentialsData(prev => ({ ...prev, platform_username: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter username (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={credentialsData.platform_phone}
                      onChange={(e) => setCredentialsData(prev => ({ ...prev, platform_phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number (optional)"
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleBackToAssetInfo}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Asset
                        </>
                      )}
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
