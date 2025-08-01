import jsPDF from 'jspdf'
import { DigitalAsset } from '../hooks/useDigitalAssets'

export const generateDigitalWillPDF = async (assets: DigitalAsset[], username: string) => {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  
  let yPosition = margin

  // Helper function to convert time delay to user-friendly format
  const formatTimeDelay = (timeDelay: string): string => {
    if (timeDelay === '00:00:00') return 'Immediately'
    
    // Parse the time delay format (HH:MM:SS)
    const [hours, minutes, seconds] = timeDelay.split(':').map(Number)
    const totalHours = hours + (minutes / 60) + (seconds / 3600)
    
    if (totalHours < 1) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`
    } else if (totalHours < 24) {
      return `${Math.floor(totalHours)} hour${Math.floor(totalHours) !== 1 ? 's' : ''}`
    } else {
      const days = Math.floor(totalHours / 24)
      return `${days} day${days !== 1 ? 's' : ''}`
    }
  }

  // Helper function to add text with word wrapping
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: string = '#000000') => {
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal')
    pdf.setTextColor(color)
    
    const lines = pdf.splitTextToSize(text, contentWidth)
    
    // Check if we need a new page
    if (yPosition + (lines.length * fontSize * 0.5) > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }
    
    pdf.text(lines, margin, yPosition)
    yPosition += lines.length * fontSize * 0.5 + 5
  }

  // Add header with security styling
  pdf.setFillColor(59, 130, 246) // Blue background
  pdf.rect(0, 0, pageWidth, 60, 'F')
  
  pdf.setTextColor('#FFFFFF')
  pdf.setFontSize(28)
  pdf.setFont('helvetica', 'bold')
  pdf.text('DIGITAL WILL', pageWidth / 2, 25, { align: 'center' })
  
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Secure Digital Legacy Document', pageWidth / 2, 40, { align: 'center' })
  
  yPosition = 80

  // Add document info
  pdf.setTextColor('#000000')
  addText(`Digital Will for: ${username}`, 18, true, '#1F2937')
  addText(`Generated on: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 12, false, '#6B7280')
  
  yPosition += 10

  // Add security notice
  pdf.setFillColor(239, 246, 255) // Light blue background
  pdf.rect(margin - 5, yPosition - 5, contentWidth + 10, 40, 'F')
  
  addText('CONFIDENTIAL DOCUMENT', 14, true, '#1E40AF')
  addText('This document contains sensitive information about digital assets and should be stored securely. Access should be limited to authorized individuals only.', 10, false, '#374151')
  
  yPosition += 15

  // Add summary
  addText('EXECUTIVE SUMMARY', 16, true, '#1F2937')
  addText(`This digital will contains instructions for ${assets.length} digital asset${assets.length !== 1 ? 's' : ''} to be executed upon activation of the dead man's switch system.`, 12)
  
  yPosition += 10

  // Group assets by action
  const groupedAssets = assets.reduce((acc, asset) => {
    if (!acc[asset.action]) {
      acc[asset.action] = []
    }
    acc[asset.action].push(asset)
    return acc
  }, {} as Record<string, DigitalAsset[]>)

  // Add assets by category
  Object.entries(groupedAssets).forEach(([action, actionAssets]) => {
    // Add section header
    const actionColors = {
      'Delete': '#DC2626',
      'Transfer': '#2563EB', 
      'Memorialize': '#D97706'
    }
    
    addText(`${action.toUpperCase()} ACTIONS (${actionAssets.length} item${actionAssets.length !== 1 ? 's' : ''})`, 14, true, actionColors[action as keyof typeof actionColors])
    
    actionAssets.forEach((asset, index) => {
      // Asset card background
      pdf.setFillColor(249, 250, 251) // Light gray background
      pdf.rect(margin - 5, yPosition - 5, contentWidth + 10, 45, 'F')
      
      addText(`${index + 1}. ${asset.platform_name}`, 12, true, '#1F2937')
      
      if (asset.recipient_email) {
        addText(`   Recipient: ${asset.recipient_email}`, 10, false, '#4B5563')
      }
      
      const timeDelay = formatTimeDelay(asset.time_delay)
      addText(`   Execution Delay: ${timeDelay}`, 10, false, '#4B5563')
      
      if (asset.file_name) {
        addText(`   File: ${asset.file_name} (${asset.file_size || 'Unknown size'})`, 10, false, '#4B5563')
      }
      
      addText(`   Added: ${new Date(asset.created_at).toLocaleDateString()}`, 10, false, '#6B7280')
      
      yPosition += 10
    })
    
    yPosition += 10
  })

  // Add footer with legal notice
  if (yPosition > pageHeight - 100) {
    pdf.addPage()
    yPosition = margin
  }

  yPosition = pageHeight - 80

  pdf.setFillColor(243, 244, 246) // Light gray background
  pdf.rect(margin - 5, yPosition - 5, contentWidth + 10, 60, 'F')

  addText('LEGAL NOTICE & AUTHENTICATION', 12, true, '#1F2937')
  addText('This digital will was generated by DataGhost Digital Legacy Manager. The instructions contained herein represent the authenticated wishes of the account holder and should be executed according to the specified parameters.', 9, false, '#4B5563')
  addText(`Document ID: DW-${Date.now()}-${username.replace(/\s+/g, '').toUpperCase()}`, 8, false, '#6B7280')
  addText('For verification or questions, contact: support@dataghost.com', 8, false, '#6B7280')

  // Add page numbers
  const pageCount = pdf.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setTextColor('#6B7280')
    pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' })
  }

  // Save the PDF
  const fileName = `Digital_Will_${username.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
}