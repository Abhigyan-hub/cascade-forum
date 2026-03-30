/**
 * Events: put image files under assets/images/<folder>/ (see ADDING-EVENTS.md).
 * Paths are relative to index.html. Use .jpg/.png in the array after you upload;
 * starter files use .svg placeholders you can delete.
 */
const EVENTS = [
  {
    title: "Annual Tech Symposium",
    datetime: "2026-04-12",
    dateLabel: "April 12, 2026",
    location: "Main Auditorium",
    description:
      "Talks on AI, web platforms, and open source, plus a student project showcase. Network with faculty and industry guests, and join breakout sessions on careers in tech.",
    images: [
      "assets/images/tech-symposium/slide-1.svg",
      "assets/images/tech-symposium/slide-2.svg",
      "assets/images/tech-symposium/slide-3.svg",
    ],
    registerUrl: "paste form link here",
  },
  {
    title: "Spring Cultural Fest",
    datetime: "2026-04-25",
    dateLabel: "April 25–26, 2026",
    location: "Quad & Arts Block",
    description:
      "Music, dance, drama, and art stalls from student clubs. Food trucks and an evening open-mic. Open to all students and invited alumni.",
    images: [
      "assets/images/cultural-fest/slide-1.svg",
      "assets/images/cultural-fest/slide-2.svg",
      "assets/images/cultural-fest/slide-3.svg",
    ],
    registerUrl: "paste form link here",
  },
  {
    title: "Inter-Department Sports Day",
    datetime: "2026-05-08",
    dateLabel: "May 8, 2026",
    location: "Sports Complex",
    description:
      "Track and field, basketball, and volleyball brackets. Teams represent each department; spectators welcome. Prizes and closing ceremony in the evening.",
    images: [
      "assets/images/sports-day/slide-1.svg",
      "assets/images/sports-day/slide-2.svg",
      "assets/images/sports-day/slide-3.svg",
    ],
    registerUrl: "paste form link here",
  },
];

function buildSlideList(track, urls, altBase) {
  track.innerHTML = "";
  const n = urls.length;
  track.style.width = `${n * 100}%`;
  urls.forEach((src, i) => {
    const li = document.createElement("li");
    li.style.width = `${100 / n}%`;
    const img = document.createElement("img");
    img.src = src;
    img.alt = `${altBase} — photo ${i + 1} of ${urls.length}`;
    img.loading = i === 0 ? "eager" : "lazy";
    img.decoding = "async";
    li.appendChild(img);
    track.appendChild(li);
  });
}

function initSlideshow(card, imageUrls, label) {
  const track = card.querySelector(".slideshow-track");
  const dotsRoot = card.querySelector(".slideshow-dots");
  const prev = card.querySelector(".slideshow-btn.prev");
  const next = card.querySelector(".slideshow-btn.next");
  if (!track || !dotsRoot || !prev || !next) return;

  buildSlideList(track, imageUrls, label);

  let index = 0;
  const n = imageUrls.length;

  function go(i) {
    index = ((i % n) + n) % n;
    const pct = (index / n) * 100;
    track.style.transform = `translateX(-${pct}%)`;
    dotsRoot.querySelectorAll("button").forEach((btn, j) => {
      btn.setAttribute("aria-selected", String(j === index));
    });
  }

  dotsRoot.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", `Slide ${i + 1}`);
    b.addEventListener("click", () => go(i));
    dotsRoot.appendChild(b);
  }

  prev.addEventListener("click", () => go(index - 1));
  next.addEventListener("click", () => go(index + 1));

  let timer = setInterval(() => go(index + 1), 5500);
  const root = card.querySelector(".slideshow");
  root.addEventListener("mouseenter", () => {
    clearInterval(timer);
    timer = null;
  });
  root.addEventListener("mouseleave", () => {
    if (!timer) timer = setInterval(() => go(index + 1), 5500);
  });

  go(0);
}

function createEventCard(ev) {
  const article = document.createElement("article");
  article.className = "event-card";

  const slideshow = document.createElement("div");
  slideshow.className = "slideshow";
  slideshow.setAttribute("role", "region");
  slideshow.setAttribute("aria-roledescription", "carousel");
  slideshow.setAttribute("aria-label", `${ev.title} slideshow`);

  const viewport = document.createElement("div");
  viewport.className = "slideshow-viewport";
  const track = document.createElement("ul");
  track.className = "slideshow-track";
  viewport.appendChild(track);
  slideshow.appendChild(viewport);

  const prev = document.createElement("button");
  prev.type = "button";
  prev.className = "slideshow-btn prev";
  prev.setAttribute("aria-label", "Previous image");
  prev.textContent = "‹";

  const next = document.createElement("button");
  next.type = "button";
  next.className = "slideshow-btn next";
  next.setAttribute("aria-label", "Next image");
  next.textContent = "›";

  const dots = document.createElement("div");
  dots.className = "slideshow-dots";
  dots.setAttribute("role", "tablist");

  slideshow.appendChild(prev);
  slideshow.appendChild(next);
  slideshow.appendChild(dots);

  const body = document.createElement("div");
  body.className = "event-body";

  const h2 = document.createElement("h2");
  h2.textContent = ev.title;

  const meta = document.createElement("p");
  meta.className = "meta";
  const timeEl = document.createElement("time");
  timeEl.setAttribute("datetime", ev.datetime);
  timeEl.textContent = ev.dateLabel;
  meta.appendChild(timeEl);
  meta.appendChild(document.createTextNode(` · ${ev.location}`));

  const desc = document.createElement("p");
  desc.textContent = ev.description;

  const register = document.createElement("a");
  register.className = "btn-register";
  register.href = ev.registerUrl;
  register.target = "_blank";
  register.rel = "noopener noreferrer";
  register.textContent = "Register";

  body.appendChild(h2);
  body.appendChild(meta);
  body.appendChild(desc);
  body.appendChild(register);

  article.appendChild(slideshow);
  article.appendChild(body);

  return article;
}

function init() {
  const root = document.getElementById("events-root");
  if (!root) return;

  EVENTS.forEach((ev) => {
    const card = createEventCard(ev);
    root.appendChild(card);
    initSlideshow(card, ev.images, ev.title);
  });
}

document.addEventListener("DOMContentLoaded", init);
