"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const storeSettingsSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  storeEmail: z.string().email("Invalid email address"),
  storePhone: z.string().optional(),
  storeAddress: z.string().optional(),
  currency: z.string(),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  lowStockAlerts: z.boolean(),
  orderNotifications: z.boolean(),
  marketingEmails: z.boolean(),
});

const themeSettingsSchema = z.object({
  darkMode: z.boolean(),
  accentColor: z.string(),
});

type StoreSettings = {
  storeName: string;
  storeEmail: string;
  storePhone?: string;
  storeAddress?: string;
  currency: string;
};
type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
type ThemeSettings = z.infer<typeof themeSettingsSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const storeForm = useForm<StoreSettings>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      storeName: "",
      storeEmail: "",
      storePhone: "",
      storeAddress: "",
      currency: "ZAR",
    },
  });

  const notificationForm = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      lowStockAlerts: true,
      orderNotifications: true,
      marketingEmails: false,
    },
  });

  const themeForm = useForm<ThemeSettings>({
    resolver: zodResolver(themeSettingsSchema),
    defaultValues: {
      darkMode: false,
      accentColor: "#000000",
    },
  });

  const onStoreSubmit = async (data: StoreSettings) => {
    setIsLoading(true);
    try {
      // TODO: Add API call to save store settings
      console.log("Store settings:", data);
      toast.success("Store settings updated successfully");
    } catch (error) {
      toast.error("Failed to update store settings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onNotificationSubmit = async (data: NotificationSettings) => {
    setIsLoading(true);
    try {
      // TODO: Add API call to save notification settings
      console.log("Notification settings:", data);
      toast.success("Notification settings updated successfully");
    } catch (error) {
      toast.error("Failed to update notification settings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onThemeSubmit = async (data: ThemeSettings) => {
    setIsLoading(true);
    try {
      // TODO: Add API call to save theme settings
      console.log("Theme settings:", data);
      toast.success("Theme settings updated successfully");
    } catch (error) {
      toast.error("Failed to update theme settings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your store settings and preferences
        </p>
      </div>

      <Tabs defaultValue="store" className="space-y-4">
        <TabsList>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <form onSubmit={storeForm.handleSubmit(onStoreSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>
                  Update your store&apos;s basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    {...storeForm.register("storeName")}
                    placeholder="Enter store name"
                  />
                  {storeForm.formState.errors.storeName && (
                    <p className="text-sm text-red-500">
                      {storeForm.formState.errors.storeName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    {...storeForm.register("storeEmail")}
                    placeholder="Enter store email"
                  />
                  {storeForm.formState.errors.storeEmail && (
                    <p className="text-sm text-red-500">
                      {storeForm.formState.errors.storeEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storePhone">Store Phone</Label>
                  <Input
                    id="storePhone"
                    {...storeForm.register("storePhone")}
                    placeholder="Enter store phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Store Address</Label>
                  <Input
                    id="storeAddress"
                    {...storeForm.register("storeAddress")}
                    placeholder="Enter store address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    {...storeForm.register("currency")}
                    placeholder="Enter currency code"
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="notifications">
          <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage your notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    {...notificationForm.register("emailNotifications")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="lowStockAlerts">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when products are running low on stock
                    </p>
                  </div>
                  <Switch
                    id="lowStockAlerts"
                    {...notificationForm.register("lowStockAlerts")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="orderNotifications">Order Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for new orders
                    </p>
                  </div>
                  <Switch
                    id="orderNotifications"
                    {...notificationForm.register("orderNotifications")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive marketing and promotional emails
                    </p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    {...notificationForm.register("marketingEmails")}
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="theme">
          <form onSubmit={themeForm.handleSubmit(onThemeSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>
                  Customize your store&apos;s appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable dark mode for your store
                    </p>
                  </div>
                  <Switch
                    id="darkMode"
                    {...themeForm.register("darkMode")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      {...themeForm.register("accentColor")}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      {...themeForm.register("accentColor")}
                      className="flex-1"
                      placeholder="Enter hex color code"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
} 