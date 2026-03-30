/**
 * Events: put image files under assets/images/<folder>/ (see ADDING-EVENTS.md).
 * Paths are relative to index.html. Use .jpg/.png in the array after you upload;
 * starter files use .svg placeholders you can delete.
 */
const EVENTS = [
  {
    title: "TECH TRIATHLON",
    datetime: "07-04-2026",
    dateLabel: "April 07, 2026",
    location: "C-008",
    description:
      "The Tech Triathlon is a multi-round elimination competition testing aptitude, debugging, practical skills, and rapid-fire thinking to identify the most consistent and capable participant.",
    images: [
      "assets/images/tech-tri/slide-1.png",
      "assets/images/tech-tri/slide-2.png",
      "assets/images//tech-tri/slide-3.png",
    ],
    registerUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdxOSFaTsfvWFj0fDpAcp-95g5zwL5nziZBF3QGiQWknXfFUQ/viewform",
  },
  {
    title: "HYDRO MISSILE",
    datetime: "07-04-2026",
    dateLabel: "April 07, 2026",
    location: "Near Football Turf",
    description:
      "The Hydro Missile event challenges participants to design and launch water-powered rockets using principles of pressure and aerodynamics to achieve maximum distance or accuracy while promoting innovation and teamwork.",
    images: [
      "assets/images/Hydro/slide-1.png",
      "assets/images/Hydro/slide-2.png",
      "assets/images/Hydro/slide-3.png",
    ],
    registerUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfKA9ODJcRCotq5X1B6q9ZDL2tPVF1wxuhtzpcGuSBthtWSDg/viewform",
  },
  {
    title: "ROBOSPHERE",
    datetime: "08-04-2026",
    dateLabel: "Arpil 8, 2026",
    location: "B-Block 107A",
    description:
      "This two-day event on IoT, robotics, and emerging technologies combines theoretical learning with hands-on project building, where participants create and present innovative solutions using IoT kits under expert guidance.",
    images: [
      "assets/images/Robosphere/slide-1.png",
      "assets/images/Robosphere/slide-2.png",
      "assets/images/Robosphere/slide-3.png",
    ],
    registerUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeUwv7PkIpci9ymlrV89WL4hlY64gyQcc8Tfx1HdsifJ0x_CQ/viewform",
  },
  {
    title: "ROBO RACE",
    datetime: "08-04-2026",
    dateLabel: "April 8, 2026",
    location: "In front of C block",
    description:
      "The Robo Race event challenges participants to control robots through an obstacle track in the shortest time, testing precision, coordination, and control under supervised and safe conditions..",
    images: [
      "assets/images/RoboRace/slide-1.png",
      "assets/images/RoboRace/slide-2.png",
      "assets/images/RoboRace/slide-3.png",
    ],
    registerUrl: "https://docs.google.com/forms/d/e/1FAIpQLSd7BM4tvXAJcgWfk3f4BADYgCl7jk3jaC2CtrUpjiL4jZUTRw/viewform",
  },
  {
    title: "ROBO SOCCER",
    datetime: "08-04-2026",
    dateLabel: "April 8, 2026",
    location: "In front of C block",
    description:
      "The Robo Soccer event is a competitive activity where participants control robots to play a mini soccer match, testing coordination, control, and teamwork under defined rules and safe supervision.",
    images: [
      "assets/images/RoboSoccer/slide-1.png",
      "assets/images/RoboSoccer/slide-2.png",
      "assets/images/RoboSoccer/slide-3.png",
    ],
    registerUrl: "https://docs.google.com/forms/d/e/1FAIpQLSchgc2wjdt-siFH5J6rPrmvi1mWre6qHi8sqbqNIHmWY1sIiw/viewform",
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
  register.className = "btn btn-yellow btn-register";
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

function initDummyLinks() {
  document.querySelectorAll("a.js-dummy").forEach((a) => {
    a.addEventListener("click", (e) => e.preventDefault());
  });
}

function init() {
  const root = document.getElementById("events-root");
  if (!root) return;

  EVENTS.forEach((ev) => {
    const card = createEventCard(ev);
    root.appendChild(card);
    initSlideshow(card, ev.images, ev.title);
  });

  initDummyLinks();
}

document.addEventListener("DOMContentLoaded", init);
