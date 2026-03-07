 
 import React from "react";
 import { Svg, Path } from "react-native-svg";
 
 const MySvgComponent = (props: any) => {
   return (
     <Svg
       width={35}
       height={35}
       viewBox="0 0 35 35"
       fill="none"
       {...props} // Allows passing additional props
     >
       <Path
         d="M17.5 2.917c8.035 0 14.583 6.548 14.583 14.583S25.535 32.083 17.5 32.083 2.917 25.535 2.917 17.5 9.465 2.917 17.5 2.917z"
         stroke="#000"
         strokeWidth={2}
         strokeLinecap="round"
         strokeLinejoin="round"
       />
       <Path
         d="M17.5 11.667V17.5M17.5 23.333h.01"
         stroke="#000"
         strokeWidth={2}
         strokeLinecap="round"
         strokeLinejoin="round"
       />
     </Svg>
   );
 };
 
 export default MySvgComponent;
 