// Konfiguracja
const WEEKLY_STREAM_DAY = 3; // Środa (0 = niedziela)
const WEEKLY_STREAM_HOUR = 19;
const WEEKLY_STREAM_MINUTE = 0;

function getNextWednesdayStream(now) {
  const nextWed = new Date(now);

  if (
    now.getDay() === WEEKLY_STREAM_DAY &&
    (now.getHours() < WEEKLY_STREAM_HOUR ||
      (now.getHours() === WEEKLY_STREAM_HOUR &&
        now.getMinutes() < WEEKLY_STREAM_MINUTE))
  ) {
    // Dziś środa, przed streamem – stream dziś
  } else {
    const daysUntilNextWed = (7 + WEEKLY_STREAM_DAY - now.getDay()) % 7 || 7;
    nextWed.setDate(now.getDate() + daysUntilNextWed);
  }

  nextWed.setHours(WEEKLY_STREAM_HOUR, WEEKLY_STREAM_MINUTE, 0, 0);

  return {
    title: "Regularny stream",
    date: nextWed.toISOString().split("T")[0],
    time: `${String(WEEKLY_STREAM_HOUR).padStart(2, "0")}:${String(
      WEEKLY_STREAM_MINUTE
    ).padStart(2, "0")}`,
    isWeekly: true,
  };
}

function parseStreamDateTime(stream) {
  return new Date(`${stream.date}T${stream.time}:00`);
}

function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function updateCountdownDisplay(message) {
  const countdownBox = document.getElementById("next-stream-countdown");
  if (countdownBox) countdownBox.textContent = message;
}

function startCountdown(targetDate) {
  function tick() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      updateCountdownDisplay("Stream trwa!");
      clearInterval(timer);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const display =
      `Następny stream za: ` +
      (days > 0 ? `${days} dni, ` : "") +
      `${String(hours).padStart(2, "0")}:` +
      `${String(minutes).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}`;

    updateCountdownDisplay(display);
  }

  tick();
  const timer = setInterval(tick, 1000);
}

// Main logic
fetch("data.json")
  .then((res) => res.json())
  .then((streamData) => {
    const now = new Date();
    const weeklyStream = getNextWednesdayStream(now);

    const allStreams = [...streamData, weeklyStream]
      .map((s) => ({
        ...s,
        dateObj: parseStreamDateTime(s),
      }))
      .filter((s) => {
        const streamDate = s.dateObj;

        // Jeśli stream dziś i już się rozpoczął – pokaż jako aktywny do końca dnia
        if (isSameDay(now, streamDate) && now >= streamDate) {
          return true;
        }

        // Jeśli stream w przyszłości
        return streamDate > now;
      })
      .sort((a, b) => a.dateObj - b.dateObj);

    if (allStreams.length === 0) {
      updateCountdownDisplay("Brak nadchodzących streamów");
      return;
    }

    const nextStream = allStreams[0];
    const streamDate = nextStream.dateObj;

    // Jeśli stream jest dziś i już się rozpoczął – wyświetl "Stream trwa!" aż do końca dnia
    if (isSameDay(now, streamDate) && now >= streamDate) {
      updateCountdownDisplay("Stream trwa!");
    } else {
      // Inaczej – odliczaj
      startCountdown(streamDate);
    }
  })
  .catch((err) => {
    console.error("Błąd podczas ładowania streamów:", err);
    updateCountdownDisplay("Nie udało się załadować harmonogramu");
  });
