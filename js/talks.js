function formatEvent(event) {
    // Supports [Text](URL) or plain text.
    const mdLinkMatch = event?.match(/^\[(.+?)\]\((.+?)\)$/);

    if (mdLinkMatch) {
        const text = mdLinkMatch[1];
        const url = mdLinkMatch[2];
        return `<a href="${url}" target="_blank">${text}</a>`;
    }

    return event || "";
}

async function loadTalks() {
    const ul = document.getElementById("talks-list");
    if (!ul) return;

    try {
        const resp = await fetch("data/talks.json");
        if (!resp.ok) throw new Error("Failed to load talks.json");

        const talks = await resp.json();
        ul.innerHTML = ""; // clear placeholder

        talks.forEach(talk => {
            const li = document.createElement("li");
            li.className = "list-group-item shadow mb-2 rounded";

            const eventHTML = formatEvent(talk.event);

            li.innerHTML = `
                ${talk.title},
                ${eventHTML},
                ${talk.date}
                <span>&nbsp;&nbsp;</span>
                ${
                    talk.slides_link
                        ? `<a href="${talk.slides_link}" target="_blank" class="btn btn-link p-0">
                                <i class="bi bi-filetype-pdf"></i>
                                Slides
                           </a>`
                        : ""
                }
            `;

            ul.appendChild(li);
        });

    } catch (err) {
        console.error("Error loading talks:", err);
        ul.innerHTML =
            `<p class="text-danger text-center">Unable to load talks.</p>`;
    }
}

async function loadPosters() {
    const ul = document.getElementById("posters-list");
    if (!ul) return;

    try {
        const resp = await fetch("data/posters.json");
        if (!resp.ok) throw new Error("Failed to load posters.json");

        const posters = await resp.json();
        ul.innerHTML = "";

        posters.forEach(poster => {
            const li = document.createElement("li");
            li.className = "list-group-item shadow mb-2 rounded";

            const eventHTML = formatEvent(poster.event);

            li.innerHTML = `
                ${poster.title},
                ${eventHTML},
                ${poster.date}
                <span>&nbsp;&nbsp;</span>
                ${
                    poster.poster_link
                        ? `<a href="${poster.poster_link}" target="_blank" class="btn btn-link p-0">
                                <i class="bi bi-filetype-pdf"></i>
                                Poster
                           </a>`
                        : ""
                }
            `;

            ul.appendChild(li);
        });

    } catch (err) {
        console.error("Error loading posters:", err);
        ul.innerHTML =
            `<p class="text-danger text-center">Unable to load poster presentations.</p>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadTalks();
    loadPosters();
});
