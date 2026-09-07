package com.timezoneroulette.time_zone_roulette.Dto;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

public record SlotResponse(
        int score,
        Instant start,
        Instant end,
        List<ParticipantTime> participantTimes
) {
}
