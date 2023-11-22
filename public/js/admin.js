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

const selectCourse = document.getElementById("select-course");
const manageCourse = document.getElementById("manage-course");
const courseName = document.getElementById("course-name");
const courseProvider = document.getElementById("course-provider");
const courseMonths = document.getElementById("course-months");
const courseHours = document.getElementById("course-hours");
const courseUrl = document.getElementById("course-url");
const courseAvailable = document.getElementById("course-available");
const courseDegree = document.getElementById("course-degree");
const courseQualification = document.getElementById("course-qualification");
const courseStyle = document.getElementById("course-style");
var courseList = undefined;
var providerList = undefined;

selectCourse.onfocus = async () => {
  if (courseList != undefined) {
    return;
  }

  while (selectCourse.firstElementChild != null) {
    selectCourse.removeChild(selectCourse.firstElementChild);
  }
  node = document.createElement("option");
  node.setAttribute("disabled", "");
  node.innerHTML = "Carregando.."
  selectCourse.append(node);

   const res = await fetch(window.location.protocol + "//" + window.location.host + "/course-list", {
     method: "GET"
   });

   if (res.status != 200) {
     selectCourse.firstElementChild.innerHTML = "Ocorreu um erro, tente novamente";
     return;
   }

   try {
     courseList = JSON.parse(await res.text());
   } catch (e) {
     selectCourse.firstElementChild.innerHTML = "Ocorreu um erro, tente novamente";
     courseList = undefined;
     return;
   }

//  courseList = [{"name": "a"},{"name": "b"},{"name": "c"},{"name": "d"}];

  selectCourse.firstElementChild.innerHTML = "";
  selectCourse.firstElementChild.attributes.removeNamedItem("disabled");
  for (course of courseList) {
    let node = document.createElement("option");
    node.innerHTML = course.name;
    selectCourse.appendChild(node)
  }
};

selectCourse.onchange = () => {
  if (courseList == undefined) return;

  let idx = selectCourse.selectedIndex;

  if (idx <= 0) {
    manageCourse.setAttribute("hidden", "");
    return;
  }

  idx--;

  manageCourse.removeAttribute("hidden");

  courseName.value = courseList[idx].name || "";
  courseMonths.value = courseList[idx].duration_months || 0;
  courseHours.value = courseList[idx].hours || 0;
  courseUrl.value = courseList[idx].url || "";

  if (courseList[idx].available) courseAvailable.setAttribute("checked", "");
  else courseAvailable.removeAttribute("checked");

  if (courseList[idx].degree == "Graduação") courseDegree.selectedIndex = 1;
  else if (courseList[idx].degree == "Pós-Graduação") courseDegree.selectedIndex = 2;
  else courseDegree.selectedIndex = 0;

  if (courseList[idx].qualification == "2ª Licenciatura") courseQualification.selectedIndex = 1;
  else if (courseList[idx].qualification == "Bacharelado") courseQualification.selectedIndex = 2;
  else if (courseList[idx].qualification == "Tecnólogo") courseQualification.selectedIndex = 3;
  else courseQualification.selectedIndex = 0;

  if (courseList[idx].style == "A distância") courseStyle.selectedIndex = 1;
  else courseStyle.selectedIndex = 0;

  if (courseDegree.selectedIndex == 1) courseQualification.removeAttribute("disabled");
  else courseQualification.setAttribute("disabled", "");
}

courseDegree.onchange = () => {
  if (courseDegree.selectedIndex == 1) courseQualification.removeAttribute("disabled");
  else courseQualification.setAttribute("disabled", "");
}