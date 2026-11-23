const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

for (const terminal of document.querySelectorAll(".shell-abbreviation")) {
    const command = terminal.querySelector("[data-shell-abbreviation]");
    const abbreviation = [...command.dataset.shellAbbreviation];
    const expansion = command.textContent;
    const cursor = command.nextElementSibling;
    const replay = terminal.querySelector(":scope > button");
    const progressRing = replay.querySelector(".shell-replay-progress");
    let inView = false;
    let loopRequested = false;
    let timer;
    let countdown;

    function canAutoplay() {
        return inView && (!reducedMotion.matches || loopRequested);
    }

    function stopPlayback() {
        clearTimeout(timer);
        if (countdown) {
            countdown.onfinish = null;
            countdown.cancel();
            countdown = undefined;
        }
    }

    function typeLetter(index) {
        if (index === abbreviation.length) {
            timer = setTimeout(() => {
                command.textContent = expansion;
                if (canAutoplay()) {
                    countdown = progressRing.animate(
                        { "--shell-replay-progress": ["0turn", "1turn"], opacity: [1, 1] },
                        { duration: 4000, fill: "forwards" },
                    );
                    countdown.onfinish = play;
                }
            }, 2000);
            return;
        }

        timer = setTimeout(() => {
            command.textContent += abbreviation[index];
            typeLetter(index + 1);
        }, 220);
    }

    function play() {
        stopPlayback();
        command.textContent = "";
        cursor.hidden = false;
        typeLetter(0);
    }

    function updatePlayback() {
        if (canAutoplay()) {
            play();
        } else {
            stopPlayback();
            command.textContent = expansion;
            cursor.hidden = true;
        }
    }

    const observer = new IntersectionObserver((entries) => {
        const visible = entries.at(-1).isIntersecting;
        if (inView !== visible) {
            inView = visible;
            if (!inView) {
                loopRequested = false;
            }
            updatePlayback();
        }
    });

    reducedMotion.addEventListener("change", () => {
        loopRequested = false;
        updatePlayback();
    });
    replay.addEventListener("click", () => {
        loopRequested = true;
        play();
    });
    replay.hidden = false;
    observer.observe(terminal);
}
