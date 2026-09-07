package com.timezoneroulette.time_zone_roulette.Dto;

import java.time.ZonedDateTime;

public record ParticipantTime (
        String name,
        String timeZone,
        ZonedDateTime start,
        ZonedDateTime end
) { }
