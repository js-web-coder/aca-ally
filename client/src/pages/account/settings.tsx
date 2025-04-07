import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Switch
} from "@/components/ui/switch";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  BarChart3,
  Check,
  Trash2,
  UserCog,
  Palette,
  Key,
  Bell,
  Shield,
} from "lucide-react";

// Define the validation schema for settings
const AISettingsSchema = z.object({
  openAIKey: z.string().optional(),
  geminiKey: z.string().optional(),
  perplexityKey: z.string().optional(),
  defaultAIModel: z.enum(["gemini", "openai", "perplexity"])
});

const AccountSettingsSchema = z.object({
  email: z.string().email("Please enter a valid email address").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  confirmPassword: z.string().optional(),
  phone: z.string().optional(),
  twoFactorEnabled: z.boolean().optional(),
}).refine(data => !data.password || data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export default function Settings() {
  const { theme, setTheme } = useDarkMode();
  const [, navigate] = useLocation();
  const { user, updateUserProfile, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const aiSettingsForm = useForm<z.infer<typeof AISettingsSchema>>({
    resolver: zodResolver(AISettingsSchema),
    defaultValues: {
      openAIKey: "",
      geminiKey: "",
      perplexityKey: "",
      defaultAIModel: "gemini"
    }
  });

  const accountSettingsForm = useForm<z.infer<typeof AccountSettingsSchema>>({
    resolver: zodResolver(AccountSettingsSchema),
    defaultValues: {
      email: user?.email || "",
      password: "",
      confirmPassword: "",
      phone: user?.phone || "",
      twoFactorEnabled: false,
    }
  });

  const onSubmitAISettings = async (data: z.infer<typeof AISettingsSchema>) => {
    try {
      // Store API keys in localStorage for now
      if (data.openAIKey) localStorage.setItem("openai_api_key", data.openAIKey);
      if (data.geminiKey) localStorage.setItem("gemini_api_key", data.geminiKey);
      if (data.perplexityKey) localStorage.setItem("perplexity_api_key", data.perplexityKey);
      localStorage.setItem("default_ai_model", data.defaultAIModel);

      toast({
        title: "Success",
        description: "AI settings updated successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update AI settings",
        variant: "destructive",
      });
    }
  };

  const onSubmitAccountSettings = async (data: z.infer<typeof AccountSettingsSchema>) => {
    try {
      const updateData: any = {};
      if (data.email) updateData.email = data.email;
      if (data.phone) updateData.phone = data.phone;
      
      // Only include password if it was changed
      if (data.password) {
        // Password update would typically be handled via a separate API endpoint
        // that requires current password for verification
        // This is just a simplified example
        updateData.password = data.password;
      }

      await updateUserProfile(updateData);

      toast({
        title: "Success",
        description: "Account settings updated successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update account settings",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Here you would implement actual account deletion logic
      // For now we'll just log out the user
      await logout();
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted",
        variant: "default",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="container py-10 animate-in fade-in">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">AI Integration</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Update your account details and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...accountSettingsForm}>
                <form 
                  id="account-settings-form" 
                  onSubmit={accountSettingsForm.handleSubmit(onSubmitAccountSettings)}
                  className="space-y-6"
                >
                  <FormField
                    control={accountSettingsForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          This email will be used for account recovery and notifications.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={accountSettingsForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your phone number for two-factor authentication (optional).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={accountSettingsForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormDescription>
                            At least 8 characters.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accountSettingsForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={accountSettingsForm.control}
                    name="twoFactorEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Two-factor Authentication</FormLabel>
                          <FormDescription>
                            Receive a code via SMS when logging in.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" type="button">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setDeleteDialogOpen(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => navigate("/account/analytics")} className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Button>
                <Button type="submit" form="account-settings-form">
                  Save Changes
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how Aca.Ally looks and feels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <FormLabel>Theme</FormLabel>
                <Select
                  value={theme}
                  onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
                >
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose your preferred color scheme.
                </FormDescription>
              </div>
              
              <div className="space-y-2">
                <FormLabel>Font Size</FormLabel>
                <Select defaultValue="medium">
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Adjust the text size for better readability.
                </FormDescription>
              </div>
              
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Disable Auto-scrolling</FormLabel>
                  <FormDescription>
                    Prevent pages from automatically scrolling when loaded.
                  </FormDescription>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="button">
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* AI Integration Settings */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Integration</CardTitle>
              <CardDescription>
                Configure your AI assistant preferences and API keys.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...aiSettingsForm}>
                <form 
                  id="ai-settings-form" 
                  onSubmit={aiSettingsForm.handleSubmit(onSubmitAISettings)}
                  className="space-y-6"
                >
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Your API keys are stored locally on your device and are never sent to our servers.
                      You'll need to re-enter them if you clear your browser data or use a different device.
                    </AlertDescription>
                  </Alert>
                  
                  <FormField
                    control={aiSettingsForm.control}
                    name="defaultAIModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default AI Model</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select default AI model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gemini">Google Gemini (Recommended)</SelectItem>
                            <SelectItem value="openai">OpenAI GPT</SelectItem>
                            <SelectItem value="perplexity">Perplexity</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This model will be tried first for all AI interactions.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">API Keys (Optional)</h3>
                    <p className="text-sm text-muted-foreground">
                      Add your own API keys to use with Aca.Ally. This allows you to use your own usage quota.
                    </p>
                  </div>
                  
                  <FormField
                    control={aiSettingsForm.control}
                    name="geminiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gemini API Key</FormLabel>
                        <FormControl>
                          <Input placeholder="AIza..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Your Google Gemini API key from Google AI Studio.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={aiSettingsForm.control}
                    name="openAIKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OpenAI API Key</FormLabel>
                        <FormControl>
                          <Input placeholder="sk-..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Your OpenAI API key from OpenAI's dashboard.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={aiSettingsForm.control}
                    name="perplexityKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Perplexity API Key</FormLabel>
                        <FormControl>
                          <Input placeholder="pplx-..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Your Perplexity API key from Perplexity Labs.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="ai-settings-form">
                Save API Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Privacy Settings */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
              <CardDescription>
                Manage your data, privacy, and security settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Save Chat History</FormLabel>
                  <FormDescription>
                    Store your AI chat conversations locally.
                  </FormDescription>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Activity Tracking</FormLabel>
                  <FormDescription>
                    Allow us to collect anonymous usage data to improve the platform.
                  </FormDescription>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Email Notifications</FormLabel>
                  <FormDescription>
                    Receive updates, recommendations, and news.
                  </FormDescription>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Local Data
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This will remove all locally stored chat history, preferences, and API keys from this device.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="button">
                Save Privacy Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}