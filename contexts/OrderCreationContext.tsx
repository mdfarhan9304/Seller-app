import React, { createContext, useContext, useState } from "react";
import type { Location } from "../app/types/location";
import type {
  Contact,
  PackageDetails,
  Drop,
  Pickup,
  OrderPricing,
  OrderPayment,
  VehicleType,
  Stop,
  Address,
} from "../app/types/order";

interface OrderCreationState {
  pickup: Partial<Pickup> | null;
  drops: Partial<Drop> | null;
  stops: Partial<Stop> | null;
  packageDetails: Partial<PackageDetails> | null;
  pricing: Partial<OrderPricing> | null;
  payment: Partial<OrderPayment> | null;
  vehicleType: VehicleType | null;
  dateTime: { date: Date } | null;
  estimatedDuration: number | null;
}

interface OrderCreationContextType {
  state: OrderCreationState;
  setPickup: (pickup: Partial<Pickup>) => void;
  setDrops: (drops: Partial<Drop>) => void;
  setStop: (stops: Partial<Stop>) => void;
  setDateTime: (dateTime: { date: Date }) => void;
  addDrop: (drop: Partial<Drop>) => void;
  removeDrop: (index: number) => void;
  setPackageDetails: (details: Partial<PackageDetails>) => void;
  setPricing: (pricing: Partial<OrderPricing>) => void;
  setPayment: (payment: Partial<OrderPayment>) => void;
  setVehicleType: (type: VehicleType) => void;
  setEstimatedDuration: (duration: number) => void;
  reset: () => void;
}

const initialState: OrderCreationState = {
  pickup: null,
  drops: null,
  stops: null,
  packageDetails: null,
  pricing: null,
  dateTime: null,
  payment: null,
  vehicleType: null,
  estimatedDuration: null,
};

const OrderCreationContext = createContext<OrderCreationContextType | null>(
  null
);

export function OrderCreationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<OrderCreationState>(initialState);

  const setPickup = (pickup: Partial<Pickup>) => {
    console.log("[OrderCreation] Setting pickup:", pickup);
    // Convert address format if needed
    if (pickup.address && "full" in pickup.address) {
      const oldAddress = pickup.address as any;
      pickup.address = {
        address: oldAddress.full,
        city: oldAddress.city || "",
        state: oldAddress.state || "",
        country: "India",
        zip: oldAddress.pincode || "",
        latitude: oldAddress.coordinates?.latitude || 0,
        longitude: oldAddress.coordinates?.longitude || 0,
      };
    }
    setState((prev) => ({ ...prev, pickup }));
  };

  const setDrops = (drop: Partial<Drop>) => {
    console.log("[OrderCreation] Setting drop:", drop);
    // Convert address format if needed
    if (drop.address && "full" in drop.address) {
      const oldAddress = drop.address as any;
      drop.address = {
        address: oldAddress.full,
        city: oldAddress.city || "",
        state: oldAddress.state || "",
        country: "India",
        zip: oldAddress.pincode || "",
        latitude: oldAddress.coordinates?.latitude || 0,
        longitude: oldAddress.coordinates?.longitude || 0,
      };
    }
    setState((prev) => ({ ...prev, drops: drop }));
  };

  const addDrop = (drop: Partial<Drop>) => {
    console.log("[OrderCreation] Adding drop:", drop);
    // Convert address format if needed
    if (drop.address && "full" in drop.address) {
      const oldAddress = drop.address as any;
      drop.address = {
        address: oldAddress.full,
        city: oldAddress.city || "",
        state: oldAddress.state || "",
        country: "India",
        zip: oldAddress.pincode || "",
        latitude: oldAddress.coordinates?.latitude || 0,
        longitude: oldAddress.coordinates?.longitude || 0,
      };
    }
    setState((prev) => ({ ...prev, drops: drop }));
  };

  const setStop = (stop: Partial<Stop>) => {
    // Convert address format if needed
    if (stop.address && "full" in stop.address) {
      const oldAddress = stop.address as any;
      stop.address = {
        address: oldAddress.full,
        city: oldAddress.city || "",
        state: oldAddress.state || "",
        country: "India",
        zip: oldAddress.pincode || "",
        latitude: oldAddress.coordinates?.latitude || 0,
        longitude: oldAddress.coordinates?.longitude || 0,
      };
    }
    setState((prev) => ({
      ...prev,
      stops: stop,
    }));
  };

  const removeDrop = () => {
    console.log("[OrderCreation] Removing drop");
    setState((prev) => ({ ...prev, drops: null }));
  };

  const setPackageDetails = (packageDetails: Partial<PackageDetails>) => {
    console.log("[OrderCreation] Setting package details:", packageDetails);
    setState((prev) => ({ ...prev, packageDetails }));
  };

  const setPricing = (pricing: Partial<OrderPricing>) => {
    console.log("[OrderCreation] Setting pricing:", pricing);
    setState((prev) => ({ ...prev, pricing }));
  };

  const setPayment = (payment: Partial<OrderPayment>) => {
    console.log("[OrderCreation] Setting payment:", payment);
    setState((prev) => ({ ...prev, payment }));
  };

  const setVehicleType = (vehicleType: VehicleType) => {
    console.log("[OrderCreation] Setting vehicle type:", vehicleType);
    setState((prev) => ({ ...prev, vehicleType }));
  };

  const setDateTime = (dateTime: { date: Date }) => {
    console.log("[OrderCreation] Setting dateTime:", dateTime);
    setState((prev) => ({ ...prev, dateTime }));
  };

  const setEstimatedDuration = (estimatedDuration: number) => {
    console.log(
      "[OrderCreation] Setting estimated duration:",
      estimatedDuration
    );
    setState((prev) => ({ ...prev, estimatedDuration }));
  };

  const reset = () => {
    console.log("[OrderCreation] Resetting state");
    setState(initialState);
  };

  return (
    <OrderCreationContext.Provider
      value={{
        state,
        setDateTime,
        setPickup,
        setStop,
        setDrops,
        addDrop,
        removeDrop,
        setPackageDetails,
        setPricing,
        setPayment,
        setVehicleType,
        setEstimatedDuration,
        reset,
      }}
    >
      {children}
    </OrderCreationContext.Provider>
  );
}

export function useOrderCreation() {
  const context = useContext(OrderCreationContext);
  if (!context) {
    throw new Error(
      "useOrderCreation must be used within an OrderCreationProvider"
    );
  }
  return context;
}
