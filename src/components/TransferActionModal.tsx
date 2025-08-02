import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, ArrowRightLeft, Heart, ArrowRight } from 'lucide-react'
import { NewAssetModal } from './NewAssetModal'
import { SimpleAssetModal } from './SimpleAssetModal'

interface TransferActionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
}

export function TransferActionModal({ isOpen, onClose, onSave }: TransferActionModalProps) {
  const [selectedAction, setSelectedAction] = useState<'Delete' | 'Transfer' | 'Memorialize' | null>(null)
  const [showAssetForm, setShowAssetForm] = useState(false)

  const handleActionSelect = (action: 'Delete' | 'Transfer' | 'Memorialize') => {
    setSelectedAction(action)
    setShowAssetForm(true)
  }

  const handleAssetSave = async (data: any) => {
    // Include the selected action in the asset data
    const assetDataWithAction = {
      ...data,
      action: selectedAction
    }
    await onSave(assetDataWithAction)
    handleClose()
  }

  const handleSimpleAssetSave = async (data: any) => {
    // Data already includes the action from SimpleAssetModal
    await onSave(data)
    handleClose()
  }

  const handleClose = () => {
    setSelectedAction(null)
    setShowAssetForm(false)
    onClose()
  }

  const handleBackToActionSelection = () => {
    setShowAssetForm(false)
  }

  const actions = [
    {
      id: 'Delete' as const,
      title: 'Delete Asset',
      description: 'Permanently delete the digital asset and all associated data',
      icon: Trash2,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      hoverColor: 'hover:bg-red-100',
      iconColor: 'text-red-600',
      iconBgColor: 'bg-red-100'
    },
    {
      id: 'Transfer' as const,
      title: 'Transfer Asset',
      description: 'Transfer ownership and access to a designated recipient',
      icon: ArrowRightLeft,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:bg-blue-100',
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100'
    },
    {
      id: 'Memorialize' as const,
      title: 'Memorialize Asset',
      description: 'Memorialize the asset for long-term storage and preservation',
      icon: Heart,
      color: 'amber',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      hoverColor: 'hover:bg-amber-100',
      iconColor: 'text-amber-600',
      iconBgColor: 'bg-amber-100'
    }
  ]

  if (showAssetForm) {
    // For Transfer action, use the two-step NewAssetModal
    if (selectedAction === 'Transfer') {
      return (
        <NewAssetModal
          isOpen={true}
          onClose={handleBackToActionSelection}
          onSave={handleAssetSave}
          preselectedAction={selectedAction}
        />
      )
    }
    
    // For Delete and Memorialize actions, use the simple single-step modal
    if (selectedAction === 'Delete' || selectedAction === 'Memorialize') {
      return (
        <SimpleAssetModal
          isOpen={true}
          onClose={handleBackToActionSelection}
          onSave={handleSimpleAssetSave}
          preselectedAction={selectedAction}
        />
      )
    }
  }

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
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Choose Transfer Action
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Select what should happen to your digital asset
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {actions.map((action) => (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleActionSelect(action.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${action.bgColor} ${action.borderColor} ${action.hoverColor} hover:border-opacity-60`}
                  >
                    <div className={`p-3 rounded-lg ${action.iconBgColor} flex-shrink-0`}>
                      <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  You can always change this action later in the asset settings
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default TransferActionModal
