const picoSdk = @cImport({
    @cInclude("stdlib.h");
    @cInclude("stdio.h");
    @cInclude("pico/stdlib.h");
    @cInclude("hardware/gpio.h");
});

const MeasureError = error{MaxTimeExceeded};

pub const DistanceSensor = struct {
    trigger_pin: u8 = 0,
    echo_pin: u8 = 0,
    max_measure_time_ms: u64 = 100,

    pub fn measure_distance_cm(self: DistanceSensor) MeasureError!f64 {
        picoSdk.gpio_init(self.trigger_pin);
        picoSdk.gpio_init(self.echo_pin);

        picoSdk.gpio_set_dir(self.trigger_pin, true);
        picoSdk.gpio_set_dir(self.echo_pin, false);

        picoSdk.gpio_put(self.trigger_pin, false);

        picoSdk.sleep_us(10);

        picoSdk.gpio_put(self.trigger_pin, true);

        picoSdk.sleep_us(10);

        picoSdk.gpio_put(self.trigger_pin, false);

        while (picoSdk.gpio_get(self.echo_pin) == false) {
            picoSdk.tight_loop_contents();
        }

        const start_time = picoSdk.time_us_64();

        while (picoSdk.gpio_get(self.echo_pin) == true) {
            picoSdk.tight_loop_contents();
        }

        const end_time = picoSdk.time_us_64();

        const time_diff_us: f64 = @floatFromInt(end_time - start_time);
        return (time_diff_us * 0.0343) / 2;
    }
};
