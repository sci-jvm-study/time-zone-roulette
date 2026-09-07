package com.timezoneroulette.time_zone_roulette.Model;

import java.time.Instant;

public record AvailabilityInterval(
        Instant start,
        Instant end
) {
}
