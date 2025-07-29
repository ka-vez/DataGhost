import { motion } from 'framer-motion'
import { Edit2, Trash2, Clock, Mail, Archive, Trash, Share, File } from 'lucide-react'
import { DigitalAsset } from '../hooks/useDigitalAssets'

interface AssetCardProps {
  asset: DigitalAsset
  index: number
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function AssetCard({ asset, index, onEdit, onDelete }: AssetCardProps) {
  const getActionIcon = () => {
    switch (asset.action) {
      case 'Delete': return <Trash className="w-5 h-5" />
      case 'Transfer': return <Share className="w-5 h-5" />
      case 'Archive': return <Archive className="w-5 h-5" />
    }
  }

  const getActionColor = () => {
    switch (asset.action) {
      case 'Delete': return 'text-red-600 bg-red-50'
      case 'Transfer': return 'text-blue-600 bg-blue-50'
      case 'Archive': return 'text-yellow-600 bg-yellow-50'
    }
  }

  const formatTimeDelay = (delay: string) => {
    if (delay === '00:00:00') return 'Immediately'
    // Parse PostgreSQL interval format
    const parts = delay.split(':')
    if (parts.length === 3) {
      const hours = parseInt(parts[0])
      const minutes = parseInt(parts[1])
      if (hours === 0 && minutes === 0) return 'Immediately'
      if (hours === 0) return `${minutes} minutes`
      if (minutes === 0) return `${hours} hours`
      return `${hours}h ${minutes}m`
    }
    return delay
  }

  const isFileAsset = asset.platform_name.startsWith('File:')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isFileAsset && <File className="w-5 h-5 text-purple-600" />}
            <h3 className="text-lg font-semibold text-gray-900">
              {asset.platform_name}
            </h3>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getActionColor()}`}>
            {getActionIcon()}
            {asset.action}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(asset.id)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(asset.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="space-y-3">
        {asset.recipient_email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{asset.recipient_email}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Execute: {formatTimeDelay(asset.time_delay)}</span>
        </div>

        {isFileAsset && asset.file_size && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <File className="w-4 h-4" />
            <span>Size: {asset.file_size}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Added {new Date(asset.created_at).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  )
}