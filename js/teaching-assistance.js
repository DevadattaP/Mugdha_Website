async function loadTeachingAssistance() {
    const container = document.getElementById("ta-list");
    if (!container) return;

    try {
        const resp = await fetch("data/teaching-assistance.json");
        if (!resp.ok) throw new Error("Failed to load teaching-assistance.json");
        
        const items = await resp.json();
        container.innerHTML = "";

        items.forEach(item => {
            const card = document.createElement("div");
            card.className = "card mb-1 shadow border-0";

            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${parseMarkdownLink(item.title)}</h5>
                    <p class="card-text" style="margin-bottom: 4px;">${item.organization}</p>
                    ${item.extra ? `<p class="card-text" style="margin-bottom: 4px;">${item.extra}</p>` : ""}
                    <p class="card-text">${item.dates}</p>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading teaching assistance:", err);
        container.innerHTML =
            `<p class="text-danger text-center">Unable to load teaching assistance.</p>`;
    }
}

/**
 * Converts [Text](URL) → <a> or returns plain text
 */
function parseMarkdownLink(text) {
    if (!text) return "";

    // Replace all [text](url) with <a href="url">text</a>
    return text.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank">$1</a>'
    );
}

document.addEventListener("DOMContentLoaded", loadTeachingAssistance);
