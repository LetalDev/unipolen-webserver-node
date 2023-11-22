let headerIsToggled = false;
let headerItemsHorizontal = document.getElementById("header-items-horizontal");
let headerItemsVerticalTmp = headerItemsHorizontal.cloneNode(true);
let headerVerticalAside = document.getElementById("header-vertical-aside");
headerVerticalAside.append(headerItemsVerticalTmp);
headerVerticalAside.children[0].id = "header-items-vertical";
let headerItemsVertical = document.getElementById("header-items-vertical");
headerVerticalAside.style.position = "absolute";
headerVerticalAside.classList.add("bg-unp-blue-1");
headerVerticalAside.style.width = "100%";
headerVerticalAside.style.left = "0";
headerVerticalAside.style.paddingLeft = "2.5rem";
headerVerticalAside.style.zIndex = "5";


let headerToggle = document.getElementById("header-toggle");
const mediaQuery = window.matchMedia("(min-width: 1200px)");

headerToggle.onclick = () => {
  if (mediaQuery.matches) return;

  if (!headerIsToggled) headerItemsVertical.style.display = "inherit";
  else headerItemsVertical.style.display = "none";

  headerIsToggled = !headerIsToggled;
};

function mediaWidthChange() {
  if (mediaQuery.matches) {
    headerToggle.style.display = "none";
    headerItemsVertical.style.display = "none";
    headerItemsHorizontal.style.display = "inherit";
  } else {
    headerToggle.style.display = "inherit";
    headerItemsVertical.style.display = "none";
    headerIsToggled = false;
    headerItemsHorizontal.style.display = "none";
  }
}

mediaQuery.addListener(mediaWidthChange);
mediaWidthChange(mediaQuery);