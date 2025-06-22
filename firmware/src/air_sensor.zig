const picoSdk = @cImport({
    @cInclude("stdio.h");
    @cInclude("pico/stdlib.h");
    @cInclude("hardware/gpio.h");
    @cInclude("hardware/adc.h");
});

const divisor: f32 = @floatFromInt(1 << 12);
const conversion_factor: f32 = 3.3 / divisor;

pub const AirSensor = struct {
    gpio_pin: u8 = 0,
    adc_pin: u8 = 0,

    pub fn measure_voltage(self: *const AirSensor) f32 {
        picoSdk.adc_init();

        picoSdk.gpio_init(self.gpio_pin);

        picoSdk.adc_select_input(self.adc_pin);

        const measurment = picoSdk.adc_read();

        _ = picoSdk.printf("Raw value: 0x%03x\n", measurment);

        const result: f32 = @floatFromInt(measurment);
        const result_voltage = result * conversion_factor;

        return result_voltage;
    }
};
