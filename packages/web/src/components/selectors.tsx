import { Class, scannerNameAtom, selectedClassAtom } from "@/routes/home";
import { useAtom } from "jotai";
import { FC } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
  return (
    <>
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
            <SelectLabel>Classes: </SelectLabel>
            {classes.map((class_) => (
              <SelectItem key={class_.classID} value={class_.classID}>
                {class_.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
};
