import * as React from "react"
import Svg, { Path, Defs, Pattern, Use, Image } from "react-native-svg"

function Shopicon(props: any) {
  return (
    <Svg
      width={29}
      height={29}
      viewBox="0 0 29 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <Path
        fill="url(#pattern0_3962_8590)"
        fillOpacity={0.5}
        d="M0.585938 0.90625H28.193337999999997V28.51365H0.585938z"
      />
      <Defs>
        <Pattern
          id="pattern0_3962_8590"
          patternContentUnits="objectBoundingBox"
          width={1}
          height={1}
        >
          <Use xlinkHref="#image0_3962_8590" transform="scale(.01)" />
        </Pattern>
        <Image
          id="image0_3962_8590"
          width={100}
          height={100}
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,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"
        />
      </Defs>
    </Svg>
  )
}

export default Shopicon
