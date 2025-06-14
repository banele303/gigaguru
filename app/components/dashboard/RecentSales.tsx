import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/app/lib/utils";

export type OrderWithUser = {
  id: string;
  amount: number;
  user: {
    firstName: string;
    profileImage: string;
    email: string;
  } | null;
};

export function RecentSales({ data }: { data: OrderWithUser[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent sales</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent sales found.</p>
        ) : (
          data.map((item: OrderWithUser) => (
            <div className="flex items-center gap-4" key={item.id}>
              <Avatar className="hidden sm:flex h-9 w-9">
                <AvatarImage src={item.user?.profileImage} alt="Avatar Image" />
                <AvatarFallback>
                  {item.user?.firstName?.slice(0, 3) || "..."}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium">{item.user?.firstName || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">
                  {item.user?.email || "No email"}
                </p>
              </div>
              <p className="ml-auto font-medium">
                {formatPrice(item.amount / 100)}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
