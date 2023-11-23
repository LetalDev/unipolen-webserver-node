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