// Utility functions for exporting billing data

interface BillingEvent {
  id: string
  date: string
  type: 'payment' | 'plan_change' | 'cancellation' | 'refund'
  description: string
  amount?: number
  status: 'success' | 'pending' | 'failed'
  planName?: string
}

export function exportToCSV(events: BillingEvent[]): void {
  const headers = ['Date', 'Type', 'Description', 'Plan', 'Amount', 'Status']
  
  const csvContent = [
    headers.join(','),
    ...events.map(event => [
      event.date,
      event.type,
      `"${event.description}"`, // Quote description in case it contains commas
      event.planName || '',
      event.amount ? `$${(event.amount / 100).toFixed(2)}` : '',
      event.status
    ].join(','))
  ].join('\n')

  // Create and download the CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `billing-history-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function generatePDFContent(events: BillingEvent[]): string {
  const currentDate = new Date().toLocaleDateString()
  
  // HTML content for PDF generation
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Billing History Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #3B82F6;
          padding-bottom: 20px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #1F2937;
          margin-bottom: 5px;
        }
        .report-title {
          font-size: 18px;
          color: #6B7280;
        }
        .report-date {
          font-size: 14px;
          color: #9CA3AF;
          margin-top: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #E5E7EB;
        }
        th {
          background-color: #F3F4F6;
          font-weight: 600;
          color: #374151;
        }
        .amount {
          text-align: right;
          font-weight: 600;
        }
        .status-success {
          color: #10B981;
          font-weight: 600;
        }
        .status-failed {
          color: #EF4444;
          font-weight: 600;
        }
        .status-pending {
          color: #F59E0B;
          font-weight: 600;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #9CA3AF;
          font-size: 12px;
        }
        .summary {
          background-color: #F9FAFB;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 8px;
        }
        .summary-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #1F2937;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Payment Flow Learning</div>
        <div class="report-title">Billing History Report</div>
        <div class="report-date">Generated on ${currentDate}</div>
      </div>

      <div class="summary">
        <div class="summary-title">Summary</div>
        <div class="summary-item">
          <span>Total Transactions:</span>
          <span>${events.length}</span>
        </div>
        <div class="summary-item">
          <span>Successful Payments:</span>
          <span>${events.filter(e => e.type === 'payment' && e.status === 'success').length}</span>
        </div>
        <div class="summary-item">
          <span>Plan Changes:</span>
          <span>${events.filter(e => e.type === 'plan_change').length}</span>
        </div>
        <div class="summary-item">
          <span>Total Amount:</span>
          <span>$${(events.reduce((sum, e) => sum + (e.amount || 0), 0) / 100).toFixed(2)}</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Description</th>
            <th>Plan</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${events.map(event => `
            <tr>
              <td>${new Date(event.date).toLocaleDateString()}</td>
              <td style="text-transform: capitalize;">${event.type.replace('_', ' ')}</td>
              <td>${event.description}</td>
              <td>${event.planName || '-'}</td>
              <td class="amount">${event.amount ? `$${(event.amount / 100).toFixed(2)}` : '-'}</td>
              <td class="status-${event.status}">${event.status.charAt(0).toUpperCase() + event.status.slice(1)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>This is a system-generated report. For questions about your billing, please contact support.</p>
        <p>Payment Flow Learning - Your trusted subscription service</p>
      </div>
    </body>
    </html>
  `

  return htmlContent
}

export function downloadPDF(events: BillingEvent[]): void {
  const htmlContent = generatePDFContent(events)
  
  // Create a new window and print it (browser will show print dialog with PDF option)
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Wait a bit for content to load, then trigger print
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}