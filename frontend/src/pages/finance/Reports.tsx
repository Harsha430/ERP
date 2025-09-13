import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, BarChart3, TrendingUp, DollarSign } from 'lucide-react';

export default function Reports() {
  const reports = [
    {
      id: 'financial-summary',
      title: 'Financial Summary Report',
      description: 'Comprehensive overview of financial performance',
      type: 'PDF',
      lastGenerated: '2024-01-15',
      icon: DollarSign,
    },
    {
      id: 'profit-loss',
      title: 'Profit & Loss Statement',
      description: 'Detailed P&L analysis for the current period',
      type: 'Excel',
      lastGenerated: '2024-01-14',
      icon: TrendingUp,
    },
    {
      id: 'budget-analysis',
      title: 'Budget Analysis Report',
      description: 'Budget vs actual performance analysis',
      type: 'PDF',
      lastGenerated: '2024-01-13',
      icon: BarChart3,
    },
    {
      id: 'cash-flow',
      title: 'Cash Flow Statement',
      description: 'Monthly cash flow analysis and projections',
      type: 'Excel',
      lastGenerated: '2024-01-12',
      icon: Calendar,
    },
    {
      id: 'balance-sheet',
      title: 'Balance Sheet',
      description: 'Complete balance sheet with assets and liabilities',
      type: 'PDF',
      lastGenerated: '2024-01-11',
      icon: FileText,
    },
    {
      id: 'tax-report',
      title: 'Tax Compliance Report',
      description: 'Tax calculations and compliance documentation',
      type: 'PDF',
      lastGenerated: '2024-01-10',
      icon: FileText,
    },
  ];

  const handleDownload = (reportId: string, reportTitle: string) => {
    // Mock download functionality
    console.log(`Downloading ${reportTitle}...`);
    // In real app, this would trigger actual download
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">Generate and download financial reports</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <FileText className="h-4 w-4 mr-2" />
          Generate Custom Report
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold">{reports.length}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Downloads</p>
                  <p className="text-2xl font-bold">248</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-600">
                  <Download className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Automated</p>
                  <p className="text-2xl font-bold">4</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-600">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <Card className="erp-card hover:shadow-erp-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-primary">
                      <report.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="font-medium">{report.type}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Generated:</span>
                    <span className="font-medium">{report.lastGenerated}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1 bg-gradient-primary hover:opacity-90"
                      onClick={() => handleDownload(report.id, report.title)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}