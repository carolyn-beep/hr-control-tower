import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: any;
  personName: string;
}

export const EvidenceModal = ({ isOpen, onClose, evidence, personName }: EvidenceModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Evidence for {personName}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <pre className="text-sm bg-muted p-4 rounded-md">
            {JSON.stringify(evidence, null, 2)}
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};