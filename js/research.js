async function loadResearchPapers() {
    const container = document.getElementById("research-list");
    if (!container) return;

    try {
        const response = await fetch("data/research.bib");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const bibText = await response.text();

        // Parse BibTeX entries
        const entries = parseBibTeX(bibText);
        
        let html = "";

        entries.forEach(entry => {
            const authors = entry.author || "";
            const title = entry.title || "";
            const year = entry.year || "";
            const url =
                entry.url ||
                (entry.eprint ? `https://arxiv.org/abs/${entry.eprint}` : "");

            html += `
                <li class="list-group-item shadow mb-2 rounded">
                    ${authors}${authors ? "," : ""} <i>${title}</i>${url ? `, Available at <a href="${url}" target="_blank">${url}</a>` : ""}${year ? `, ${year}` : ""}.
                </li>
            `;
        });

        container.innerHTML = html;

    } catch (err) {
        console.error("Error loading BibTeX:", err);
        container.innerHTML =
            `<p class="text-danger text-center">Unable to load research papers.</p>`;
    }
}

/**
 * Very simple BibTeX parser
 * Handles common fields: author, title, year, url, eprint
 */
function parseBibTeX(text) {
    // Remove comments
    text = text.replace(/%.*/g, "");

    // Split entries by @
    const rawEntries = text.split("@").slice(1);

    return rawEntries.map(raw => {
        const entry = {};

        // Extract field = {value} or field = "value"
        const fieldRegex = /(\w+)\s*=\s*[{"]([^"}]+)[}"]/g;
        let match;

        while ((match = fieldRegex.exec(raw)) !== null) {
            const key = match[1].toLowerCase();
            const value = match[2].replace(/\s+/g, " ").trim();
            entry[key] = value;
        }

        return entry;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("research-list")) {
        loadResearchPapers();
    }
});
