import { useEffect, useState } from "react";
import { Users, FileText, Clock, CheckCircle, Plus, ArrowUpRight, TrendingUp, Loader2, CloudUpload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { chequesApi, adminApi } from "@/api/api";
import { toast } from "sonner";
import { format } from "date-fns";

// Mock data removed to use real API

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await chequesApi.getStats();
      setDashboardData(response.data);
    } catch (err) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      setBackingUp(true);
      const response = await adminApi.triggerBackup();
      toast.success(response.data.message || "Backup completed successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to initiate backup");
    } finally {
      setBackingUp(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const statsCards = [
    { 
      title: "Total Parties", 
      value: dashboardData?.stats.totalParties || 0, 
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    { 
      title: "Total Cheques", 
      value: dashboardData?.stats.totalCheques || 0, 
      icon: FileText,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    { 
      title: "Pending Deposits", 
      value: dashboardData?.stats.pendingDeposits || 0, 
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    { 
      title: "Cleared Cheques", 
      value: dashboardData?.stats.clearedCheques || 0, 
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10"
    },
  ];

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Welcome back!</h2>
            <p className="text-muted-foreground">Here's an overview of your business</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleBackup} variant="outline" disabled={backingUp} className="border-primary/20 hover:bg-primary/5">
              {backingUp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CloudUpload className="w-4 h-4 mr-2 text-primary" />}
              {backingUp ? "Backing up..." : "Backup to Cloud"}
            </Button>
            <Button onClick={() => navigate("/admin/parties")} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Party
            </Button>
            <Button onClick={() => navigate("/admin/cheques")} variant="gold">
              <Plus className="w-4 h-4 mr-2" />
              Add Cheque
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <Card 
              key={stat.title} 
              variant="elevated" 
              className="hover-lift animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Cheques */}
          <Card variant="elevated" className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Recent Cheques</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/cheques")}>
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Party</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {dashboardData?.recentCheques.map((cheque: any) => (
                      <tr key={cheque._id} className="hover:bg-muted/50 transition-colors">
                        <td className="py-4 text-sm font-medium text-foreground">{cheque.partyId?.name || "N/A"}</td>
                        <td className="py-4 text-sm text-foreground">₹{cheque.amount.toLocaleString()}</td>
                        <td className="py-4 text-sm text-muted-foreground">{format(new Date(cheque.depositDate), 'dd MMM yyyy')}</td>
                        <td className="py-4">{getStatusBadge(cheque.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deposits */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Upcoming Deposits</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/reminders")}>
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.upcomingDeposits.map((deposit: any, index: number) => {
                const daysLeft = Math.ceil((new Date(deposit.depositDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      daysLeft <= 3 
                        ? "bg-warning/5 border-warning/20" 
                        : "bg-muted/50 border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-foreground text-sm">{deposit.partyId?.name || "N/A"}</p>
                      <span className={`text-xs font-medium ${
                        daysLeft <= 3 ? "text-warning" : "text-muted-foreground"
                      }`}>
                        {daysLeft <= 0 ? "Due today" : `${daysLeft} days left`}
                      </span>
                    </div>
                    <p className="text-lg font-display font-semibold text-foreground">
                      ₹{deposit.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Due: {format(new Date(deposit.depositDate), 'dd MMM yyyy')}</p>
                  </div>
                );
              })}
              {dashboardData?.upcomingDeposits.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No upcoming deposits</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
