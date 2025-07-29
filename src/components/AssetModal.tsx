import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { DigitalAsset } from '../hooks/useDigitalAssets'

interface AssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, data: any) => Promise<void> | ((data: any) => Promise<void>)
  asset?: DigitalAsset
}

export function AssetModal({ isOpen, onClose, onSave, asset }: AssetModalProps) {
  const [formData, setFormData] = useState({
    platform_name: '',
    action: 'Delete' as 'Delete' | 'Transfer' | 'Archive',
    recipient_email: '',
    time_delay: '00:00:00'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (asset) {
      setFormData({
        platform_name: asset.platform_name,
        action: asset.action,
        recipient_email: asset.recipient_email || '',
        time_delay: asset.time_delay
      })
    } else {
      setFormData({
        platform_name: '',
        action: 'Delete',
        recipient_email: '',
        time_delay: '00:00:00'
      })
    }
  }, [asset, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate email if action is Transfer
    if (formData.action === 'Transfer' && !formData.recipient_email) {
      setError('Recipient email is required for transfer actions')
      setLoading(false)
      return
    }

    try {
      if (asset) {
        await onSave(asset.id, formData)
      } else {
        await onSave(formData)
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
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
                <h2 className="text-xl font-semibold text-gray-900">
                  {asset ? 'Edit Asset' : 'Add New Asset'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={formData.platform_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, platform_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Facebook, Gmail, Instagram"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action
                  </label>
                  <select
                    value={formData.action}
                    onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Delete">Delete</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Archive">Archive</option>
                  </select>
                </div>

                {formData.action === 'Transfer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      value={formData.recipient_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipient_email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="recipient@example.com"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Execution Delay
                  </label>
                  <select
                    value={formData.time_delay}
                    onChange={(e) => setFormData(prev => ({ ...prev, time_delay: e.target.value }))}
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
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}