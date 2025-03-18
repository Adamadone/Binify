# Firmware

Firmware part of the project. Below you will find some basic instructions on how to bild from source.

## Requirements
- Python 3
- CMake
- Zig 14.0
- Arm GNU Toolchain
- Build system of your choice (probably MinGW on Windows, which includes all necesarry build tools)

## Env setup

Clone [pico-sdk](https://github.com/raspberrypi/pico-sdk) and set an env variable PICO_SDK_PATH that points to the cloned project.

Set ARM_NONE_EABI_PATH env variable to point to the /include directory of the Arm GNU Toolchain install directory, for example:
`C:\Program Files (x86)\GNU Arm Embedded Toolchain\10 2021.07\arm-none-eabi\include`

## Building
```shell
zig build
```

After the script has finnished running, you should find a firmware.uf2 in zig-out, which can be uploaded to the pico-W.