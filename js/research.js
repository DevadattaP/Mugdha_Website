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
        let previousAuthors = "";
        entries.forEach(entry => {
            const authors = formatAuthors(entry.author || "");
            const displayAuthors = authors && authors === previousAuthors ? `<span style="display:inline-block;width:3em;border-bottom:1px solid currentColor;"></span> ` : authors;
            previousAuthors = authors;

            const title = entry.title || "";

            if (entry.type === "article") {
                const journal = entry.journal || "";
                const volume = entry.volume || "";
                const year = entry.year || "";
                const number = entry.number || "";
                const pages = entry.pages || "";
                const doi = entry.doi || "";
                const url = entry.url || (doi ? `https://doi.org/${doi}` : "");

                html += `
                    <li class="list-group-item shadow mb-2 rounded">
                        ${displayAuthors}${displayAuthors ? ", " : ""}<i>${title}</i>${journal ? `, ${journal}` : ""}${volume ? ` <b>${volume}</b>` : ""}${year ? ` (${year})` : ""}${number ? `, no. ${number}` : ""}${pages ? `, ${pages}` : ""}.
                        ${
                            doi
                                ? ` <a href="${url}" target="_blank" class="btn btn-link p-0 ms-3">
                                        <i class="bi bi-box-arrow-up-right"></i>
                                        Link
                                    </a>`
                                : ""
                        }
                    </li>
                `;
            } else {
                // Default formatting (misc, preprint, etc.)
                const year = entry.year || "";
                const url =
                    entry.url ||
                (entry.eprint ? `https://arxiv.org/abs/${entry.eprint}` : "");

                html += `
                    <li class="list-group-item shadow mb-2 rounded">
                    ${displayAuthors}${displayAuthors ? "," : ""} <i>${title}</i>${url ? `, Available at <a href="${url}" target="_blank">${url}</a>` : ""}${year ? `, ${year}` : ""}.
                    </li>
                `;
            }
        });

        container.innerHTML = html;

    } catch (err) {
        console.error("Error loading BibTeX:", err);
        container.innerHTML =
            `<p class="text-danger text-center">Unable to load research papers.</p>`;
    }
}

/**
 * Convert BibTeX author list into display format.
 */
function formatAuthors(authorString) {
    if (!authorString) return "";

    return authorString
        .split(/\s+and\s+/i)
        .map(author => {
            author = author.trim();

            if (author.includes(",")) {
                const parts = author.split(",");
                const last = parts[0].trim();
                const first = parts.slice(1).join(" ").trim();
                return `${first} ${last}`.trim();
            }

            return author;
        })
        .join(", ");
}

/**
 * Simple BibTeX parser.
 */
function parseBibTeX(text) {
    // Remove comments
    text = text.replace(/%.*/g, "");

    const entries = [];
    // Split entries by @
    const rawEntries = text.split("@").slice(1);

    rawEntries.forEach(raw => {
        const entry = {};

        // Entry type (article, misc, book, ...)
        const typeMatch = raw.match(/^(\w+)/);
        if (typeMatch) {
            entry.type = typeMatch[1].toLowerCase();
        }

        const fieldRegex = /(\w+)\s*=\s*[{"]([^"}]+)[}"]/g;
        let match;

        while ((match = fieldRegex.exec(raw)) !== null) {
            entry[match[1].toLowerCase()] = match[2]
                .replace(/\s+/g, " ")
                .trim();
        }

        entries.push(entry);
    });

    return entries;
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("research-list")) {
        loadResearchPapers();
    }
});
