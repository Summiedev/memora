import { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

// Fullscreen Spinner Overlay
const Spinner=()=> {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-black border-opacity-70"></div>
      </div>
    );
  }

  export default Spinner;
