import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  ShoppingBag,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Clock,
  MapPin
} from "lucide-react";
import { db as prisma } from "@/lib/db";
import { format } from "date-fns";

async function getCustomerHistory() {
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          createdAt: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
              images: true,
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  });

  // Group orders by customer
  const customerMap = new Map();
  
  orders.forEach(order => {
    const customerId = order.user?.id;
    if (!customerId) return;

    if (!customerMap.has(customerId)) {
      customerMap.set(customerId, {
        id: customerId,
        firstName: order.user?.firstName,
        lastName: order.user?.lastName,
        email: order.user?.email,
        profileImage: order.user?.profileImage,
        joinedAt: order.user?.createdAt,
        orders: [],
        totalSpent: 0,
        totalOrders: 0,
        lastOrderDate: null,
      });
    }

    const customer = customerMap.get(customerId);
    customer.orders.push(order);
    customer.totalSpent += order.amount;
    customer.totalOrders += 1;
    
    if (!customer.lastOrderDate || order.createdAt > customer.lastOrderDate) {
      customer.lastOrderDate = order.createdAt;
    }
  });

  return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}

export default async function CustomersHistoryPage() {
  const customers = await getCustomerHistory();

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const avgOrderValue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0) / 
                       customers.reduce((sum, customer) => sum + customer.totalOrders, 0) || 0;
  const repeatCustomers = customers.filter(customer => customer.totalOrders > 1).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer History</h1>
          <p className="text-muted-foreground">
            Comprehensive view of customer purchase history and behavior
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{(totalRevenue / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{(avgOrderValue / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Customers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repeatCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {((repeatCustomers / totalCustomers) * 100).toFixed(1)}% retention rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search customers by name or email..." 
            className="pl-10"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Order Count" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="new">New Customers</SelectItem>
            <SelectItem value="returning">Returning Customers</SelectItem>
            <SelectItem value="vip">VIP Customers (5+ orders)</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="recent">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent Activity</SelectItem>
            <SelectItem value="spending">Total Spending</SelectItem>
            <SelectItem value="orders">Order Count</SelectItem>
            <SelectItem value="joined">Join Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Customer Cards Grid */}
          {customers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Start by creating some orders to see customer history and analytics here.
                </p>
              </CardContent>
            </Card>
          ) : (            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.slice(0, 12).map((customer) => (
                <Card key={customer.id} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-border/50 hover:border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12 ring-2 ring-purple-500/20">
                        <AvatarImage src={customer.profileImage || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                          {customer.firstName?.[0]}{customer.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate text-foreground">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Orders</p>
                      <p className="font-semibold">{customer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Spent</p>
                      <p className="font-semibold">R{(customer.totalSpent / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {format(new Date(customer.joinedAt), 'MMM dd, yyyy')}</span>
                  </div>
                  
                  {customer.lastOrderDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Last order {format(new Date(customer.lastOrderDate), 'MMM dd, yyyy')}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {customer.totalOrders === 1 && (
                      <Badge variant="secondary">New Customer</Badge>
                    )}
                    {customer.totalOrders >= 2 && customer.totalOrders < 5 && (
                      <Badge variant="default">Returning</Badge>
                    )}
                    {customer.totalOrders >= 5 && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">VIP</Badge>
                    )}
                  </div>

                  <Button variant="outline" size="sm" className="w-full group hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300">
                    <Eye className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          {/* Detailed Table View */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Purchase History</CardTitle>
              <CardDescription>
                Detailed view of all customer transactions and order history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.slice(0, 20).map((customer) => (
                  <div key={customer.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={customer.profileImage || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {customer.firstName?.[0]}{customer.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">
                            {customer.firstName} {customer.lastName}
                          </h4>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">R{(customer.totalSpent / 100).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{customer.totalOrders} orders</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-2">
                        <h5 className="font-medium">Recent Orders</h5>
                        {customer.orders.slice(0, 3).map((order: any) => (
                          <div key={order.id} className="flex justify-between">
                            <span>#{order.id.slice(-6)}</span>
                            <span>R{(order.amount / 100).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium">Order Status</h5>
                        {customer.orders.slice(0, 3).map((order: any) => (
                          <div key={order.id} className="flex justify-between">
                            <span>{format(new Date(order.createdAt), 'MMM dd')}</span>
                            <Badge variant={order.status === 'shipped' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium">Top Categories</h5>
                        {customer.orders.slice(0, 3).map((order: any) => (
                          <div key={order.id}>
                            {order.items.slice(0, 1).map((item: any) => (
                              <div key={item.id} className="text-muted-foreground">
                                {item.product?.category || 'General'}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>New Customers (1 order)</span>
                    <Badge variant="secondary">
                      {customers.filter(c => c.totalOrders === 1).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Returning Customers (2-4 orders)</span>
                    <Badge variant="default">
                      {customers.filter(c => c.totalOrders >= 2 && c.totalOrders < 5).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>VIP Customers (5+ orders)</span>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                      {customers.filter(c => c.totalOrders >= 5).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Spenders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customers.slice(0, 5).map((customer, index) => (
                    <div key={customer.id} className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={customer.profileImage || ''} />
                        <AvatarFallback className="text-xs">
                          {customer.firstName?.[0]}{customer.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          R{(customer.totalSpent / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
