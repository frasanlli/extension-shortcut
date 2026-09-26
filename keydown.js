const arrayElements = ["button", "a", "input", "textarea"]; //, "select"];

function procesarElementos() {
let contadorA = 1;
  let contadorB = 1;

  for (const element of arrayElements) {
    let webElements = document.querySelectorAll(element);
    webElements.forEach((element) => {
      const name = element.getAttribute("name");
      if (name) {
        element.placeholder = " [" + name + "]";
      } else {
        const tagName = element.tagName.toLowerCase();
        if (tagName === "a") {
          element.textContent += " [a" + contadorA + "]";
          contadorA++;
        } else if (tagName === "button") {
          element.textContent += " [b" + contadorB + "]";
          contadorB++;
        }
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  procesarElementos();
});

let buffer = "";

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    for (const element of arrayElements) {
      let webElement = [...document.querySelectorAll(element)].find((b) => {
        const texto = b.textContent.trim().toLowerCase();
        const name = b.getAttribute("name")?.toLowerCase();
        const buscado = buffer.toLowerCase();
        const matches = [...texto.matchAll(/\[([^\]]+)\]/g)];
        return (
          texto === buscado ||
          name === buscado ||
          matches.some((match) => match[1].toLowerCase() === buscado)
        );
      });
      if (webElement) {
        webElement.click();
        console.log(buffer.toLowerCase() + " pulsado");
        break;
      }
    }
    console.log(buffer.toLowerCase() + " no encontrado");
    buffer = "";
  } else if (event.key === "Backspace") {
    buffer = buffer.slice(0, -1);
  } else {
    buffer += event.key;
  }
});
