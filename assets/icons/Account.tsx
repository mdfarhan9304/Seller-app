import * as React from "react"
import Svg, { Path, Defs, Pattern, Use, Image } from "react-native-svg"

function Shopicon(props: any) {
  return (
    <Svg
      width={34}
      height={35}
      viewBox="0 0 34 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <Path
        fill="url(#pattern0_3902_3893)"
        fillOpacity={0.5}
        d="M0 0.859375H34V34.859375H0z"
      />
      <Defs>
        <Pattern
          id="pattern0_3902_3893"
          patternContentUnits="objectBoundingBox"
          width={1}
          height={1}
        >
          <Use xlinkHref="#image0_3902_3893" transform="scale(.01)" />
        </Pattern>
        <Image
          id="image0_3902_3893"
          width={100}
          height={100}
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAADQklEQVR4nO2dO2gVQRSGPx8YQQUFH6UXFQ3YRWxMYyNoJRYi2vgArVRMIliImlLER2elYKGNjaJlhCAEfARSKAEt7KJEUImJQjDIysBckeDOXWV39uzu/8GpAnvOnG93Zu7evRsQQgghhBBCCCGEEELMZwNwAOgDzlUk+nzNrvbasA94CSQVjxd+LJVlBfDYQCOTnOORH1ulWAk8N9C8pKB45sdYCRYDTww0LSk4ngJLqAA3DTQriRS3MM7JDgP4CYwBQznESCDPSE45xnzNoTG5MZtkFzAXKPwNsCXHfK1ALve3vOj2taflmvNjN4Vr9JdA0Z+AjTnnbEUS0s71MZDvK7AVI6wC3gaK/QHsLCBvK6IQRy8wG8j5DlhNBXZUxwvK3YosxHHY+s6r047qSoG5WyUIcVy1uvM6keET7cIaClmU4Q5EUbNCKpuA74GCXkW4vdAqSQh+bK8D+b/FviF5J/KOypqQLDuv20RieYfdxqzfAhcdU4EapiLV0KkPy2II2dNh/lTwuwe7Ywg5paaT9aSLclvlooSQVYjrVeEMSghZhbheSQh21rFShYwD+xsa4xaFDNNchiXEFhJiDAkxhoQYQ0KMISHGaIyQFrA3x88L7ljrC6izEUIuZHgm6n/CHfN8zrXWXkhvhNsaO3Kst/ZCBiMIuZRjvbUXcrpi31XUXsgaYLJAGZM5P9RWeyHtx1MfAh9y/A7cHesBsJl8aYSQKiEhxpAQY0iIMSTEGBJiDAkxhoQYQ0KMISHGkBBjSIgxJMQYEmIMCTGGhBhDQowhIcaQEGNIiDEkxBgSYgwJMYaEGENCjCEhxpAQY0iIMUoVcjYlufuXFE1lNKUnAzGSH0pJPg100Ty6gJmUnhyMUcD2wO8ujtA8jgX6sS1GAe7Vr+9TCvic8/vdrdPtx/y3XkwAC2IVciNwVrgCj9Z8+uryV0bofffXYha0LjBvtmPGL3ZDNYvRDGN36+laIjNQ4G8Ak4rHGUrAzY/3DAw+MRb3Y64d81kqKfwp467vSam4s6E/w7xa55gua5rqtNBf99u9pCEx4XdT0Rfwf71ievwnenflXK5Z9Pux9ZS5VgghhBBCCCGEEEIIQcn8ArDPcHOFs0iNAAAAAElFTkSuQmCC"
        />
      </Defs>
    </Svg>
  )
}

export default Shopicon

