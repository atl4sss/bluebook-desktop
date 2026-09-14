export default function BreakScreen({ time, name, onResume }) {
  return (
    <div className="break-screen">
      <main className="break-layout">
        <div className="break-timer-column">
          <div className="break-timer">
            <p>Remaining Break Time</p>
            <div aria-label="Remaining break time">{time}</div>
          </div>
        </div>
        <section className="break-instructions">
          <h1>Take a Break: Do Not Close Your Device</h1>
          <p>
            The next section begins automatically when the break ends. Keep the
            app open to retain your answers. You can also{" "}
            <button className="break-resume" onClick={onResume}>
              Resume Testing Now
            </button>{" "}
            when you are ready.
          </p>
          <h2>Follow these rules during the break:</h2>
          <ol>
            <li>Do not disturb students who are still testing.</li>
            <li>Do not exit the app or close your laptop.</li>
            <li>
              Do not access phones, smartwatches, textbooks, notes, or the
              internet.
            </li>
            <li>Do not eat or drink near any testing device.</li>
            <li>
              Do not speak in the testing room; outside the room, do not discuss
              the exam with anyone.
            </li>
          </ol>
        </section>
      </main>
      <footer className="break-name">{name}</footer>
    </div>
  );
}
