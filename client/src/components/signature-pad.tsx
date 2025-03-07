import React, { useRef, useState, useContext } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { LanguageContext } from "../App";

interface SignaturePadProps {
  onChange: (signature: string) => void;
}

export function SignaturePad({ onChange }: SignaturePadProps) {
  const { t } = useContext(LanguageContext);
  const padRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    padRef.current?.clear();
    setIsEmpty(true);
    onChange("");
  };

  const handleEnd = () => {
    const signature = padRef.current?.toDataURL() || "";
    setIsEmpty(padRef.current?.isEmpty() || true);
    onChange(signature);
  };

  return (
    <div className="border rounded-lg p-4">
      <SignatureCanvas
        ref={padRef}
        onEnd={handleEnd}
        canvasProps={{
          className: "border rounded-lg w-full h-40 bg-white",
          style: { touchAction: "none" }
        }}
      />
      <Button 
        variant="outline" 
        onClick={clear}
        disabled={isEmpty}
        className="mt-2"
      >
        {t.form.clear}
      </Button>
    </div>
  );
}