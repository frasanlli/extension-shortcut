const arrayElements = ["button", "a", "input", "textarea", "select"];

// --------------------------------------------------
// COUNTERS
// --------------------------------------------------

let contadorA = 1;
let contadorB = 1;
let contadorC = 1;
let contadorD = 1;

// --------------------------------------------------
// UTILITY FUNCTIONS
// --------------------------------------------------

function obtenerElementos() {
  return arrayElements.flatMap((selector) => [
    ...document.querySelectorAll(selector),
  ]);
}

function obtenerTexto(element) {
  const tagName = element.tagName.toLowerCase();

  if (tagName === "input" || tagName === "textarea") {
    return element.placeholder;
  }

  if (tagName === "select") {
    return element.getAttribute("name");
  }

  return element.textContent.trim().toLowerCase();
}

function obtenerTagName(element) {
  return element.tagName.toLowerCase();
}

// --------------------------------------------------
// ELEMENT PROCESSING
// --------------------------------------------------

function añadirIdentificador(element) {
  // Prevent the same element from being processed twice
  if (element.dataset.extensionProcesado === "true") {
    return;
  }
  const tagName = obtenerTagName(element);

  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    if (tagName === "select") {
        const etiqueta = document.createElement("span");
        element.setAttribute("name", "[s" + contadorD + "]");
        etiqueta.textContent = " [s" + contadorD + "]";
        element.insertAdjacentElement("afterend", etiqueta);
        contadorD++;
    }else{
        element.placeholder = "[i" + contadorC + "]";
        contadorC++;
    }

  } else if (tagName === "a") {
    element.textContent += "[a" + contadorA + "]";
    contadorA++;
  } else if (tagName === "button") {
    element.textContent += " [b" + contadorB + "]";
    contadorB++;
  }

  // Mark as processed
  element.dataset.extensionProcesado = "true";
}

function procesarElementos() {
  const elementos = obtenerElementos();

  elementos.forEach((element) => {
    añadirIdentificador(element);
  });
}

// --------------------------------------------------
// SEARCH
// --------------------------------------------------

function coincideConBuscado(element, buscado) {
  const texto = obtenerTexto(element);

  const matches = [...texto.matchAll(/\[([^\]]+)\]/g)];

  const identificadores = matches.map((match) => match[1].toLowerCase());

  return texto === buscado || identificadores.includes(buscado);
}

function buscarElemento(buscado) {
  const elementos = obtenerElementos();

  return elementos.find((element) => coincideConBuscado(element, buscado));
}

// --------------------------------------------------
// DOM + OBSERVER
// --------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
  // Process initial elements
  procesarElementos();

  console.log("DOM cargado");

  // Observer for elements added later
  const observer = new MutationObserver(function (mutations) {
    let hayNuevosElementos = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        hayNuevosElementos = true;
        break;
      }
    }

    if (hayNuevosElementos) {
      procesarElementos();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});

// --------------------------------------------------
// KEYBOARD
// --------------------------------------------------

let buffer = "";

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const buscado = buffer.toLowerCase();

    const webElement = buscarElemento(buscado);

    if (webElement) {
        console.log(webElement.tagName.toLowerCase());

      if (webElement.tagName.toLowerCase() === "input" || webElement.tagName.toLowerCase() === "textarea") {
        webElement.focus();
        console.log(buscado + " foco");

      } else if (webElement.tagName.toLowerCase() === "select") {
        webElement.showPicker();
        console.log(buscado + " select");

      } else {
        webElement.click();
        console.log(buscado + " pulsado");

      }
    } else {
      console.log(buscado + " no encontrado");
    }

    buffer = "";

    return;
  }

  if (event.key === "Backspace") {
    buffer = buffer.slice(0, -1);

    return;
  }

  if (event.key.length === 1) {
    buffer += event.key;
  }
});

