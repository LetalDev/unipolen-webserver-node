//sidebar

const sidebarLinks = document.querySelectorAll("#sidebar .nav-link");
const sections = document.querySelectorAll("#content section");
let current = 0;

for (let i = 0; i < sidebarLinks.length; i++) {
  sidebarLinks[i].addEventListener("click", () => {
    sidebarLinks[current].classList.remove("active");
    sidebarLinks[i].classList.add("active");
    sections[current].setAttribute("hidden", "")
    sections[i].removeAttribute("hidden", "");
    current = i;
  });
}

const queryResult = document.getElementById("query-result");
document.getElementById("query-submit").onclick = async () => {
  let query = document.getElementById("query").value;

  queryResult.innerHTML = "Executando..";

  const data = new URLSearchParams();
  data.append("query", query);

  const res = await fetch(window.location.protocol + "//" + window.location.host + "/admin/query", {
    method: "POST",
    body: data
  })

  try {
    queryResult.innerHTML = JSON.stringify(JSON.parse(await res.text()), null, 2);
  } catch (e) {
    queryResult.innerHTML = "Ocorreu um erro.";
  }
};

//manage courses

const coursesTable = document.getElementById("courses-table");
const updateCourses = document.getElementById("update-courses");
const courseMessage = document.getElementById("course-message");

let courseList = {};

async function fetchCourses() {
  courseMessage.innerHTML = "";
  const res = await fetch(window.location.protocol + "//" + window.location.host + "/course-list", {
     method: "GET"
   });

   if (res.status != 200) {
     courseMessage.innerHTML = "Ocorreu um erro, tente novamente";
     return;
   }

   try {
     courseList = JSON.parse(await res.text());
   } catch (e) {
    courseMessage.innerHTML = "Ocorreu um erro, tente novamente";
     courseList = undefined;
     return;
   }

}