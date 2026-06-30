import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

import Button from "./ui/Button";

type ModifyPanelProps = {
  isOpen: boolean;
  isProcessing: boolean;
  onClose: () => void;
  onSubmit: (instruction: string) => void;
};

const QUICK_PRESETS = [
  "Add a couch near the left side of the room",
  "Remove the table in the center",
  "Add a small coffee table in front of the sofa",
  "Add a bookshelf on the wall beside the window",
];

const ModifyPanel = ({
  isOpen,
  isProcessing,
  onClose,
  onSubmit,
}: ModifyPanelProps) => {
  const [instruction, setInstruction] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setInstruction("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modify-panel-backdrop" role="dialog" aria-modal="true">
      <div className="modify-panel">
        <div className="modify-panel-header">
          <div>
            <p className="modify-panel-eyebrow">Post-generation edits</p>
            <h3>Ask for a design change</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="close-btn">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <p className="modify-panel-copy">
          Describe an addition or removal, and Roomify will try to apply it to
          the current render.
        </p>

        <div className="modify-preset-row">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className="modify-preset-btn"
              onClick={() => setInstruction(preset)}
            >
              {preset}
            </button>
          ))}
        </div>

        <label className="modify-input-label" htmlFor="modify-instruction">
          Change request
        </label>
        <textarea
          id="modify-instruction"
          className="modify-input"
          value={instruction}
          onChange={(event) => setInstruction(event.target.value)}
          placeholder="Add a blue couch in the living area"
          rows={4}
        />

        <div className="modify-panel-actions">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => onSubmit(instruction)}
            disabled={!instruction.trim() || isProcessing}
            className="modify-submit"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isProcessing ? "Applying..." : "Apply Change"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModifyPanel;
