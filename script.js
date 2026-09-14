const menuBtn = document.querySelector(".menu-btn");
const navbar = document.querySelector(".navbar");
menuBtn?.addEventListener("click", () => navbar.classList.toggle("menu-open"));

document.querySelectorAll("nav a, .nav-cta, .brand, .btn, footer a").forEach(a => {
  a.addEventListener("click", () => navbar.classList.remove("menu-open"));
});

const sections = document.querySelectorAll("section[id]");
const links = document.querySelectorAll(".nav-link");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(link => link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, { rootMargin: "-35% 0px -55% 0px" });

sections.forEach(section => observer.observe(section));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = (Math.min(i * 35, 180)) + "ms";
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));


// Make every product card clickable while preserving the visible link.
document.querySelectorAll(".clickable-card").forEach(card => {
  const link = card.querySelector("a.card-link");
  if (!link) return;

  const openCard = (event) => {
    if (event.target.closest("a")) return;
    window.location.href = link.getAttribute("href");
  };

  card.addEventListener("click", openCard);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.location.href = link.getAttribute("href");
    }
  });
});


// Currency selector: prices are fixed by GameZone's own price list.
const currencySelect = document.querySelector("#currency-select");
const currencyConfig = {
  JOD: { label: "JOD", key: "jod" },
  USD: { label: "USD", key: "usd" },
  SAR: { label: "SAR", key: "sar" }
};

function applyCurrency(currency) {
  const config = currencyConfig[currency] || currencyConfig.JOD;
  document.querySelectorAll(".price[data-jod]").forEach(price => {
    const value = price.dataset[config.key];
    if (value == null) return;
    price.innerHTML = `${value} <small>${config.label}</small>`;
  });
  document.querySelectorAll("[data-currency-copy]").forEach(el => {
    el.textContent = config.label;
  });
  if (currencySelect) currencySelect.value = currency;
}

const savedCurrency = localStorage.getItem("gamezoneCurrency") || "JOD";
applyCurrency(savedCurrency);

currencySelect?.addEventListener("change", event => {
  const currency = currencyConfig[event.target.value] ? event.target.value : "JOD";
  localStorage.setItem("gamezoneCurrency", currency);
  applyCurrency(currency);
});
