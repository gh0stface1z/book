const caderno = document.getElementById("caderno");

let abrindo = false;

caderno.addEventListener("click", () => {

  if (abrindo) return;

  abrindo = true;

  caderno.classList.add("abrindo");

  setTimeout(() => {

    /*
      Depois vamos trocar isso para:
      window.location.href = "scrapbook.html";
    */

    console.log("Abrir scrapbook");

  }, 800);

});
