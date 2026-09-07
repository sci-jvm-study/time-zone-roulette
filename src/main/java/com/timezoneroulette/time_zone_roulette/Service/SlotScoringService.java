package com.timezoneroulette.time_zone_roulette.Service;

import com.timezoneroulette.time_zone_roulette.Dto.ParticipantRequest;
import com.timezoneroulette.time_zone_roulette.Model.AvailabilityInterval;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class SlotScoringService {

    private static final int STEP_MINUTES = 30;

    public int calculateScore(
            AvailabilityInterval slot,
            List<ParticipantRequest> participants
    ) {
        int totalScore = 0;
        int totalPoints = 0;
        Instant current = slot.start();
        while (current.isBefore(slot.end())) {
            for (ParticipantRequest participant : participants) {
                ZoneId zoneId = ZoneId.of(participant.timeZone());
                LocalTime localTime =
                        current.atZone(zoneId).toLocalTime();
                totalScore += scoreTime(localTime);
                totalPoints++;
            }
            current = current.plus(
                    Duration.ofMinutes(STEP_MINUTES)
            );
        }
        return totalScore / totalPoints;
    }

    private int scoreTime(LocalTime time) {
        int hour = time.getHour();
        if (hour >= 8 && hour < 18) {
            return 100;
        }
        if (hour >= 18 && hour < 21) {
            return 80;
        }
        if (hour >= 21 && hour < 22) {
            return 60;
        }
        if (hour >= 6 && hour < 8) {
            return 40;
        }
        if (hour >= 22 && hour < 24) {
            return 20;
        }
        return 0;
    }
}