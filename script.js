
        let allStories = [];

async function loadStories() {
  const container = document.getElementById("storyContainer");

  // Fade out existing cards
  const cards = container.querySelectorAll(".story-card");
  cards.forEach(card => card.classList.add("fade-out"));
  await new Promise(res => setTimeout(res, 300));

  try {
    if (allStories.length === 0) {
      const res = await fetch("stories.json");
      allStories = await res.json();

      // Populate genre dropdown (handle multiple genres)
      const genresSet = new Set();
      allStories.forEach(s => {
        if (Array.isArray(s.genre)) {
          s.genre.forEach(g => genresSet.add(g));
        } else if (s.genre) {
          genresSet.add(s.genre);
        }
      });
      const genreSelect = document.getElementById("genreSelect");
      genresSet.forEach(g => {
        const option = document.createElement("option");
        option.value = g;
        option.textContent = g;
        genreSelect.appendChild(option);
      });
    }

    const searchValue = document.getElementById("searchInput").value.toLowerCase();
    const genreValue = document.getElementById("genreSelect").value;

    // Filter stories
    let filtered = allStories.filter(s => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchValue) ||
        (s.summary || "").toLowerCase().includes(searchValue);

      const matchesGenre =
        genreValue === "" ||
        (Array.isArray(s.genre) ? s.genre.includes(genreValue) : s.genre === genreValue);

      return matchesSearch && matchesGenre;
    });

    // // Update story count
    // document.getElementById("storyCount").textContent = `Showing ${filtered.length} story(s)`;

    // Shuffle and pick first 8
    const selected = filtered.sort(() => 0.5 - Math.random()).slice(0,8);

    container.innerHTML = "";

    // Create cards
    selected.forEach(story => {
      const card = document.createElement("div");
      card.className = "story-card fade-out";

      // Check if story is already read
      const readStories = JSON.parse(localStorage.getItem("readStories") || "[]");
      const isRead = readStories.includes(story.id);
      if (isRead) card.classList.add("read");

      card.innerHTML = `
        <h3>${story.title}</h3>
        <p><em>${Array.isArray(story.genre) ? story.genre.join(", ") : story.genre || ""} | ${story.author || ""}</em></p>
        <p>${story.summary || ""}</p>
        <a href="story.html?id=${story.id}">Read More →</a>
        <button class="mark-read-btn">${isRead ? "✔ Read" : "Mark as Read"}</button>
      `;

      container.appendChild(card);
      setTimeout(() => card.classList.remove("fade-out"), 50);

      // Mark as read button
      const btn = card.querySelector(".mark-read-btn");
      btn.addEventListener("click", () => {
        let readStories = JSON.parse(localStorage.getItem("readStories") || "[]");
        if (!readStories.includes(story.id)) {
          readStories.push(story.id);
          localStorage.setItem("readStories", JSON.stringify(readStories));
        }
        card.classList.add("read");
        btn.textContent = "✔ Read";
        btn.disabled = true;
      });
    });

  } catch (err) {
    console.error("Error loading stories:", err);
  }
}

// Event listeners
document.getElementById("refreshBtn").addEventListener("click", loadStories);
document.getElementById("searchInput").addEventListener("input", loadStories);
document.getElementById("genreSelect").addEventListener("change", loadStories);

// Initial load
loadStories();
