import { createContext, useContext, useState } from "react";
import HallBookingForm from "./HallBookingForm.jsx";

const HallBookingContext = createContext(null);

// One Hall Requisition modal for the whole site, opened by the header button and the Services page.
export function HallBookingProvider({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <HallBookingContext.Provider value={{ open, openBooking: () => setOpen(true) }}>
      {children}
      <HallBookingForm open={open} onClose={() => setOpen(false)} />
    </HallBookingContext.Provider>
  );
}

export const useHallBooking = () => useContext(HallBookingContext);
