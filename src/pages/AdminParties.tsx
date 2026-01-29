import { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AdminLayout from "@/components/AdminLayout";

interface Party {
  id: number;
  name: string;
  address: string;
  contact: string;
  email: string;
  gst?: string;
}

const initialParties: Party[] = [
  { id: 1, name: "Sharma Textiles", address: "123 Textile Market, Mumbai", contact: "9876543210", email: "sharma@textiles.com", gst: "27AABCS1234A1ZV" },
  { id: 2, name: "Kumar Fabrics", address: "456 Fabric Lane, Delhi", contact: "9876543211", email: "kumar@fabrics.com", gst: "07AABCK5678B2ZW" },
  { id: 3, name: "Patel & Sons", address: "789 Trading Hub, Ahmedabad", contact: "9876543212", email: "patel@sons.com" },
  { id: 4, name: "Gupta Traders", address: "321 Market Street, Jaipur", contact: "9876543213", email: "gupta@traders.com", gst: "08AABCG9012C3ZX" },
  { id: 5, name: "Singh Enterprises", address: "654 Business Park, Chandigarh", contact: "9876543214", email: "singh@enterprises.com" },
];

const AdminParties = () => {
  const [parties, setParties] = useState<Party[]>(initialParties);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingParty) {
      setParties(parties.map(p => 
        p.id === editingParty.id 
          ? { ...p, ...formData } 
          : p
      ));
    } else {
      const newParty: Party = {
        id: Date.now(),
        ...formData,
      };
      setParties([...parties, newParty]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    setParties(parties.filter(p => p.id !== id));
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
                  <Button type="submit" className="flex-1">
                    {editingParty ? "Update" : "Add"} Party
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParties.map((party, index) => (
            <Card 
              key={party.id} 
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
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(party.id)} className="text-destructive hover:text-destructive">
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
