import { motion } from 'framer-motion'
import { ArrowLeft, Trash, Share, Archive, AlertTriangle } from 'lucide-react'
import { DigitalAsset } from '../hooks/useDigitalAssets'

interface ExecutionSummaryProps {
  assets: DigitalAsset[]
  onBack: () => void
}

export function ExecutionSummary({ assets, onBack }: ExecutionSummaryProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Delete': return <Trash className="w-5 h-5" />
      case 'Transfer': return <Share className="w-5 h-5" />
      case 'Archive': return <Archive className="w-5 h-5" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Delete': return 'text-red-600 bg-red-50 border-red-200'
      case 'Transfer': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'Archive': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  const groupedAssets = assets.reduce((acc, asset) => {
    if (!acc[asset.action]) {
      acc[asset.action] = []
    }
    acc[asset.action].push(asset)
    return acc
  }, {} as Record<string, DigitalAsset[]>)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Digital Will Execution Summary
              </h1>
              <p className="text-gray-600">
                Your digital legacy plan has been triggered
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-800">Status: Triggered</span>
            </div>
            <p className="text-red-700 text-sm">
              Your dead man's switch has been activated. The following actions will be executed according to your digital will.
            </p>
          </div>
        </motion.div>

        <div className="space-y-8">
          {Object.entries(groupedAssets).map(([action, actionAssets]) => (
            <motion.div
              key={action}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className={`flex items-center gap-3 mb-4 pb-4 border-b border-gray-100`}>
                <div className={`p-2 rounded-lg ${getActionColor(action)}`}>
                  {getActionIcon(action)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {action} Actions
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {actionAssets.length} asset{actionAssets.length !== 1 ? 's' : ''} will be {action.toLowerCase()}d
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {actionAssets.map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {asset.platform_name}
                      </h3>
                      {asset.recipient_email && (
                        <p className="text-sm text-gray-600">
                          Recipient: {asset.recipient_email}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">
                        Delay: {asset.time_delay === '00:00:00' ? 'Immediate' : asset.time_delay}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {assets.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Archive className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No assets configured
            </h3>
            <p className="text-gray-600">
              You haven't configured any digital assets yet. Your digital will is empty.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}