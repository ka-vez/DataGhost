import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search,
  Filter,
  File,
  ArrowLeft
} from 'lucide-react'
import { useDigitalAssets } from '../hooks/useDigitalAssets'
import { AssetCard } from './AssetCard'
import { useNavigate } from 'react-router-dom'

export function AssetDetails() {
  const { assets, loading, deleteAsset } = useDigitalAssets()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<string>('all')
  const navigate = useNavigate()

  // Filter assets based on search and filter
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.platform_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (asset.recipient_email && asset.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterAction === 'all' || asset.action === filterAction
    return matchesSearch && matchesFilter
  })

  const assetCounts = {
    all: assets.length,
    Delete: assets.filter(a => a.action === 'Delete').length,
    Transfer: assets.filter(a => a.action === 'Transfer').length,
    Archive: assets.filter(a => a.action === 'Archive').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Asset Details</h1>
                <p className="text-sm text-gray-500">Manage your digital assets</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                aria-label="Filter assets by action"
                className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Actions ({assetCounts.all})</option>
                <option value="Delete">Delete ({assetCounts.Delete})</option>
                <option value="Transfer">Transfer ({assetCounts.Transfer})</option>
                <option value="Archive">Archive ({assetCounts.Archive})</option>
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="text-2xl font-bold text-red-600 mb-1">{assetCounts.Delete}</div>
              <div className="text-sm text-red-600">Delete</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-600 mb-1">{assetCounts.Transfer}</div>
              <div className="text-sm text-blue-600">Transfer</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="text-2xl font-bold text-yellow-600 mb-1">{assetCounts.Archive}</div>
              <div className="text-sm text-yellow-600">Archive</div>
            </div>
          </div>
        </div>

        {/* Assets List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-12">
              <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">
                {searchTerm || filterAction !== 'all' ? 'No matching assets' : 'No assets yet'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {searchTerm || filterAction !== 'all' 
                  ? 'Try adjusting your search or filter'
                  : 'Add your first digital asset to get started'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssets.map((asset, index) => (
                <motion.div 
                  key={asset.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AssetCard
                    asset={asset}
                    index={index}
                    onEdit={(id) => {
                      // Handle edit - you might want to add edit functionality here
                      console.log('Edit asset:', id)
                    }}
                    onDelete={deleteAsset}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 