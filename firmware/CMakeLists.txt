cmake_minimum_required(VERSION 3.27)

# Initialize the Pico SDK
include(${PICO_SDK_PATH}/external/pico_sdk_import.cmake)
project(mlem)
pico_sdk_init()
add_executable(mlem)

if (STDIO_USB)
    pico_enable_stdio_uart(mlem 0)
    pico_enable_stdio_usb(mlem 1)
endif()

if (STDIO_UART)
    pico_enable_stdio_uart(mlem 1)
    pico_enable_stdio_usb(mlem 0)   
endif()

# Add lwip library config directory
target_include_directories(mlem PRIVATE ${CMAKE_CURRENT_LIST_DIR}/config)

# Adjust libraries as needed
target_link_libraries(mlem pico_cyw43_arch_lwip_poll pico_stdlib ${CMAKE_SOURCE_DIR}/zig-out/mlem.o)

# Generate binary
pico_add_extra_outputs(mlem)
