import { useState, createContext, useContext, ReactNode, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  ChevronRight,
  Sun,
  Moon,
  User,
  AlertTriangle,
  Clock,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { chequesApi } from "@/api/api";
import { format } from "date-fns";
import { toast } from "sonner";

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType>({ isOpen: true, toggle: () => {} });

export const useSidebar = () => useContext(SidebarContext);

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Parties", path: "/admin/parties" },
  { icon: FileText, label: "Cheques", path: "/admin/cheques" },
  { icon: Bell, label: "Reminders", path: "/admin/reminders" },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // If no user, redirect to login
      navigate('/admin/login');
    }

    // Fetch notifications/reminders
    fetchNotifications();
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await chequesApi.getReminders();
      // Filter for important alerts (overdue or due today) and limit to 5
      const alerts = response.data
        .filter((n: any) => n.status === 'overdue' || n.status === 'due-today')
        .sort((a: any, b: any) => {
          if (a.status === 'overdue' && b.status !== 'overdue') return -1;
          if (a.status !== 'overdue' && b.status === 'overdue') return 1;
          return 0;
        })
        .slice(0, 5);
      setNotifications(alerts);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const getInitials = (name: string) => {
    if (!name) return "AD";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <SidebarContext.Provider value={{ isOpen: sidebarOpen, toggle: toggleSidebar }}>
      <div className="min-h-screen bg-background flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-0 left-0 z-50 h-screen bg-sidebar transition-all duration-300 flex flex-col",
            sidebarOpen ? "w-64 translate-x-0" : "w-0 lg:w-20 -translate-x-full lg:translate-x-0"
          )}
        >
          {/* Logo */}
          <div className="h-16 border-b border-sidebar-border flex items-center justify-between px-4">
            <Link to="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
              <img src="/logo.png" alt="KNC Logo" className="w-10 h-10 object-contain" />
              <span className={cn(
                "font-display text-lg font-semibold text-sidebar-foreground whitespace-nowrap transition-opacity",
                sidebarOpen ? "opacity-100" : "lg:opacity-0"
              )}>
                Krishna Nagesh Collection
              </span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 py-6 px-3 space-y-2 overflow-hidden">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className={cn(
                    "whitespace-nowrap transition-opacity",
                    sidebarOpen ? "opacity-100" : "lg:opacity-0"
                  )}>
                    {item.label}
                  </span>
                  {isActive && sidebarOpen && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-sidebar-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 w-full"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className={cn(
                "whitespace-nowrap transition-opacity",
                sidebarOpen ? "opacity-100" : "lg:opacity-0"
              )}>
                Logout
              </span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="h-16 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar}
                className="text-foreground"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="font-display text-xl font-semibold text-foreground hidden sm:block">
                {navItems.find(item => item.path === location.pathname)?.label || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleDarkMode}
                className="text-foreground"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              
              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground relative">
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {notifications.length > 0 && (
                      <span className="text-xs font-normal text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                        {notifications.length} Priority
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-auto">
                    {loadingNotifications ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notif: any) => (
                        <DropdownMenuItem 
                          key={notif._id} 
                          className="p-3 cursor-pointer"
                          onClick={() => navigate('/admin/reminders')}
                        >
                          <div className="flex gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                              notif.status === 'overdue' ? "bg-destructive/10" : "bg-warning/10"
                            )}>
                              {notif.status === 'overdue' ? (
                                <AlertTriangle className="w-4 h-4 text-destructive" />
                              ) : (
                                <Clock className="w-4 h-4 text-warning" />
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-sm font-medium leading-none truncate">{notif.partyId?.name || "Multiple Cheques"}</p>
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                ₹{notif.amount.toLocaleString()} - {notif.status === 'overdue' ? 'Overdue' : 'Due Today'}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No urgent notifications
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="justify-center text-primary font-medium p-2"
                    onClick={() => navigate('/admin/reminders')}
                  >
                    View all reminders
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity">
                      <span className="text-primary-foreground font-semibold text-sm">
                        {user ? getInitials(user.name) : "AD"}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || "Admin"}</p>
                      <p className="text-xs leading-none text-muted-foreground">@{user?.adminId || "admin"}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/reminders')}>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Reminders</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default AdminLayout;
