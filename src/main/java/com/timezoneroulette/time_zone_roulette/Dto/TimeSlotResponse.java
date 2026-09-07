package com.timezoneroulette.time_zone_roulette.Dto;

import java.time.LocalDate;
import java.util.List;

public record TimeSlotResponse (
        LocalDate date,
        int durationMinutes,
        List<SlotResponse> bestSlots
) { }
