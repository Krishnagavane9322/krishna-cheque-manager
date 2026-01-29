import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, FileText, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/AdminLayout";
import { chequesApi, partiesApi } from "@/api/api";
import { toast } from "sonner";
import { format } from "date-fns";

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

interface Party {
  _id: string;
  name: string;
}

// Initial data removed to use real API

const AdminCheques = () => {
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCheque, setEditingCheque] = useState<Cheque | null>(null);
  const [formData, setFormData] = useState({
    chequeNumber: "",
    issueDate: "",
    partyId: "",
    amount: "",
    depositDate: "",
    status: "pending" as Cheque["status"],
    clearDate: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [chequesRes, partiesRes] = await Promise.all([
        chequesApi.getAll(),
        partiesApi.getAll()
      ]);
      setCheques(chequesRes.data);
      setParties(partiesRes.data);
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const filteredCheques = cheques.filter(cheque => {
    const matchesSearch = 
      cheque.chequeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cheque.partyId.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || cheque.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (cheque?: Cheque) => {
    if (cheque) {
      setEditingCheque(cheque);
      setFormData({
        chequeNumber: cheque.chequeNumber,
        issueDate: cheque.issueDate.split('T')[0],
        partyId: cheque.partyId._id,
        amount: cheque.amount.toString(),
        depositDate: cheque.depositDate.split('T')[0],
        status: cheque.status,
        clearDate: cheque.clearDate ? cheque.clearDate.split('T')[0] : "",
      });
    } else {
      setEditingCheque(null);
      setFormData({
        chequeNumber: "",
        issueDate: "",
        partyId: "",
        amount: "",
        depositDate: "",
        status: "pending",
        clearDate: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingCheque) {
        const response = await chequesApi.update(editingCheque._id, payload);
        setCheques(cheques.map(c => c._id === editingCheque._id ? response.data : c));
        toast.success("Cheque updated successfully");
      } else {
        const response = await chequesApi.create(payload);
        setCheques([...cheques, response.data]);
        toast.success("Cheque added successfully");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to save cheque");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this cheque?")) {
      try {
        await chequesApi.delete(id);
        setCheques(cheques.filter(c => c._id !== id));
        toast.success("Cheque deleted successfully");
      } catch (err) {
        toast.error("Failed to delete cheque");
      }
    }
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
    const csvData = cheques.map(c => [c.chequeNumber, c.issueDate, c.partyId.name, c.amount, c.depositDate, c.status]);
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
                      value={formData.partyId} 
                      onValueChange={(value) => setFormData({ ...formData, partyId: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select party" />
                      </SelectTrigger>
                      <SelectContent>
                        {parties.map((party) => (
                          <SelectItem key={party._id} value={party._id}>{party.name}</SelectItem>
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
                  {formData.status === "cleared" && (
                    <Input
                      label="Cleared Date"
                      type="date"
                      value={formData.clearDate}
                      onChange={(e) => setFormData({ ...formData, clearDate: e.target.value })}
                      required
                    />
                  )}
                   <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={submitting}>
                      {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {editingCheque ? (submitting ? "Updating..." : "Update") : (submitting ? "Adding..." : "Add")} Cheque
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
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : (
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
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Cleared Date</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredCheques.map((cheque, index) => (
                      <tr 
                        key={cheque._id} 
                        className="hover:bg-muted/30 transition-colors animate-fade-up"
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <td className="p-4">
                          <span className="font-mono text-sm font-medium text-foreground">{cheque.chequeNumber}</span>
                        </td>
                        <td className="p-4 text-sm text-foreground">{cheque.partyId?.name || "N/A"}</td>
                        <td className="p-4 text-sm font-semibold text-foreground">₹{cheque.amount.toLocaleString()}</td>
                        <td className="p-4 text-sm text-muted-foreground">{format(new Date(cheque.issueDate), 'dd MMM yyyy')}</td>
                        <td className="p-4 text-sm text-muted-foreground">{format(new Date(cheque.depositDate), 'dd MMM yyyy')}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {cheque.clearDate ? format(new Date(cheque.clearDate), 'dd MMM yyyy') : "-"}
                        </td>
                        <td className="p-4">{getStatusBadge(cheque.status)}</td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(cheque)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(cheque._id)} className="text-destructive hover:text-destructive">
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
        )}

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
