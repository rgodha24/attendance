import { Class, scannerNameAtom, selectedClassAtom } from "@/routes/home";
import { useAtom } from "jotai";
import { FC, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { AddClass } from "@/routes/addClass";
import { Button } from "./ui/button";
import { DeleteIcon, Loader2, MinusCircle, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { DialogOverlay } from "@radix-ui/react-dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "./ui/use-toast";

export const ScannerSelect: FC<{ scanners: string[] }> = ({ scanners }) => {
  const [scannerName, setScannerName] = useAtom(scannerNameAtom);
  return (
    <Select
      onValueChange={(name) => {
        setScannerName(name);
      }}
    >
      <SelectTrigger>
        <SelectValue>
          {scannerName ? scannerName : "Select a scanner"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Scanners:</SelectLabel>
          {scanners.map((scanner) => (
            <SelectItem key={scanner} value={scanner}>
              {scanner}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export const ClassSelect: FC<{ classes: Class[] }> = ({ classes }) => {
  const [selectedClass, setSelectedClass] = useAtom(selectedClassAtom);
  const [dialog, setDialog] = useState(false);
  const [dialogStyle, setDialogStyle] = useState<"add" | "del">("add");
  const [delClass, setDelClass] = useState<Class>();

  return (
    <>
      <Dialog open={dialog} onOpenChange={setDialog}>
        <Select
          onValueChange={(name) => {
            setSelectedClass(classes.find((class_) => class_.classID === name));
          }}
        >
          <SelectTrigger>
            <SelectValue>
              {selectedClass ? selectedClass.name : "Select a class"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="flex flex-row justify-between items-center">
                <h3 className="font-medium text-md">Classes: </h3>
                <DialogTrigger>
                  <Button
                    variant="outline"
                    type="button"
                    size="icon"
                    className="rounded-full group"
                    onClick={() => setDialogStyle("add")}
                  >
                    <PlusCircle className="w-4 h-4 dark:group-hover:stroke-green-400 group-hover:stroke-green-600" />
                  </Button>
                </DialogTrigger>
              </SelectLabel>
              {classes.map((class_, i) => (
                <SelectItem
                  key={class_.classID}
                  value={class_.classID}
                  after={
                    <div className="py-1">
                      <DialogTrigger>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setDialogStyle("del");
                            setDelClass(classes[i]);
                          }}
                          className="rounded-full group"
                        >
                          <MinusCircle className="w-4 h-4 dark:group-hover:stroke-red-400 group-hover:stroke-red-600" />
                        </Button>
                      </DialogTrigger>
                    </div>
                  }
                >
                  {class_.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <DialogOverlay>
          <DialogContent>
            {dialogStyle === "add" ? (
              <AddClass onSuccess={() => setDialog(false)} />
            ) : dialogStyle === "del" ? (
              <DeleteClass onSuccess={() => setDialog(false)} {...delClass!} />
            ) : null}
          </DialogContent>
        </DialogOverlay>
      </Dialog>
    </>
  );
};

const DeleteClass: FC<Class & { onSuccess: () => void }> = ({
  classID,
  name,
  onSuccess,
}) => {
  const utils = trpc.useContext();
  const deleteClass = trpc.class.delete.useMutation({
    onSuccess: () => {
      toast({
        title: `Class deleted successfully!`,
        description: `Class ${name} was deleted successfully!`,
      });
      onSuccess();
      utils.class.getAll.refetch();
    },
  });

  return (
    <div>
      <Button
        variant="destructive"
        size="lg"
        onClick={() => deleteClass.mutate({ classID })}
        disabled={deleteClass.isLoading}
      >
        {deleteClass.isLoading ? (
          <>
            <Loader2 className="mr-2 w-4 h-4 animate-spin" /> deleting...
          </>
        ) : (
          <>Delete class {`"${name}"`}?</>
        )}
      </Button>
    </div>
  );
};
