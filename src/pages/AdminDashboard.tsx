import { useState } from "react";
import { Users, FileText, Clock, CheckCircle, Plus, ArrowUpRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";

const statsData = [
  { 
    title: "Total Parties", 
    value: "24", 
    change: "+3 this month",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  { 
    title: "Total Cheques", 
    value: "156", 
    change: "+12 this month",
    icon: FileText,
    color: "text-accent",
    bgColor: "bg-accent/10"
  },
  { 
    title: "Pending Deposits", 
    value: "18", 
    change: "Due this week: 5",
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning/10"
  },
  { 
    title: "Cleared Cheques", 
    value: "128", 
    change: "+8 this month",
    icon: CheckCircle,
    color: "text-success",
    bgColor: "bg-success/10"
  },
];

const recentCheques = [
  { id: 1, partyName: "Sharma Textiles", amount: 45000, date: "2024-01-15", status: "pending" },
  { id: 2, partyName: "Kumar Fabrics", amount: 78500, date: "2024-01-14", status: "deposited" },
  { id: 3, partyName: "Patel & Sons", amount: 32000, date: "2024-01-13", status: "cleared" },
  { id: 4, partyName: "Gupta Traders", amount: 56000, date: "2024-01-12", status: "pending" },
  { id: 5, partyName: "Singh Enterprises", amount: 91000, date: "2024-01-11", status: "cleared" },
];

const upcomingDeposits = [
  { partyName: "Sharma Textiles", amount: 45000, dueDate: "2024-01-18", daysLeft: 3 },
  { partyName: "Gupta Traders", amount: 56000, dueDate: "2024-01-19", daysLeft: 4 },
  { partyName: "Mehta Collections", amount: 28000, dueDate: "2024-01-20", daysLeft: 5 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

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
          <div className="flex gap-3">
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
          {statsData.map((stat, index) => (
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
                <p className="text-xs text-muted-foreground mt-3">{stat.change}</p>
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
                    {recentCheques.map((cheque) => (
                      <tr key={cheque.id} className="hover:bg-muted/50 transition-colors">
                        <td className="py-4 text-sm font-medium text-foreground">{cheque.partyName}</td>
                        <td className="py-4 text-sm text-foreground">₹{cheque.amount.toLocaleString()}</td>
                        <td className="py-4 text-sm text-muted-foreground">{cheque.date}</td>
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
              {upcomingDeposits.map((deposit, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    deposit.daysLeft <= 3 
                      ? "bg-warning/5 border-warning/20" 
                      : "bg-muted/50 border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-foreground text-sm">{deposit.partyName}</p>
                    <span className={`text-xs font-medium ${
                      deposit.daysLeft <= 3 ? "text-warning" : "text-muted-foreground"
                    }`}>
                      {deposit.daysLeft} days left
                    </span>
                  </div>
                  <p className="text-lg font-display font-semibold text-foreground">
                    ₹{deposit.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Due: {deposit.dueDate}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
