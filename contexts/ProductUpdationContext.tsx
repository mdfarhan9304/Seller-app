import React, { createContext, useContext, useState } from "react";

export const ProductUpdationContext = createContext<{
  updatedTimeStamp: number;
  markProductUpdated: () => void;
}>({
  updatedTimeStamp: Date.now(),
  markProductUpdated: () => {},
});

export const ProductUpdationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [updatedTimeStamp, setUpdatedTimeStamp] = useState(Date.now());

  const markProductUpdated = () => {
    console.log('markProductUpdated', Date.now());
    setUpdatedTimeStamp(Date.now());
  };

  return (
    <ProductUpdationContext.Provider
      value={{ updatedTimeStamp, markProductUpdated }}
    >
      {children}
    </ProductUpdationContext.Provider>
  );
};


export const useProductUpdation = () => {
  const context = useContext(ProductUpdationContext);
  if (!context) {
    throw new Error("useProductUpdation must be used within a ProductUpdationProvider");
  }
  return context;
};