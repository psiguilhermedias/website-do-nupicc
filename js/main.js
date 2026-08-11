/* Mobile navigation and gallery lightbox */

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

document.addEventListener("DOMContentLoaded", async () => {
  initializeMobileNavigation();
  initializeLightbox();
});
