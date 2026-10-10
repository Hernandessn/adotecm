/* CONFIGURAÇÃO */
const API_URL =
  "https://script.google.com/macros/s/AKfycbyYKhWbEDTLrl2kyCofLlsX4DLmiy5xQJ8kzc2emK9TGd6DkFkILyMalTEQeQZNs2bh/exec";

// Imagem padrão (usada quando o animal não tem foto ou a foto não carrega)
const FOTO_PADRAO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">' +
      '<rect width="100%" height="100%" fill="#d9dee5"/>' +
      '<text x="50%" y="50%" font-family="sans-serif" font-size="22" ' +
      'fill="#5b6778" text-anchor="middle" dominant-baseline="middle">' +
      "Sem foto</text></svg>",
  );

/* VITRINE (só roda em index.html) */
let todosOsAnimais = [];

function iniciarVitrine() {
  const grade = document.getElementById("grade-animais");
  const aviso = document.getElementById("aviso-vitrine");
  const busca = document.getElementById("busca-nome");
  const filtroEspecie = document.getElementById("filtro-especie");
  const filtroIdade = document.getElementById("filtro-idade");

  function mostrarAviso(texto) {
    aviso.textContent = texto;
    aviso.hidden = false;
  }

  function esconderAviso() {
    aviso.hidden = true;
  }

  // Tira acentos e maiúsculas, para a busca achar "Cão" digitando "cao"
  function normalizar(texto) {
    return String(texto)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  // Pega o ID do arquivo no link do Drive
  function extrairIdDrive(link) {
    const resultado =
      String(link).match(/[?&]id=([^&]+)/) ||
      String(link).match(/\/d\/([^/]+)/);
    return resultado ? resultado[1] : null;
  }

  function criarCard(animal) {
    const card = document.createElement("article");
    card.className = "card";

    const foto = document.createElement("img");
    foto.className = "card__foto";
    foto.alt = "Foto de " + animal.nome;
    foto.src = animal.foto ? animal.foto : FOTO_PADRAO;

    // Se a foto não carregar: 1º tenta o link thumbnail, 2º usa a padrão
    foto.addEventListener("error", function () {
      const id = extrairIdDrive(animal.foto);
      if (id && !foto.dataset.tentouThumbnail) {
        foto.dataset.tentouThumbnail = "sim";
        foto.src = "https://drive.google.com/thumbnail?id=" + id + "&sz=w800";
      } else {
        foto.src = FOTO_PADRAO;
      }
    });

    const corpo = document.createElement("div");
    corpo.className = "card__corpo";

    const nome = document.createElement("h2");
    nome.className = "card__nome";
    nome.textContent = animal.nome;

    const info = document.createElement("p");
    info.className = "card__info";
    const idade = animal.idadeAproximada || animal.faixaEtaria;
    info.textContent = "Espécie: " + animal.especie + " | " + idade;

    const botao = document.createElement("button");
    botao.className = "card__botao";
    botao.type = "button";
    botao.textContent = "Adote-me";

    corpo.append(nome, info, botao);
    card.append(foto, corpo);
    return card;
  }

  function mostrarAnimais() {
    const textoBusca = normalizar(busca.value);
    const especie = filtroEspecie.value;
    const faixa = filtroIdade.value;

    const filtrados = todosOsAnimais.filter(function (animal) {
      const passaNome = normalizar(animal.nome).includes(textoBusca);
      const passaEspecie = !especie || animal.especie === especie;
      const passaFaixa = !faixa || animal.faixaEtaria === faixa;
      return passaNome && passaEspecie && passaFaixa;
    });

    grade.replaceChildren();

    if (todosOsAnimais.length === 0) {
      mostrarAviso("Nenhum animal disponível no momento");
      return;
    }
    if (filtrados.length === 0) {
      mostrarAviso("Nenhum animal encontrado com esses filtros");
      return;
    }

    esconderAviso();
    filtrados.forEach(function (animal) {
      grade.appendChild(criarCard(animal));
    });
  }

  async function carregarAnimais() {
    mostrarAviso("Carregando animais...");
    try {
      const resposta = await fetch(API_URL);
      const dados = await resposta.json();

      if (!Array.isArray(dados)) {
        throw new Error("Resposta inesperada da API");
      }
      todosOsAnimais = dados;
      mostrarAnimais();
    } catch (erro) {
      console.error("Erro ao carregar a vitrine:", erro);
      mostrarAviso(
        "Não foi possível carregar os animais. Tente novamente mais tarde.",
      );
    }
  }

  busca.addEventListener("input", mostrarAnimais);
  filtroEspecie.addEventListener("change", mostrarAnimais);
  filtroIdade.addEventListener("change", mostrarAnimais);

  carregarAnimais();
}

if (document.getElementById("grade-animais")) {
  iniciarVitrine();
}

/* CADASTRO (só roda em cadastro.html) */
function iniciarCadastro() {
  const form = document.getElementById("form-cadastro");
  const inputFoto = document.getElementById("foto");
  const previa = document.getElementById("previa-foto");
  const mensagem = document.getElementById("mensagem-form");
  const botao = document.getElementById("botao-salvar");

  let fotoBase64 = ""; // foto já reduzida, pronta para enviar

  function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = "formulario__mensagem formulario__mensagem--" + tipo;
    mensagem.hidden = false;
  }

  function esconderMensagem() {
    mensagem.hidden = true;
  }

  // Reduz a foto para ~1000px de largura e converte para JPEG
  function reduzirFoto(arquivo) {
    return new Promise(function (resolve, reject) {
      const leitor = new FileReader();
      leitor.onerror = reject;
      leitor.onload = function () {
        const imagem = new Image();
        imagem.onerror = reject;
        imagem.onload = function () {
          const larguraMax = 1000;
          const escala = Math.min(1, larguraMax / imagem.width);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(imagem.width * escala);
          canvas.height = Math.round(imagem.height * escala);
          canvas
            .getContext("2d")
            .drawImage(imagem, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        imagem.src = leitor.result;
      };
      leitor.readAsDataURL(arquivo);
    });
  }

  // Quando a Nívea escolhe a foto: reduz e mostra a prévia
  inputFoto.addEventListener("change", async function () {
    const arquivo = inputFoto.files[0];
    fotoBase64 = "";
    previa.hidden = true;
    if (!arquivo) return;

    try {
      fotoBase64 = await reduzirFoto(arquivo);
      previa.src = fotoBase64;
      previa.hidden = false;
    } catch (erro) {
      console.error("Erro ao processar a foto:", erro);
      inputFoto.value = "";
      mostrarMensagem("Não foi possível ler essa foto. Tente outra.", "erro");
    }
  });

  // Converte "2026-10" (do input) em "10/2026" (o que a API quer)
  function formatarMes(valor) {
    if (!valor) return "";
    const partes = valor.split("-");
    return partes[1] + "/" + partes[0];
  }

  function valorSelecionado(nomeCampo) {
    const marcado = form.querySelector(
      'input[name="' + nomeCampo + '"]:checked',
    );
    return marcado ? marcado.value : "";
  }

  // Monta o objeto com os nomes exatos que a API espera
  function coletarDados() {
    return {
      nome: form.nome.value.trim(),
      mesEntrada: formatarMes(form.mesEntrada.value),
      especie: valorSelecionado("especie"),
      sexo: valorSelecionado("sexo"),
      faixaEtaria: valorSelecionado("faixaEtaria"),
      idadeAproximada: form.idadeAproximada.value.trim(),
      origem: valorSelecionado("origem"),
      status: valorSelecionado("status"),
      foto: fotoBase64,
      senha: form.senha.value,
    };
  }

  // Devolve a mensagem do primeiro campo faltando, ou "" se está tudo ok
  function validar(dados) {
    if (!dados.nome) return "Preencha o nome do animal.";
    if (!dados.especie) return "Escolha a espécie.";
    if (!dados.sexo) return "Escolha o sexo.";
    if (!dados.faixaEtaria) return "Escolha a faixa etária.";
    if (!dados.origem) return "Escolha a origem.";
    if (!dados.status) return "Escolha o status.";
    if (!dados.senha) return "Digite a senha de acesso.";
    return "";
  }

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    esconderMensagem();

    const dados = coletarDados();
    const erro = validar(dados);
    if (erro) {
      mostrarMensagem(erro, "erro");
      return;
    }

    // O envio (POST) entra na parte 2. Por enquanto, só confere os dados.
    const copia = Object.assign({}, dados, {
      senha: "***",
      foto: dados.foto ? "(foto de " + dados.foto.length + " caracteres)" : "",
    });
    console.log("Dados prontos para enviar:", copia);
    mostrarMensagem("Dados válidos! (envio ainda não ligado)", "sucesso");
  });
}

if (document.getElementById("form-cadastro")) {
  iniciarCadastro();
}
