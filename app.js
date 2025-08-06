fetch("data.json")
  .then((res) => res.json())
  .then((streams) => {
    const container = document.getElementById("stream-container");
    const now = new Date();

    streams
      .filter((stream) => {
        const streamDate = new Date(`${stream.date}T${stream.time}`);
        return streamDate >= now;
      })
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
      )
      .forEach((stream) => {
        const streamDate = new Date(`${stream.date}T${stream.time}`);
        const isNow =
          now >= streamDate &&
          now <= new Date(streamDate.getTime() + 3 * 60 * 60 * 1000); // np. 3h stream

        const streamDiv = document.createElement("div");
        streamDiv.className = "stream" + (isNow ? " current-stream" : "");

        streamDiv.innerHTML = `
          <div class="stream-info">
            <span class="stream-date">${formatDate(streamDate)}</span>
            <span class="stream-title">${stream.title}</span>
          </div>
          <div class="stream-time">${stream.time}</div>
        `;

        container.appendChild(streamDiv);
      });
  });

function formatDate(date) {
  const options = { weekday: "long", day: "numeric", month: "long" };
  return date.toLocaleDateString("pl-PL", options);
}
