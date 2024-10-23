import { trpc } from "@/lib/trpc";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { type FC } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  type Form as FormType,
  formSchema,
  getCurrentSemester,
  SemesterField,
  ClassNameField,
  PeriodField,
  StudentsFields,
  Csv,
} from "./classForm";

export const AddClass: FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const toast = useToast();

  const form = useForm<FormType>({
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
  const utils = trpc.useUtils();

  const mut = trpc.class.create.useMutation({
    onSuccess: (_data, { name }) => {
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
