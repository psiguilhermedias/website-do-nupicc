/* Internationalization, mobile navigation, gallery lightbox */

const LANGUAGE_STORAGE_KEY = "nupicc-language";

async function loadTranslations() {
  try {
    const rawData = await fetch("./assets/languages/translations.json");
    return await rawData.json();
  } catch (error) {
    console.error("Error loading translations:", error);
    return {};
  }
}

function initializeLanguage() {
  const preferredLanguage = getPreferredLanguage();

  document.querySelectorAll(".lang-btn").forEach((languageSelector) => {
    languageSelector.addEventListener("click", () => {
      const retrievedLanguage = languageSelector.getAttribute("data-lang");

      if (retrievedLanguage) {
        setCurrentLanguage(retrievedLanguage);
      }
    });
  });

  applyTranslations(preferredLanguage);
}

function getPreferredLanguage() {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (stored === "pt" || stored === "en") {
    return stored;
  }

  const navigatorLanguage = (navigator.language || "").toLowerCase();

  if (navigatorLanguage.startsWith("pt")) {
    return "pt";
  } else {
    return "en";
  }
}

function setCurrentLanguage(language) {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

  applyTranslations(language);
}

function applyTranslations(language) {
  const languageTranslations = translations[language] || translations["pt"];

  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const translationKey = element.getAttribute("data-i18n");

    const translationValue = languageTranslations[translationKey];

    if (translationValue != null) {
      element.textContent = translationValue;
    }
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    const translationKey = element.getAttribute("data-i18n-aria");

    const translationValue = languageTranslations[translationKey];

    if (translationValue != null) {
      element.setAttribute("aria-label", translationValue);
    }
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    const translationKey = element.getAttribute("data-i18n-alt");

    const translationValue = languageTranslations[translationKey];

    if (translationValue != null) {
      element.setAttribute("alt", translationValue);
    }
  });

  const titleTranslationKey = document.body.getAttribute("data-i18n-title");

  const titleTranslationValue = languageTranslations[titleTranslationKey];

  if (titleTranslationValue != null) {
    document.title = titleTranslationValue;
  }

  document.querySelectorAll(".lang-btn").forEach((languageSelector) => {
    const pressed = languageSelector.getAttribute("data-lang") === language;

    languageSelector.setAttribute("aria-pressed", pressed ? "true" : "false");
  });

  const mobileNavigationToggle = document.querySelector(".nav-toggle");

  if (mobileNavigationToggle) {
    const mobileNavigationClosed = mobileNavigationToggle.getAttribute("aria-expanded") === "false";

    mobileNavigationToggle.setAttribute(
      "aria-label",
      mobileNavigationClosed
        ? languageTranslations["nav.toggle"]
        : languageTranslations["nav.toggleClose"]
    );
  }
}

function initializeMobileNavigation() {
  const mobileNavigationToggle = document.querySelector(".nav-toggle");

  const navigation = document.querySelector(".site-nav");

  if(!mobileNavigationToggle || !navigation) return;

  const syncAriaLabel = () => {
    const preferredLanguage = getPreferredLanguage();
    const preferredLanguageTranslations = translations[preferredLanguage];

    const mobileNavigationClosed = mobileNavigationToggle.getAttribute("aria-expanded") === "false";

    mobileNavigationToggle.setAttribute(
      "aria-label",
      mobileNavigationClosed
        ? preferredLanguageTranslations["nav.toggle"]
        : preferredLanguageTranslations["nav.toggleClose"]
    );
  };

  mobileNavigationToggle.addEventListener("click", () => {
    const mobileNavigationClosed = mobileNavigationToggle.getAttribute("aria-expanded") === "false";
    mobileNavigationToggle.setAttribute("aria-expanded", mobileNavigationClosed ? "true" : "false");
    navigation.classList.toggle("is-open", mobileNavigationClosed);
    syncAriaLabel();
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNavigationToggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
      syncAriaLabel();
    });
  });

  document.addEventListener("click", () => {
    const clickOutsideNavigation = !(mobileNavigationToggle.contains(event.target) || navigation.contains(event.target));
  
    if (clickOutsideNavigation) {
      mobileNavigationToggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
      syncAriaLabel();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("is-open")) {
      mobileNavigationToggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
      syncAriaLabel();
    }
  });
}

function initializeLightbox() {
  const lightbox = document.querySelector(".lightbox");

  if (!lightbox) return;

  const image = lightbox.querySelector(".lightbox-image");
  const caption = lightbox.querySelector(".lightbox-caption");
  const closeButton = lightbox.querySelector(".lightbox-close");

  const open = (source, altText, captionText) => {
    image.src = source;
    image.alt = altText || "";
    caption.textContent = captionText || "";
    lightbox.setAttribute("aria-hidden", "false");
    lightbox.classList.add("is-open");
    closeButton.focus();
    document.body.style.overflow = "hidden";
  }

  const close = () => {
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.classList.remove("is-open");
    image.removeAttribute("src");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".gallery-item").forEach((galleryItem) => {
    galleryItem.addEventListener("click", () => {
      const thumbnailImage = galleryItem.querySelector("img");

      if (!thumbnailImage) return;

      const preferredLanguage = getPreferredLanguage();
      const preferredLanguageTranslations = translations[preferredLanguage];

      const captionTranslationKey = galleryItem.getAttribute("data-caption-key");

      const captionText = captionTranslationKey && preferredLanguageTranslations[captionTranslationKey]
        ? preferredLanguageTranslations[captionTranslationKey]
        : "";

      open(thumbnailImage.src, thumbnailImage.alt, captionText);
    });
  });

  closeButton.addEventListener("click", close);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) close();
  });
}

var translations = {};

document.addEventListener("DOMContentLoaded", async () => {
  translations = await loadTranslations();

  initializeMobileNavigation();
  initializeLanguage();
  initializeLightbox();
});
