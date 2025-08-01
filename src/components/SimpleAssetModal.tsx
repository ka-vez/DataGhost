import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Clock, Shield } from 'lucide-react'
import { DigitalAsset } from '../hooks/useDigitalAssets'

interface SimpleAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  preselectedAction: 'Delete' | 'Memorialize'
  asset?: DigitalAsset
}

export function SimpleAssetModal({ isOpen, onClose, onSave, preselectedAction, asset }: SimpleAssetModalProps) {
  const [formData, setFormData] = useState({
    platform_name: '',
    action: preselectedAction,
    time_delay: '00:00:00'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (asset) {
      setFormData({
        platform_name: asset.platform_name,
        action: asset.action as 'Delete' | 'Memorialize',
        time_delay: asset.time_delay
      })
    } else {
      setFormData({
        platform_name: '',
        action: preselectedAction,
        time_delay: '00:00:00'
      })
    }
    setError('')
  }, [asset, preselectedAction, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate form data
    if (!formData.platform_name.trim()) {
      setError('Platform name is required')
      setLoading(false)
      return
    }

    if (!formData.time_delay) {
      setError('Time delay is required')
      setLoading(false)
      return
    }

    try {
      const dataToSave = {
        platform_name: formData.platform_name.trim(),
        action: formData.action,
        time_delay: formData.time_delay,
        // For Delete and Memorialize, we don't need credentials or recipient email
        recipient_email: null,
        platform_email: null,
        platform_password: null,
        platform_username: null,
        platform_phone: null
      }

      // For SimpleAssetModal, we always pass just the data
      // The parent component will handle whether it's adding or editing
      await onSave(dataToSave)
      
      handleClose()
    } catch (error: any) {
      console.error('Failed to save asset:', error)
      setError(error.message || 'Failed to save asset. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      platform_name: '',
      action: preselectedAction,
      time_delay: '00:00:00'
    })
    setError('')
    onClose()
  }

  const actionConfig = {
    Delete: {
      title: 'Delete Asset',
      description: 'This asset will be permanently deleted after the specified time delay',
      color: 'red',
      icon: Shield
    },
    Memorialize: {
      title: 'Memorialize Asset',
      description: 'This asset will be memorialized for long-term storage after the specified time delay',
      color: 'amber',
      icon: Shield
    }
  }

  const config = actionConfig[preselectedAction]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    config.color === 'red' ? 'bg-red-100' : 'bg-amber-100'
                  }`}>
                    <config.icon className={`w-5 h-5 ${
                      config.color === 'red' ? 'text-red-600' : 'text-amber-600'
                    }`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {asset ? 'Edit' : 'Add'} {config.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {config.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Platform Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Name *
                    </label>
                    <input
                      type="text"
                      value={formData.platform_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, platform_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Instagram, Facebook, Google"
                      required
                    />
                  </div>

                  {/* Selected Action (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action
                    </label>
                    <div className={`px-3 py-2 border rounded-lg text-gray-700 ${
                      config.color === 'red' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                    }`}>
                      {formData.action}
                    </div>
                  </div>

                  {/* Time Delay */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Delay *
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="time"
                        step="1"
                        value={formData.time_delay}
                        onChange={(e) => setFormData(prev => ({ ...prev, time_delay: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      How long to wait before executing this action
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {asset ? 'Update' : 'Save'} Asset
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
