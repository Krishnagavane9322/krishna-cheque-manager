import { useEffect, useState } from "react";
import { Search, Bell, AlertTriangle, Clock, CheckCircle, Calendar, Filter, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/AdminLayout";
import { chequesApi } from "@/api/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface Reminder {
  _id: string;
  chequeNumber: string;
  partyId: {
    _id: string;
    name: string;
  };
  amount: number;
  depositDate: string;
  daysLeft: number;
  status: "overdue" | "due-today" | "upcoming" | "cleared";
}

// Mock data removed to use real API

const AdminReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await chequesApi.getReminders();
      setReminders(response.data);
    } catch (err) {
      toast.error("Failed to fetch reminders");
    } finally {
      setLoading(false);
    }
  };

  const filterReminders = (status?: string) => {
    let filtered = reminders;
    
    if (status && status !== "all") {
      if (status === "next-3-days") {
        filtered = reminders.filter(r => r.status === "upcoming" && r.daysLeft <= 3);
      } else {
        filtered = reminders.filter(r => r.status === status);
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.partyId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.chequeNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "overdue":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case "due-today":
        return <Bell className="w-5 h-5 text-warning" />;
      case "upcoming":
        return <Clock className="w-5 h-5 text-primary" />;
      case "cleared":
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string, daysLeft: number) => {
    switch (status) {
      case "overdue":
        return <span className="text-destructive font-medium">{Math.abs(daysLeft)} days overdue</span>;
      case "due-today":
        return <span className="text-warning font-medium">Due today</span>;
      case "upcoming":
        return <span className="text-muted-foreground">{daysLeft} days left</span>;
      case "cleared":
        return <span className="text-success font-medium">Cleared</span>;
      default:
        return null;
    }
  };

  const overdueCount = reminders.filter(r => r.status === "overdue").length;
  const dueTodayCount = reminders.filter(r => r.status === "due-today").length;
  const upcomingCount = reminders.filter(r => r.status === "upcoming").length;
  const next3DaysCount = reminders.filter(r => r.status === "upcoming" && r.daysLeft <= 3).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Cheque Reminders</h2>
            <p className="text-muted-foreground">Track deposit dates and overdue cheques</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            variant="elevated" 
            className={`cursor-pointer transition-all ${activeTab === "overdue" ? "ring-2 ring-destructive" : "hover-lift"}`}
            onClick={() => setActiveTab("overdue")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-3xl font-display font-bold text-destructive">{overdueCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            variant="elevated" 
            className={`cursor-pointer transition-all ${activeTab === "due-today" ? "ring-2 ring-warning" : "hover-lift"}`}
            onClick={() => setActiveTab("due-today")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Due Today</p>
                  <p className="text-3xl font-display font-bold text-warning">{dueTodayCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            variant="elevated" 
            className={`cursor-pointer transition-all ${activeTab === "next-3-days" ? "ring-2 ring-accent" : "hover-lift"}`}
            onClick={() => setActiveTab("next-3-days")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next 3 Days</p>
                  <p className="text-3xl font-display font-bold text-accent">{next3DaysCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            variant="elevated" 
            className={`cursor-pointer transition-all ${activeTab === "upcoming" ? "ring-2 ring-primary" : "hover-lift"}`}
            onClick={() => setActiveTab("upcoming")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">All Upcoming</p>
                  <p className="text-3xl font-display font-bold text-primary">{upcomingCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Tabs */}
        <Card variant="flat">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by party or cheque number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-5 w-full sm:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="overdue" className="text-destructive">Overdue</TabsTrigger>
                  <TabsTrigger value="due-today">Today</TabsTrigger>
                  <TabsTrigger value="next-3-days">3 Days</TabsTrigger>
                  <TabsTrigger value="cleared">Cleared</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Reminders List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {filterReminders(activeTab).map((reminder, index) => (
              <Card 
                key={reminder._id}
                variant="elevated"
                className={`animate-fade-up ${
                  reminder.status === "overdue" ? "border-l-4 border-l-destructive" :
                  reminder.status === "due-today" ? "border-l-4 border-l-warning" :
                  reminder.status === "upcoming" && reminder.daysLeft <= 3 ? "border-l-4 border-l-accent" :
                  ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        {getStatusIcon(reminder.status)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{reminder.partyId?.name || "N/A"}</p>
                        <p className="text-sm text-muted-foreground font-mono">{reminder.chequeNumber}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                      <div className="text-left sm:text-right">
                        <p className="text-lg font-display font-semibold text-foreground">
                          ₹{reminder.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Deposit: {format(new Date(reminder.depositDate), 'dd MMM yyyy')}</p>
                      </div>
                      <div className="sm:w-32 sm:text-right">
                        {getStatusLabel(reminder.status, reminder.daysLeft)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filterReminders(activeTab).length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No reminders found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReminders;
