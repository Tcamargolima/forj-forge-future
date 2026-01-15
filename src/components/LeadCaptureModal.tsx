import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const INTERESTS = [
  { id: "new_face", label: "New Face" },
  { id: "casting", label: "Casting" },
  { id: "courses", label: "Courses" },
];

const leadSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),
  country: z.string().min(1, "Please select your country"),
  age: z
    .number({ invalid_type_error: "Age is required" })
    .min(13, "Must be at least 13 years old")
    .max(120, "Please enter a valid age"),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadCaptureModal({ open, onOpenChange }: LeadCaptureModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      full_name: "",
      email: "",
      country: "",
      age: undefined,
      interests: [],
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        full_name: data.full_name.trim(),
        email: data.email.trim().toLowerCase(),
        country: data.country,
        age: data.age,
        interests: data.interests,
      });

      if (error) throw error;

      // Mark as submitted in localStorage
      localStorage.setItem("leadFormSubmitted", "true");
      
      setIsSuccess(true);
      form.reset();
      
      setTimeout(() => {
        setIsSuccess(false);
        onOpenChange(false);
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsSuccess(false);
      form.reset();
      onOpenChange(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-display mb-2">
              Application Submitted!
            </DialogTitle>
            <DialogDescription className="text-base">
              Thank you for your interest. We'll be in touch soon!
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-display tracking-wide">
            Join Our Community
          </DialogTitle>
          <DialogDescription className="text-base">
            Fill in your details to start your journey with FORJ
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your full name"
                      className="rounded-xl"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      className="rounded-xl"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 25"
                        className="rounded-xl"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : undefined
                          )
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="interests"
              render={() => (
                <FormItem>
                  <FormLabel>Areas of Interest</FormLabel>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {INTERESTS.map((interest) => (
                      <FormField
                        key={interest.id}
                        control={form.control}
                        name="interests"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(interest.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, interest.id]);
                                  } else {
                                    field.onChange(
                                      current.filter((i) => i !== interest.id)
                                    );
                                  }
                                }}
                                disabled={isSubmitting}
                                className="rounded"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {interest.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
