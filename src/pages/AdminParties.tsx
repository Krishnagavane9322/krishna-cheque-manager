import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, X, Building2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AdminLayout from "@/components/AdminLayout";
import { partiesApi } from "@/api/api";
import { toast } from "sonner";

interface Party {
  _id: string;
  name: string;
  address: string;
  contact: string;
  email: string;
  gst?: string;
}

// Mock data removed to use real API

const AdminParties = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    email: "",
    gst: "",
  });

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await partiesApi.getAll();
      setParties(response.data);
    } catch (err) {
      toast.error("Failed to fetch parties");
    } finally {
      setLoading(false);
    }
  };

  const filteredParties = parties.filter(party =>
    party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    party.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (party?: Party) => {
    if (party) {
      setEditingParty(party);
      setFormData({
        name: party.name,
        address: party.address,
        contact: party.contact,
        email: party.email,
        gst: party.gst || "",
      });
    } else {
      setEditingParty(null);
      setFormData({ name: "", address: "", contact: "", email: "", gst: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingParty) {
        const response = await partiesApi.update(editingParty._id, formData);
        setParties(parties.map(p => p._id === editingParty._id ? response.data : p));
        toast.success("Party updated successfully");
      } else {
        const response = await partiesApi.create(formData);
        setParties([...parties, response.data]);
        toast.success("Party added successfully");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to save party");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this party?")) {
      try {
        await partiesApi.delete(id);
        setParties(parties.filter(p => p._id !== id));
        toast.success("Party deleted successfully");
      } catch (err) {
        toast.error("Failed to delete party");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Parties Management</h2>
            <p className="text-muted-foreground">Manage your business parties and contacts</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenModal()} variant="gold">
                <Plus className="w-4 h-4 mr-2" />
                Add Party
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingParty ? "Edit Party" : "Add New Party"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <Input
                  label="Party Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
                <Input
                  label="Contact Number"
                  type="tel"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="GST Number (Optional)"
                  value={formData.gst}
                  onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                />
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {editingParty ? (submitting ? "Updating..." : "Update") : (submitting ? "Adding..." : "Add")} Party
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card variant="flat">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search parties by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Parties Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParties.map((party, index) => (
              <Card 
                key={party._id} 
                variant="elevated" 
                className="hover-lift animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(party)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(party._id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{party.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">{party.address}</p>
                    <p className="text-muted-foreground">{party.contact}</p>
                    <p className="text-muted-foreground">{party.email}</p>
                    {party.gst && (
                      <p className="text-xs text-accent font-medium mt-2">GST: {party.gst}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredParties.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No parties found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminParties;
