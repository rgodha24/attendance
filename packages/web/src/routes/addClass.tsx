import { trpc } from "@/lib/trpc";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Loader2, MinusCircle, PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

export const AddClass = () => {
  const toast = useToast();
  const formSchema = z.object({
    students: z
      .object({
        email: z.string().email().optional(),
        name: z.string().min(2, "name shouldn't be empty"),
        studentID: z.coerce
          .number()
          .min(10_000, "Student ID must be 5 digits")
          .max(99_999, "Student ID must be 5 digits"),
      })
      .array(),
    semester: z.enum(["fall", "spring", "other"] as const),
    period: z.string().min(1),
    name: z.string().min(2),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      students: [{ name: "", studentID: "" as any }],
      semester: getCurrentSemester(),
      name: "",
      // TODO: when calendar integration is done, set default period
      period: "",
    },
  });

  const students = useFieldArray({ control: form.control, name: "students" });

  const mut = trpc.class.create.useMutation({
    onSuccess: (_data, { name }) => {
      toast.toast({
        title: `Class created successfully!`,
        description: `Class ${name} was created successfully!`,
      });
      form.reset();
    },
    onError: (err) => {
      toast.toast({
        variant: "destructive",
        title: "Error creating class",
        description: `There was an error creating the class on the backend: ${err.message}`,
        action: (
          <ToastAction
            altText="retry"
            onClick={() => mut.mutate(form.getValues())}
          >
            Retry
          </ToastAction>
        ),
      });
    },
  });
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
    mut.mutate(data);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 space-y-4">
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

          {students.fields.map((field, index) => {
            return (
              <div
                key={field.id}
                className="flex flex-row gap-x-4 justify-between items-end"
              >
                <FormField
                  control={form.control}
                  name={`students.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Student's Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Johnny Bronco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`students.${index}.studentID`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Student ID</FormLabel>
                      <FormControl>
                        <Input placeholder="24534" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`students.${index}.email`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Student Email (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="jbronco24@brophybroncos.org"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    students.remove(index);
                  }}
                  size="icon"
                  className="rounded-full group"
                  disabled={students.fields.length === 1}
                >
                  <MinusCircle className="w-4 h-4 dark:group-hover:stroke-red-400 group-hover:stroke-red-600" />
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    students.insert(index + 1, {
                      name: "",
                      studentID: "" as any,
                    });
                  }}
                  size="icon"
                  className="rounded-full group"
                >
                  <PlusCircle className="w-4 h-4 dark:group-hover:stroke-green-400 group-hover:stroke-green-600" />
                </Button>
              </div>
            );
          })}

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
