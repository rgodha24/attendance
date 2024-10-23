import { Class } from "@/routes/home";
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
import { Loader2, MinusCircle, PencilIcon, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { DialogOverlay } from "@radix-ui/react-dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "./ui/use-toast";
import { scannerNameAtom, selectedClassAtom } from "@/lib/atoms";
import { uidAtom } from "@/token";
import { redirect } from "@tanstack/react-router";
import { Badge } from "./ui/badge";
import { EditClass } from "@/routes/editClass";

export const ScannerSelect: FC<{ scanners: string[] }> = ({ scanners }) => {
  const [scannerName, setScannerName] = useAtom(scannerNameAtom);
  const [uid] = useAtom(uidAtom);
  const connectedScanners = trpc.scanner.connected.useQuery(undefined, {
    initialData: [],
  });
  const [selectOpen, setSelectOpen] = useState(false);

  if (!uid) {
    redirect({ to: "/login", replace: true });
    return;
  }
  return (
    <Dialog>
      <Select
        onValueChange={(name) => {
          setScannerName(name);
        }}
        open={selectOpen}
        onOpenChange={setSelectOpen}
      >
        <SelectTrigger>
          <SelectValue>
            {scannerName ? (
              <>
                {scannerName}{" "}
                {
                  <Badge
                    variant={
                      connectedScanners.data.includes(scannerName)
                        ? "default"
                        : "secondary"
                    }
                    className="ml-2"
                  >
                    {connectedScanners.data.includes(scannerName)
                      ? "connected"
                      : "disconnected"}
                  </Badge>
                }{" "}
              </>
            ) : (
              "Select a scanner"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="flex flex-row justify-between items-center">
              <h3 className="font-medium text-md">Scanners: </h3>
              <DialogTrigger onClick={() => setSelectOpen(false)}>
                <Button
                  variant="outline"
                  type="button"
                  size="icon"
                  className="rounded-full group"
                >
                  <PlusCircle className="w-4 h-4 dark:group-hover:stroke-green-400 group-hover:stroke-green-600" />
                </Button>
              </DialogTrigger>
            </SelectLabel>
            {scanners.map((scanner) => {
              const isConnected = connectedScanners.data.includes(scanner);
              return (
                <SelectItem key={scanner} value={scanner} className="">
                  {scanner}
                  <Badge
                    variant={isConnected ? "default" : "secondary"}
                    className="ml-2"
                  >
                    {isConnected ? "connected" : "disconnected"}
                  </Badge>
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
      <DialogOverlay>
        <DialogContent className="flex flex-row justify-center">
          <div className="flex flex-col aspect-square max-w-40% p-8">
            <img
              src={
                "https://api.qrserver.com/v1/create-qr-code?" +
                new URLSearchParams({
                  data: "https://barcodeapi.org/api/128/" + uid.toString(36),
                  size: "300x300",
                })
              }
              alt="qrcode"
            />
            <p className="text-center">
              scan this qrcode on your phone, then scan the barcode it generates
              on the scanner to connect to it
            </p>
            {import.meta.env.DEV && <p>{uid.toString(36)}</p>}
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
};

export const ClassSelect: FC<{ classes: Class[] }> = ({ classes }) => {
  const [selectedClass, setSelectedClass] = useAtom(selectedClassAtom);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [dialogStyle, setDialogStyle] = useState<"add" | "del" | "edit">("add");
  const [classIndex, setClassIndex] = useState<number>(0);
  const [delClass, setDelClass] = useState<Class>();

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Select
          onValueChange={(name) => {
            setSelectedClass(classes.find((class_) => class_.classID === name));
          }}
          open={selectOpen}
          onOpenChange={setSelectOpen}
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
                    onClick={() => {
                      setDialogStyle("add");
                      setSelectOpen(false);
                    }}
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
                    <>
                      <DialogTrigger>
                        <Button
                          variant="outline"
                          type="button"
                          size="icon"
                          className="rounded-full group"
                          onClick={() => {
                            setDialogStyle("edit");
                            setClassIndex(i);
                            setSelectOpen(false);
                          }}
                        >
                          <PencilIcon className="w-4 h-4 dark:group-hover:stroke-blue-400 group-hover:stroke-blue-600" />
                        </Button>
                      </DialogTrigger>
                      <DialogTrigger>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setDialogStyle("del");
                            setDelClass(classes[i]);
                            setSelectOpen(false);
                          }}
                          className="rounded-full group"
                        >
                          <MinusCircle className="w-4 h-4 dark:group-hover:stroke-red-400 group-hover:stroke-red-600" />
                        </Button>
                      </DialogTrigger>
                    </>
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
              <AddClass onSuccess={() => setDialogOpen(false)} />
            ) : dialogStyle === "del" ? (
              <DeleteClass
                onSuccess={() => setDialogOpen(false)}
                {...delClass!}
              />
            ) : dialogStyle === "edit" ? (
              <EditClass
                onSuccess={() => setDialogOpen(false)}
                old={classes[classIndex]}
              />
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
  const utils = trpc.useUtils();
  const [selectedClass, setSelectedClass] = useAtom(selectedClassAtom);
  const deleteClass = trpc.class.delete.useMutation({
    onSuccess: () => {
      toast({
        title: `Class deleted successfully!`,
        description: `Class ${name} was deleted successfully!`,
      });
      onSuccess();
      utils.class.getAll.refetch();
      if (selectedClass?.classID === classID) {
        setSelectedClass(undefined);
      }
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
