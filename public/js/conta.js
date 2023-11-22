const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
let sidebarIsToggled = false;
const sidebarMediaQuery = window.matchMedia("(min-width: 1200px)");
const sidebarContent = document.getElementById("sidebar-content");

function toggleSidebar() {
  if (sidebarMediaQuery.matches) return;

  if (!sidebarIsToggled) {
    sidebar.classList.add("unwrap");
    setTimeout(() => {
      if (sidebarIsToggled) sidebarContent.style.display = "block";
    }, 400);
  } else {
    sidebar.classList.remove("unwrap");
    sidebarContent.style.display = "none";
  }

  sidebarIsToggled = !sidebarIsToggled;
}

sidebarToggle.onclick = toggleSidebar;

function mediaWidthChangeSidebar() {
  if (sidebarMediaQuery.matches) {
    sidebarToggle.style.display = "none";
    sidebar.classList.add("unwrap");
    setTimeout(() => {
      if (sidebarMediaQuery.matches) sidebarContent.style.display = "block";
    }, 400);
  } else {
    sidebarToggle.style.display = "block";
    sidebarIsToggled = false;
    sidebar.classList.remove("unwrap");
    sidebarContent.style.display = "none";
  }
}

sidebarMediaQuery.addListener(mediaWidthChangeSidebar);
mediaWidthChangeSidebar();

let dadosTab = document.getElementById("dados");
let muralTab = document.getElementById("mural");
let cursosTab = document.getElementById("cursos");

let dadosBtn = document.getElementById("dados-btn");
let muralBtn = document.getElementById("mural-btn");
let cursosBtn = document.getElementById("cursos-btn");

let activeTab = dadosTab;
let activeBtn = dadosBtn;

document.getElementById("dados-btn").onclick = () => {
  if (activeTab == dadosTab) return;

  activeTab.style.display = "none";
  activeBtn.classList.remove("active");
  dadosTab.style.display = "block";
  dadosBtn.classList.add("active");

  activeTab = dadosTab;
  activeBtn = dadosBtn;
  toggleSidebar();
}

document.getElementById("mural-btn").onclick = () => {
  activeTab.style.display = "none";
  activeBtn.classList.remove("active");
  muralTab.style.display = "block";
  muralBtn.classList.add("active");

  activeTab = muralTab;
  activeBtn = muralBtn;
  toggleSidebar();
}

document.getElementById("cursos-btn").onclick = () => {
  activeTab.style.display = "none";
  activeBtn.classList.remove("active");
  cursosTab.style.display = "block";
  cursosBtn.classList.add("active");

  activeTab = cursosTab;
  activeBtn = cursosBtn;
  toggleSidebar();
}

