import * as React from "react"
import Svg, { Path, Defs, Pattern, Use, Image } from "react-native-svg"

function Shop(props: any) {
  return (
    <Svg
      width={34}
      height={34}
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <Path
        fill="url(#pattern0_3959_8083)"
        fillOpacity={0.5}
        d="M0 0H34V34H0z"
      />
      <Defs>
        <Pattern
          id="pattern0_3959_8083"
          patternContentUnits="objectBoundingBox"
          width={1}
          height={1}
        >
          <Use xlinkHref="#image0_3959_8083" transform="scale(.01)" />
        </Pattern>
        <Image
          id="image0_3959_8083"
          width={100}
          height={100}
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAADc0lEQVR4nO2dz2pTQRTGf6YqqAt9A91VUUEUxOKmgk8gtCIqZKNPoPgKYl0puhBFF7qx7roqRXRlH0Cr6KbQhRZXgn+iUI0MzCKUOzczIZk5uf1+cBZNztwz53y5303CDQUhhBBCCCGEEEIIIbYGR4EbCnpn4GZSjDbQVdA7AzcTCYKdF4YEobwIEoTyg5cglB/22ArSAZYC0QmsWQnkrwxQI0d0xkmQ1Zo1q4mNtAeokYPUPrIgQZAgXZ0hOkOqkGWha0hfdA1hPK4hWznaEoTiIpgR5KqBAXSNhZtJMV4YGEDXWMyXEmM38MPAALrG4iewp4Qg5w003zUasyUEmQ9sZh24WLNZ99zZilgM5C8G8i3UWLdiW3V2dQ84UNOIe66Kx4F893gVFmrct2JbdXY1bWRYOWqcsWJboXdX7hSeMDKsHDVawOfSttXPrmIaaYogWLCtfnZlaVg5ahS3rX52FdtIUwRplbStGLuKbaQpghS1rRi7sjasHDWK2VaMXaU00hRBWiVsK9auUhppiiBFbCvWriwOK0eN7LYVa1epjTRFkFZO20qxq9RGmiJIVttKsSurw8pRI5ttPUiwq0EacTwJ5LvHGZMaEzVfybsZDo27gSJvA/nTiWeU43Ug/9WY1QjdHH6HIXI9UOQfMFWR/6ymkacV+UeAP4H838DhMalx2s+kKv8aQ+RUzca+ADPAPmCyxt42n76Tfs05YK1P/prPs1xjtsauXJwcpiDbgA8RG1RQOYP3foZD5YIGzqAvuJF9n6X7sEgW4zkjxH1AfJm4oY6/aKas+Wawhjv+r8Q1S35mI2UncBvYiNiQu+4cA44DnyLyN4BbwC5gLrLGR3/8UdZwxz3h36m9i6wx52eVjUPAQmBD34HLwPae/B3+vtdl4O+m/K/AQ+Dgphru70f++d58t/4NcMUfd1Q1lv3xemu4ni75Hqt6X6iokY1Bf5C517/a3GeY/f6LuTomfN6UX+fWU7hGY35B1RRWJYgtJIgxJIgxJIgxJIgxJIgxJIgxJIgxJIgxJIgxJIgxJIgxJIgxJIgxJIgxJIgxJIgxJIgxJIgxJIgxJIgxJIgxJIgxxkqQ0v9KYkn/riLtJuQmR9viGbKVoy1BKC6CBKH84CUI5YdtXhD3I5abCnpn4GYihBBCCCGEEEIIIQRN5z/ku9Uu4kI/iQAAAABJRU5ErkJggg=="
        />
      </Defs>
    </Svg>
  )
}

export default Shop
