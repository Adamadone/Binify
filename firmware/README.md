# Firmware

Firmware part of the project. Below you will find some basic instructions on how to build from source.

## Requirements
- Python 3
- CMake (version between 3.5 and 4)
- Zig 14.0
- Arm GNU Toolchain
- C compiler toolchain (MinGW on Windows)

## Env setup

### Zig
Download zig 14.0 from the [official website](https://ziglang.org/download/#release-0.14.0), extract it and add it to your path. You can check if zig is setup correctly by running `zig version` in your terminal.

### Pico-SDK
Clone the [pico-sdk](https://github.com/raspberrypi/pico-sdk) project and create an env variable PICO_SDK_PATH that points to it.

### ARM GNU Toolchain

Download the ARM GNU Toolchain (arm-none-eabi) from [here](https://developer.arm.com/downloads/-/arm-gnu-toolchain-downloads) and install it.

Create a ARM_NONE_EABI_PATH env variable that points to the /include directory of the Arm GNU Toolchain install directory, for example:
`C:\Program Files (x86)\GNU Arm Embedded Toolchain\10 2021.07\arm-none-eabi\include`

### C Toolchain

Easiest way to do this is by using MinGW, which is a set of Linux tools compiled to work on Windows. This allows us to use GCC and Make on Windows.

Best way to install MinGW on windows is through [MSYS2](https://www.msys2.org/). After you have installed MSYS, you should be able to find `MSYS2 MinGW64` through your start menu. Launch it and
a terminal should pop up. Inside the terminal run `pacman -S mingw-w64-x86_64-toolchain`. This will install basic Linux tools for compiling C.

Finally, in your file explorer, navigate to your MSYS2 install directory and then to mingw64/bin. This folder should now contain a bunch of executables like gcc.exe. Add this folder to your path env variable.
After this, try to run `gcc` in your terminal, you should get an error message regarding missing input files.

## Building
```shell
zig build
```

After the script has finnished running, you should find a firmware.uf2 in zig-out, which can be uploaded to the pico-W.