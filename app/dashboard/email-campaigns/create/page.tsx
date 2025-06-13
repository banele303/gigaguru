"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const campaignSchema = z.object({
  name: z.string().min(2, "Campaign name must be at least 2 characters"),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  scheduledAt: z.date().optional(),
  recipientIds: z.array(z.string()).min(1, "Please select at least one recipient"),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

interface Subscriber {
  id: string;
  email: string;
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      subject: "",
      content: "",
      recipientIds: [],
    },
  });

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const response = await fetch("/api/subscribers");
        if (!response.ok) {
          throw new Error("Failed to fetch subscribers");
        }
        const data: Subscriber[] = await response.json();
        setSubscribers(data);
      } catch (error) {
        console.error("Error fetching subscribers:", error);
        toast.error("Failed to load subscriber list");
      }
    };
    fetchSubscribers();
  }, []);

  const onSubmit = async (data: CampaignFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/email-campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create campaign");
      }

      toast.success("Campaign created successfully");
      router.push("/dashboard/email-campaigns");
    } catch (error) {
      toast.error("Failed to create campaign");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
        <p className="text-muted-foreground">
          Create a new email marketing campaign
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter campaign name" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for your campaign
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email subject" {...field} />
                    </FormControl>
                    <FormDescription>
                      The subject line that recipients will see
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter email content"
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The main content of your email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Send</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Schedule when to send the campaign
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipientIds"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Recipients</FormLabel>
                      <FormDescription>
                        Select the subscribers who will receive this campaign.
                      </FormDescription>
                    </div>
                    {subscribers.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No subscribers found. Please add subscribers first.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {subscribers.map((subscriber) => (
                          <FormField
                            key={subscriber.id}
                            control={form.control}
                            name="recipientIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={subscriber.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(subscriber.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, subscriber.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== subscriber.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {subscriber.email}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 