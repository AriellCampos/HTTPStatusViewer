document.addEventListener("DOMContentLoaded", initApp);

/**
 * Função principal que inicializa o app
 */
function initApp() {
  const form = document.getElementById("statusForm");
  const submitBtn = document.getElementById("submitBtn");
  const resultDiv = document.getElementById("result");

  initFormValidation(form, submitBtn);
  initFormSubmitHandler(form, resultDiv);
}

/**
 * Inicializa a validação do formulário para habilitar/desabilitar o botão
 */
function initFormValidation(form, submitBtn) {
  const toggleSubmit = () => {
    submitBtn.disabled = !form.checkValidity();
  };

  form.addEventListener("input", toggleSubmit);
  toggleSubmit(); // Estado inicial
}

/**
 * Registra o manipulador de envio do formulário
 */
function initFormSubmitHandler(form, resultDiv) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    resultDiv.innerHTML = "";

    const { code, source } = getFormData();
    const urls = buildUrls(code, source);

    await handleRequests(urls, resultDiv);
  });
}

/**
 * Lida com as requisições e exibição das imagens
 */
async function handleRequests(urls, container) {
  for (const url of urls) {
    if (url.includes("http.cat")) {
      displayImageFromUrl(url, container);
    } else {
      try {
        const blob = await fetchImage(url);
        displayImage(blob, container);
      } catch (error) {
        displayError(error, container);
        // handleError(url, container);
      }
    }
  }
}

/**
 * Captura os dados preenchidos no formulário
 */
function getFormData() {
  const code = document.getElementById("code").value.trim();
  const source = document.querySelector('input[name="source"]:checked').value;
  return { code, source };
}

/**
 * Constrói as URLs com base na opção selecionada
 */
function buildUrls(code, source) {
  const urls = [];

  switch (source) {
    case "dog":
      urls.push(`https://http.dog/${code}.jpg`);
      break;
    case "cat":
      urls.push(`https://http.cat/${code}.jpg`);
      break;
    case "both":
      urls.push(`https://http.dog/${code}.jpg`);
      urls.push(`https://http.cat/${code}.jpg`);
      break;
  }

  return urls;
}

/**
 * Faz o fetch da imagem e retorna o blob
 */
async function fetchImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao buscar: ${url}`);
  }
  return await response.blob();
}

/**
 * Exibe a imagem diretamente no DOM
 * Usado para imagens que não necessitam de fetch (como http.cat)
 */
function displayImageFromUrl(url, container) {
  const img = document.createElement("img");
  img.src = url;
  img.alt = "Imagem HTTP Status";
  container.appendChild(img);
}

/**
 * Exibe a imagem no DOM
 * Usado para imagens que foram recuperadas com fetch
 */
function displayImage(blob, container) {
  const imgURL = URL.createObjectURL(blob);
  const img = document.createElement("img");
  img.src = imgURL;
  img.alt = "Imagem HTTP Status";
  container.appendChild(img);
}

/**
 * Exibe mensagem de erro no DOM
 */
function displayError(error, container) {
  const message = document.createElement("p");
  message.textContent = error.message;
  message.style.color = "red";
  message.style.fontWeight = "bold";
  container.appendChild(message);
}

/**
 * Remove o que vem depois da última barra (inclusive)
 */
function removePathEnd(url) {
  return url.substring(0, url.lastIndexOf("/") + 1);
}

/**
 * Concatena um novo arquivo ao final da URL
 */
function appendFilename(baseUrl, filename) {
  return `${baseUrl}${filename}`;
}

/**
 * Cuida do erro retornado pela API para chamar a imagem 404
 */
function handleError(originalUrl, resultDiv) {
  const baseUrl = removePathEnd(originalUrl);
  const newUrl = appendFilename(baseUrl, "404.jpg");
  displayImageFromUrl(newUrl, resultDiv);
}
