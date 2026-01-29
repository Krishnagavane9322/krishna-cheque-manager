import { useState } from "react";
import { Plus, Search, Edit2, Trash2, FileText, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/AdminLayout";

interface Cheque {
  id: number;
  chequeNumber: string;
  issueDate: string;
  partyName: string;
  amount: number;
  depositDate: string;
  status: "pending" | "deposited" | "cleared";
}

const parties = ["Sharma Textiles", "Kumar Fabrics", "Patel & Sons", "Gupta Traders", "Singh Enterprises"];

const initialCheques: Cheque[] = [
  { id: 1, chequeNumber: "CHQ001234", issueDate: "2024-01-10", partyName: "Sharma Textiles", amount: 45000, depositDate: "2024-01-18", status: "pending" },
  { id: 2, chequeNumber: "CHQ001235", issueDate: "2024-01-11", partyName: "Kumar Fabrics", amount: 78500, depositDate: "2024-01-14", status: "deposited" },
  { id: 3, chequeNumber: "CHQ001236", issueDate: "2024-01-08", partyName: "Patel & Sons", amount: 32000, depositDate: "2024-01-13", status: "cleared" },
  { id: 4, chequeNumber: "CHQ001237", issueDate: "2024-01-12", partyName: "Gupta Traders", amount: 56000, depositDate: "2024-01-19", status: "pending" },
  { id: 5, chequeNumber: "CHQ001238", issueDate: "2024-01-05", partyName: "Singh Enterprises", amount: 91000, depositDate: "2024-01-11", status: "cleared" },
  { id: 6, chequeNumber: "CHQ001239", issueDate: "2024-01-13", partyName: "Sharma Textiles", amount: 28000, depositDate: "2024-01-20", status: "pending" },
];

const AdminCheques = () => {
  const [cheques, setCheques] = useState<Cheque[]>(initialCheques);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCheque, setEditingCheque] = useState<Cheque | null>(null);
  const [formData, setFormData] = useState({
    chequeNumber: "",
    issueDate: "",
    partyName: "",
    amount: "",
    depositDate: "",
    status: "pending" as Cheque["status"],
  });

  const filteredCheques = cheques.filter(cheque => {
    const matchesSearch = 
      cheque.chequeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cheque.partyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || cheque.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (cheque?: Cheque) => {
    if (cheque) {
      setEditingCheque(cheque);
      setFormData({
        chequeNumber: cheque.chequeNumber,
        issueDate: cheque.issueDate,
        partyName: cheque.partyName,
        amount: cheque.amount.toString(),
        depositDate: cheque.depositDate,
        status: cheque.status,
      });
    } else {
      setEditingCheque(null);
      setFormData({
        chequeNumber: "",
        issueDate: "",
        partyName: "",
        amount: "",
        depositDate: "",
        status: "pending",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCheque) {
      setCheques(cheques.map(c => 
        c.id === editingCheque.id 
          ? { ...c, ...formData, amount: parseFloat(formData.amount) } 
          : c
      ));
    } else {
      const newCheque: Cheque = {
        id: Date.now(),
        chequeNumber: formData.chequeNumber,
        issueDate: formData.issueDate,
        partyName: formData.partyName,
        amount: parseFloat(formData.amount),
        depositDate: formData.depositDate,
        status: formData.status,
      };
      setCheques([...cheques, newCheque]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    setCheques(cheques.filter(c => c.id !== id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium status-pending border">Pending</span>;
      case "deposited":
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium status-deposited border">Deposited</span>;
      case "cleared":
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium status-cleared border">Cleared</span>;
      default:
        return null;
    }
  };

  const exportToCSV = () => {
    const headers = ["Cheque Number", "Issue Date", "Party Name", "Amount", "Deposit Date", "Status"];
    const csvData = cheques.map(c => [c.chequeNumber, c.issueDate, c.partyName, c.amount, c.depositDate, c.status]);
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cheques.csv";
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Cheques Management</h2>
            <p className="text-muted-foreground">Track and manage all cheque entries</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenModal()} variant="gold">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Cheque
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display">
                    {editingCheque ? "Edit Cheque" : "Add New Cheque"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <Input
                    label="Cheque Number"
                    value={formData.chequeNumber}
                    onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                    required
                  />
                  <Input
                    label="Issue Date"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    required
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Party Name</label>
                    <Select 
                      value={formData.partyName} 
                      onValueChange={(value) => setFormData({ ...formData, partyName: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select party" />
                      </SelectTrigger>
                      <SelectContent>
                        {parties.map((party) => (
                          <SelectItem key={party} value={party}>{party}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    label="Amount (₹)"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                  <Input
                    label="Deposit Date"
                    type="date"
                    value={formData.depositDate}
                    onChange={(e) => setFormData({ ...formData, depositDate: e.target.value })}
                    required
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Status</label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: Cheque["status"]) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="deposited">Deposited</SelectItem>
                        <SelectItem value="cleared">Cleared</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      {editingCheque ? "Update" : "Add"} Cheque
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card variant="flat">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by cheque number or party..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48 h-12">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="deposited">Deposited</SelectItem>
                  <SelectItem value="cleared">Cleared</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cheques Table */}
        <Card variant="elevated">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Cheque No.</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Party</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Issue Date</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Deposit Date</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCheques.map((cheque, index) => (
                    <tr 
                      key={cheque.id} 
                      className="hover:bg-muted/30 transition-colors animate-fade-up"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm font-medium text-foreground">{cheque.chequeNumber}</span>
                      </td>
                      <td className="p-4 text-sm text-foreground">{cheque.partyName}</td>
                      <td className="p-4 text-sm font-semibold text-foreground">₹{cheque.amount.toLocaleString()}</td>
                      <td className="p-4 text-sm text-muted-foreground">{cheque.issueDate}</td>
                      <td className="p-4 text-sm text-muted-foreground">{cheque.depositDate}</td>
                      <td className="p-4">{getStatusBadge(cheque.status)}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenModal(cheque)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(cheque.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredCheques.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No cheques found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCheques;
