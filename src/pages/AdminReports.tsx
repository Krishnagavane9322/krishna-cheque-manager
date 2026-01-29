import { useEffect, useState } from "react";
import { Download, FileText, Filter, Loader2, Building2, TrendingUp, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/AdminLayout";
import { chequesApi, partiesApi } from "@/api/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface Party {
  _id: string;
  name: string;
}

interface Cheque {
  _id: string;
  chequeNumber: string;
  issueDate: string;
  partyId: {
    _id: string;
    name: string;
  };
  amount: number;
  depositDate: string;
  status: "pending" | "deposited" | "cleared";
  clearDate?: string;
}

const AdminReports = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState<string>("all");
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [partiesRes, chequesRes] = await Promise.all([
        partiesApi.getAll(),
        chequesApi.getAll()
      ]);
      setParties(partiesRes.data);
      setCheques(chequesRes.data);
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const filteredCheques = selectedPartyId === "all" 
    ? cheques 
    : cheques.filter(c => c.partyId?._id === selectedPartyId);

  const stats = {
    totalCount: filteredCheques.length,
    totalAmount: filteredCheques.reduce((sum, c) => sum + c.amount, 0),
    pending: filteredCheques.filter(c => c.status === "pending").length,
    cleared: filteredCheques.filter(c => c.status === "cleared").length,
    deposited: filteredCheques.filter(c => c.status === "deposited").length,
  };

  const exportToCSV = () => {
    setExporting(true);
    try {
      const party = parties.find(p => p._id === selectedPartyId);
      const filename = party ? `cheques_${party.name.replace(/\s+/g, '_')}.csv` : "all_cheques.csv";
      
      const headers = ["Cheque No.", "Party", "Amount", "Issue Date", "Deposit Date", "Clear Date", "Status"];
      const csvData = filteredCheques.map(c => [
        c.chequeNumber,
        c.partyId?.name || "N/A",
        c.amount,
        format(new Date(c.issueDate), 'yyyy-MM-dd'),
        format(new Date(c.depositDate), 'yyyy-MM-dd'),
        c.clearDate ? format(new Date(c.clearDate), 'yyyy-MM-dd') : "",
        c.status.toUpperCase()
      ]);

      const csvContent = [headers, ...csvData].map(row => row.map(val => `"${val}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Report downloaded successfully");
    } catch (err) {
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Business Reports</h2>
            <p className="text-muted-foreground">Download and analyze party-wise cheque data</p>
          </div>
          <Button 
            onClick={exportToCSV} 
            disabled={exporting || filteredCheques.length === 0}
            variant="gold"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
        </div>

        {/* Filters */}
        <Card variant="flat">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter by Party:</span>
              </div>
              <Select value={selectedPartyId} onValueChange={setSelectedPartyId}>
                <SelectTrigger className="w-full sm:w-[300px] h-11">
                  <SelectValue placeholder="Select a party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parties</SelectItem>
                  {parties.map(party => (
                    <SelectItem key={party._id} value={party._id}>
                      {party.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="elevated">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-display font-bold text-foreground">₹{stats.totalAmount.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cheques</p>
                <p className="text-2xl font-display font-bold text-foreground">{stats.totalCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cleared</p>
                <p className="text-2xl font-display font-bold text-success">{stats.cleared}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-display font-bold text-warning">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg font-display">Data Preview ({filteredCheques.length} entries)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cheque No.</th>
                      {selectedPartyId === "all" && <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Party</th>}
                      <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                      <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deposit Date</th>
                      <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredCheques.map((c) => (
                      <tr key={c._id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 font-mono text-sm">{c.chequeNumber}</td>
                        {selectedPartyId === "all" && <td className="p-4 text-sm">{c.partyId?.name || "N/A"}</td>}
                        <td className="p-4 text-sm font-semibold">₹{c.amount.toLocaleString()}</td>
                        <td className="p-4 text-sm text-muted-foreground">{format(new Date(c.depositDate), 'dd MMM yyyy')}</td>
                        <td className="p-4 capitalize">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            c.status === 'cleared' ? 'bg-success/10 text-success border-success/20' :
                            c.status === 'deposited' ? 'bg-primary/10 text-primary border-primary/20' :
                            'bg-warning/10 text-warning border-warning/20'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredCheques.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-muted-foreground">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          No data found for this selection
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
