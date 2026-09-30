const arrayElements = ["button", "a", "input", "textarea", "select"];

// --------------------------------------------------
// COUNTERS
// --------------------------------------------------

let contadorA = 1;
let contadorB = 1;
let contadorI = 1;
let contadorS = 1;

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

function checkTimeLink(text) {
  const timePattern = /^\d+:\d{2}$/
  if (text.includes(timePattern)) {
    if (document.title.includes("youtube")) {
      return true
    }
  }
  return false
}

function createSpan(element, letter, contador){
  const etiqueta = document.createElement("span");
  element.setAttribute("name", "[" + letter + contador + "]");
  etiqueta.textContent = " [" + letter + contador + "]";
  if (letter === "a") {
    element.appendChild(etiqueta);
  }else{
    element.insertAdjacentElement("afterend", etiqueta);
  }

}

function añadirIdentificador(element) {
  // Prevent the same element from being processed twice
  if (element.dataset.extensionProcesado === "true") {
    return;
  }
  const tagName = obtenerTagName(element);

  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    if (tagName === "select") {
        createSpan(element,"s", contadorS);
        contadorS++;
    }else{
        element.placeholder = "[i" + contadorI + "]";
        contadorI++;
    }

  } else if (tagName === "a") {
    if (element.textContent.trim() === ""){ //|| checkTimeLink(element.textContent.trim())) {
      createSpan(element,"a", contadorA);
      contadorA++;
    }else{
      element.textContent += "[a" + contadorA + "]";
      contadorA++;
    }
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
// VISUALIZATION
// --------------------------------------------------

function obtenerFondo() {
    let colorReal = document.body;

    while (colorReal) {
        const color = getComputedStyle(colorReal).backgroundColor;

        if (color !== "rgba(0, 0, 0, 0)" &&
            color !== "transparent") {
            return color;
        }

        colorReal = colorReal.parentElement;
    }

    return "rgb(255, 255, 255)";
}

function actualizarDiv(buffer) {
    const div = document.getElementById("ShortcutBuffer");
    const bgColor = obtenerFondo();
    console.log("Color de fondo del body: " + bgColor);

    // Extraer RGB
    const match = bgColor.match(/\d+/g);
    const [r, g, b] = match ? match.map(Number) : [255, 255, 255];

    // Invertir RGB
    const inverted = `rgb(${255 - r}, ${255 - g}, ${255 - b})`;

    Object.assign(div.style, {
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "12px",
        backgroundColor: inverted,
        color: bgColor,
        borderRadius: "8px",
        zIndex: "9999",
        fontFamily: "Arial, sans-serif"
    });

    div.textContent = buffer;
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


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", (event) => {
      console.log("DOM fully loaded and parsed");
    });
} else {
    iniciar();
}

function iniciar() {
  const div = document.createElement("div");
  div.id = "ShortcutBuffer";
  document.body.appendChild(div);

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
};

// --------------------------------------------------
// KEYBOARD
// --------------------------------------------------

let buffer = "";

function checkBuffer(buffer) {
  const patron = /^[A-Za-z]\d+$/;

  if (!buffer.match(patron) && buffer.length > 3) {
    buffer = "";
  }
  return buffer;
}

function tryBuffer(){
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
  actualizarDiv(buffer)

  return;

}

document.addEventListener("keydown", function (event) {
  console.log("Tecla presionada: " + event.key);
  if (buffer.length > 3) {
    buffer = checkBuffer(buffer);
  }

  if (event.key === "Control") {
    tryBuffer()
  }

  if (event.key === "Backspace") {
    buffer = buffer.slice(0, -1);

    return;
  }

  if (event.key.length === 1) {
    buffer += event.key;
    actualizarDiv(buffer)
  }
});

