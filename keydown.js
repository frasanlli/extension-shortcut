
const arrayElements = ["button", "a", "input", "textarea"]; //, "select"];

// --------------------------------------------------
// CONTADORES
// --------------------------------------------------

let contadorA = 1;
let contadorB = 1;
let contadorC = 1;

// --------------------------------------------------
// FUNCIONES DE UTILIDAD
// --------------------------------------------------

function obtenerElementos() {

    return arrayElements.flatMap(selector =>
        [...document.querySelectorAll(selector)]
    );

}


function obtenerTexto(element) {

    return element.textContent.trim().toLowerCase();

}


function obtenerTagName(element) {

    return element.tagName.toLowerCase();

}


// --------------------------------------------------
// PROCESAMIENTO DE ELEMENTOS
// --------------------------------------------------

function añadirIdentificador(element) {

    // Evitar procesar el mismo elemento dos veces
    if (element.dataset.extensionProcesado === "true") {
        return;
    }
    const tagName = obtenerTagName(element);

    if (tagName === "input" || tagName === "textarea") {

        element.placeholder = "[i" + contadorC +"]" ;
        contadorC++

    } else if (tagName === "a") {

        element.textContent += "[a" + contadorA + "]";
        contadorA++;

    } else if (tagName === "button") {

        element.textContent += " [b" + contadorB + "]";
        contadorB++;

    }

    // Marcar como procesado
    element.dataset.extensionProcesado = "true";

}


function procesarElementos() {

    const elementos = obtenerElementos();

    elementos.forEach(element => {
        añadirIdentificador(element);
    });

}


// --------------------------------------------------
// BÚSQUEDA
// --------------------------------------------------

function coincideConBuscado(element, buscado) {

    const texto = obtenerTexto(element);

    const matches = [
        ...texto.matchAll(/\[([^\]]+)\]/g)
    ];

    const identificadores = matches.map(match =>
        match[1].toLowerCase()
    );

    return (
        texto === buscado ||
        identificadores.includes(buscado)
    );

}


function buscarElemento(buscado) {

    const elementos = obtenerElementos();

    return elementos.find(element =>
        coincideConBuscado(element, buscado)
    );

}


// --------------------------------------------------
// DOM + OBSERVER
// --------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {

    // Procesar elementos iniciales
    procesarElementos();

    console.log("DOM cargado");


    // Observer para elementos añadidos posteriormente
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
        subtree: true

    });

});


// --------------------------------------------------
// TECLADO
// --------------------------------------------------

let buffer = "";

document.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        const buscado = buffer.toLowerCase();

        const webElement = buscarElemento(buscado);

        if (webElement) {

            webElement.click();

            console.log(buscado + " pulsado");

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

