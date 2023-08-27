import { trpc } from "@/lib/trpc";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const AddClass = () => {
  const toast = useToast();
  const formSchema = z.object({
    students: z
      .object({
        email: z.string().email().optional(),
        name: z.string(),
        studentID: z.number(),
      })
      .array(),
    semester: z.enum(["fall", "spring", "other"] as const),
    period: z.string().min(1),
    name: z.string().min(2),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      students: [],
      semester: getCurrentSemester(),
      name: "",
      // TODO: when calendar integration is done, set default period
      period: "",
    },
  });

  const mut = trpc.class.create.useMutation({
    onSuccess: (_data, { name }) => {
      toast.toast({
        title: `class ${name} created successfully!`,
      });
      form.reset();
    },
  });
  const onSubmit = (data: z.infer<typeof formSchema>) => mut.mutate(data);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fall">Fall semester</SelectItem>
                    <SelectItem value="spring">Spring semester</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  What semester is this class in?
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Name</FormLabel>
                <FormControl>
                  <Input placeholder="Honors Engineering" {...field} />
                </FormControl>
                <FormDescription>
                  Name of the class WITHOUT the period/semester/year
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Period</FormLabel>
                <FormControl>
                  <Input placeholder="1" {...field} />
                </FormControl>
                <FormDescription>
                  What period is this class in? doesn't have to be a number
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={mut.isLoading}>
            {mut.isLoading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" /> submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};

function getCurrentSemester() {
  // Date.getMonth is 0 based ?????? why would anyone ever want that???????
  const month = new Date().getMonth() + 1;
  if (month <= 5) return "spring";
  else if (month >= 8) return "fall";
  else return "other";
}
