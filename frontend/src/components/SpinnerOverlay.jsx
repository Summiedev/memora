import { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

// Fullscreen Spinner Overlay
const SpinnerOverlay = () => {
  return (
    <div className="fixed inset-0 z-[999] bg-black bg-opacity-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white border-opacity-60"></div>
    </div>
  );
}
 
export default SpinnerOverlay
