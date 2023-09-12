import { trpc } from "@/lib/trpc";
import {
  UseFieldArrayAppend,
  UseFieldArrayReturn,
  UseFormReturn,
  useFieldArray,
  useForm,
} from "react-hook-form";
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
import { InfoIcon, Loader2, MinusCircle, PlusCircle } from "lucide-react";
import { toast, useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FC, useState } from "react";
import Papa from "papaparse";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

type Form = z.infer<typeof formSchema>;

export const AddClass: FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const toast = useToast();

  const form = useForm<Form>({
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
  const utils = trpc.useContext();

  const mut = trpc.class.create.useMutation({
    onSuccess: (_data, { name, period, semester, students }) => {
      toast.toast({
        title: `Class created successfully!`,
        description: `Class ${name} was created successfully!`,
      });
      // this syntax is so ugly god damn
      onSuccess?.();
      utils.class.getAll.invalidate();

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
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="px-4 space-y-4 min-w-3/4"
        >
          <SemesterField {...form} />
          <ClassNameField {...form} />
          <PeriodField {...form} />

          <div className="flex flex-row gap-x-4 justify-between items-center">
            <h3 className="font-medium text-md">Students:</h3>
            <Popover>
              <PopoverTrigger>
                <Button variant="secondary" size="default" type="button">
                  or upload a file
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <Csv {...students} />
              </PopoverContent>
            </Popover>
          </div>

          <StudentsFields form={form} students={students} />

          <div className="flex flex-row justify-center">
            <Button size="lg" type="submit" disabled={mut.isLoading}>
              {mut.isLoading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />{" "}
                  submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

function SemesterField(form: UseFormReturn<Form>) {
  return (
    <FormField
      control={form.control}
      name="semester"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Semester</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          <FormDescription>What semester is this class in?</FormDescription>
        </FormItem>
      )}
    />
  );
}

function ClassNameField(form: UseFormReturn<Form>) {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Class Name</FormLabel>
          <FormControl>
            <Input placeholder="Honors Engineering" {...field} />
          </FormControl>
          <FormDescription>Name of the class</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function PeriodField(form: UseFormReturn<Form>) {
  return (
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
  );
}

function StudentsFields({
  form,
  students,
}: {
  form: UseFormReturn<Form>;
  students: UseFieldArrayReturn<Form, "students">;
}) {
  return (
    <ScrollArea className="w-full h-40 rounded-md border">
      <div className="flex flex-col gap-y-4 p-4">
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
                    <FormLabel>Sortable Name</FormLabel>
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
                    <FormLabel className="text-center">Student ID</FormLabel>
                    <FormControl>
                      <Input placeholder="24534" {...field} />
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
      </div>
    </ScrollArea>
  );
}

function Csv({
  append,
  remove,
  fields,
}: UseFieldArrayReturn<Form, "students">) {
  const [file, setFile] = useState<File | null>();
  return (
    <>
      <div className="flex flex-row gap-x-3 items-center w-full max-w-sm">
        <TooltipProvider>
          <Tooltip>
            <Label htmlFor="picture">CSV: </Label>
            <TooltipTrigger>
              <InfoIcon className="w-4 h-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>upload a csv WITHOUT headers/column</p>
              <p>names in the order name studentid</p>
              <a
                className="underline"
                href="https://docs.google.com/spreadsheets/d/1G3Ll24COqEmCDwv50PUlVPGX-Sw8jWSY/edit?usp=sharing&ouid=111013522637726610301&rtpof=true&sd=true"
              >
                or look at this example :)
              </a>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Input
          id="picture"
          type="file"
          onChange={(e) => setFile(e?.target?.files?.[0])}
        />
      </div>
      {file && (
        <div className="flex flex-row justify-center pt-4">
          <Button
            onClick={() => {
              Papa.parse(file as File, {
                complete: (results) => {
                  console.log(results.data);
                  const schema = z
                    .tuple([
                      z.string().min(2),
                      z.coerce.number().min(10_000).max(99_999),
                    ])
                    .transform(([name, studentID]) => ({ name, studentID }))
                    .array();

                  const parsed = schema.safeParse(results.data);
                  if (parsed.success) {
                    console.log(parsed.data);
                    if (fields.length === 1) remove(0);
                    append(parsed.data);
                  } else {
                    toast({
                      variant: "destructive",
                      title: "Error parsing CSV",
                    });
                    console.log(parsed.error);
                  }
                },
                error: () => {
                  toast({
                    variant: "destructive",
                    title: "file is not a valid csv",
                  });
                },
              });
            }}
            variant="default"
            size="lg"
          >
            upload
          </Button>
        </div>
      )}
    </>
  );
}

function getCurrentSemester() {
  // Date.getMonth is 0 based ?????? why would anyone ever want that???????
  const month = new Date().getMonth() + 1;
  if (month <= 5) return "spring";
  else if (month >= 8) return "fall";
  else return "other";
}
