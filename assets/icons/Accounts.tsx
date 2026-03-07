import * as React from "react";
import Svg, { SvgProps, Path, Defs, Pattern, Use, Image } from "react-native-svg";

const SvgComponent: React.FC<SvgProps> = (props) => (
  <Svg
    {...props}
    width={35}
    height={35}
    fill="none"
  >
    <Path fill="url(#pattern)" fillOpacity={0.5} d="M0 0h34.969v34.969H0z" />
    <Defs>
      <Pattern
        id="pattern"
        width={1}
        height={1}
        patternContentUnits="objectBoundingBox"
      >
        <Use href="#image" transform="scale(0.01)" />
      </Pattern>
      <Image
        href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAABsdJREFUeF7tnV+IV..."
        id="image"
        width={100}
        height={100}
        preserveAspectRatio="none"
      />
    </Defs>
  </Svg>
);

export default SvgComponent;
