/* CONFIGURAÇÃO */
const API_URL =
  "https://script.google.com/macros/s/AKfycbyYKhWbEDTLrl2kyCofLlsX4DLmiy5xQJ8kzc2emK9TGd6DkFkILyMalTEQeQZNs2bh/exec";

const TENTATIVAS_GET = 3;
const ESPERA_ENTRE_TENTATIVAS_MS = 1500;

const WHATSAPP_NUMERO = ""; // WhatsApp da ONG

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

function esperar(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

/* BUSCA DA LISTA (GET) - até 3 tentativas
   Só vale para o GET. O POST NUNCA é repetido automaticamente. */
async function buscarAnimaisComTentativas() {
  for (let tentativa = 1; tentativa <= TENTATIVAS_GET; tentativa++) {
    try {
      const resposta = await fetch(API_URL);
      if (!resposta.ok) throw new Error("HTTP " + resposta.status);

      const texto = await resposta.text();
      const dados = JSON.parse(texto); // se vier página HTML, dá erro aqui
      if (!Array.isArray(dados)) throw new Error("A resposta não é uma lista");

      return dados;
    } catch (erro) {
      console.warn(
        "Tentativa " + tentativa + " de buscar animais falhou:",
        erro,
      );
      if (tentativa < TENTATIVAS_GET) {
        await esperar(ESPERA_ENTRE_TENTATIVAS_MS);
      }
    }
  }
  throw new Error("As " + TENTATIVAS_GET + " tentativas falharam");
}

/* VITRINE (só roda em index.html) */
let todosOsAnimais = [];

function iniciarVitrine() {
  const grade = document.getElementById("grade-animais");
  const aviso = document.getElementById("aviso-vitrine");
  const botaoTentar = document.getElementById("botao-tentar");
  const busca = document.getElementById("busca-nome");
  const filtroEspecie = document.getElementById("filtro-especie");
  const filtroIdade = document.getElementById("filtro-idade");

  let carregou = false; // só filtra depois que a lista chegou

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

    let botao;
    if (/^\d{12,13}$/.test(WHATSAPP_NUMERO)) {
      // Com número válido: link que abre o WhatsApp com mensagem pronta
      const mensagem = "Olá! Tenho interesse em adotar o " + animal.nome + ".";
      botao = document.createElement("a");
      botao.href =
        "https://wa.me/" +
        WHATSAPP_NUMERO +
        "?text=" +
        encodeURIComponent(mensagem);
      botao.target = "_blank";
      botao.rel = "noopener";
    } else {
      // Sem número configurado: botão sem ação (como antes)
      botao = document.createElement("button");
      botao.type = "button";
    }
    botao.className = "card__botao";
    botao.textContent = "Adote-me";

    corpo.append(nome, info, botao);
    card.append(foto, corpo);
    return card;
  }

  function mostrarAnimais() {
    if (!carregou) return;

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
    carregou = false;
    botaoTentar.hidden = true;
    grade.replaceChildren();
    mostrarAviso("Carregando animais...");

    try {
      todosOsAnimais = await buscarAnimaisComTentativas();
      carregou = true;
      mostrarAnimais();
    } catch (erro) {
      console.error("Não foi possível carregar a vitrine:", erro);
      mostrarAviso("Não foi possível carregar os animais");
      botaoTentar.hidden = false;
    }
  }

  busca.addEventListener("input", mostrarAnimais);
  filtroEspecie.addEventListener("change", mostrarAnimais);
  filtroIdade.addEventListener("change", mostrarAnimais);
  botaoTentar.addEventListener("click", carregarAnimais);

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
  let enviando = false; // trava contra clique duplo

  // comLinkVitrine: usado quando o resultado é incerto
  function mostrarMensagem(texto, tipo, comLinkVitrine) {
    mensagem.textContent = texto;
    if (comLinkVitrine) {
      const link = document.createElement("a");
      link.href = "index.html";
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Abrir a vitrine";
      mensagem.append(" ", link);
    }
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

          // Fundo branco: PNG transparente viraria preto no JPEG
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(imagem, 0, 0, canvas.width, canvas.height);

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

  // Aceita "2026-10" (seletor de mês) ou "10/2026" (navegador sem seletor).
  // Devolve "MM/AAAA", "" se vazio, ou null se o formato for inválido.
  function formatarMes(valor) {
    valor = valor.trim();
    if (!valor) return "";
    const iso = valor.match(/^(\d{4})-(\d{2})$/);
    if (iso) return iso[2] + "/" + iso[1];
    if (/^(0[1-9]|1[0-2])\/\d{4}$/.test(valor)) return valor;
    return null;
  }

  function valorSelecionado(nomeCampo) {
    const marcado = form.querySelector(
      'input[name="' + nomeCampo + '"]:checked',
    );
    return marcado ? marcado.value : "";
  }

  // Monta o objeto com os nomes exatos que a API espera (sem "acao")
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

  // Devolve a mensagem do primeiro problema, ou "" se está tudo ok
  function validar(dados) {
    if (!dados.nome) return "Preencha o nome do animal.";
    if (dados.mesEntrada === null)
      return "Informe o mês no formato MM/AAAA (ex.: 10/2026).";
    if (!dados.especie) return "Escolha a espécie.";
    if (!dados.sexo) return "Escolha o sexo.";
    if (!dados.faixaEtaria) return "Escolha a faixa etária.";
    if (!dados.origem) return "Escolha a origem.";
    if (!dados.status) return "Escolha o status.";
    if (!dados.senha) return "Digite a senha de acesso.";
    return "";
  }

  // Códigos de erro da API (só para respostas com sucesso: false)
  const MENSAGENS_ERRO = {
    nao_autorizado: "Senha incorreta.",
    foto_muito_grande: "A foto é muito grande. Tente outra.",
    tipo_de_imagem_invalido: "Tipo de imagem não aceito. Use JPG ou PNG.",
  };

  const ROTULOS_CAMPOS = {
    nome: "nome do animal",
    especie: "espécie",
    sexo: "sexo",
    faixaEtaria: "faixa etária",
    origem: "origem",
    status: "status",
    senha: "senha",
  };

  function traduzirErro(codigo) {
    codigo = String(codigo || "");
    if (MENSAGENS_ERRO[codigo]) return MENSAGENS_ERRO[codigo];

    if (codigo.startsWith("campo_obrigatorio_")) {
      const campo = codigo.replace("campo_obrigatorio_", "");
      return "Preencha o campo: " + (ROTULOS_CAMPOS[campo] || campo) + ".";
    }
    if (codigo.startsWith("valor_invalido_")) {
      const campo = codigo.replace("valor_invalido_", "");
      return (
        "Valor inválido no campo: " + (ROTULOS_CAMPOS[campo] || campo) + "."
      );
    }
    // Erro confirmado, mas com código que não conhecemos
    console.warn("Código de erro desconhecido:", codigo);
    return "O cadastro não foi salvo. Confira os dados e tente de novo.";
  }

  form.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    if (enviando) return; // clique duplo
    esconderMensagem();

    const dados = coletarDados();
    const erroValidacao = validar(dados);
    if (erroValidacao) {
      mostrarMensagem(erroValidacao, "erro");
      return;
    }

    enviando = true;
    botao.disabled = true;
    botao.textContent = "Salvando...";

    try {
      // O POST é enviado UMA vez só. Nunca repetimos automaticamente.
      let resultado = null;
      let textoResposta = "";

      try {
        // Sem header Content-Type, senão dá erro de CORS
        const resposta = await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify(dados),
        });
        textoResposta = await resposta.text();
        resultado = JSON.parse(textoResposta);
      } catch (falha) {
        // falha de rede ou resposta que não é JSON (ex.: página HTML)
        console.error("Falha ao enviar/ler a resposta do cadastro:", falha);
        resultado = null;
      }

      const ehObjeto =
        resultado !== null &&
        typeof resultado === "object" &&
        !Array.isArray(resultado);

      if (ehObjeto && resultado.sucesso === true) {
        // 1) Deu certo
        const senha = dados.senha; // mantém a senha para o próximo cadastro
        form.reset();
        fotoBase64 = "";
        previa.hidden = true;
        previa.removeAttribute("src");
        form.senha.value = senha;
        mostrarMensagem(
          "Animal cadastrado com sucesso!" +
            (resultado.id ? " (ID " + resultado.id + ")" : ""),
          "sucesso",
        );
      } else if (ehObjeto && resultado.sucesso === false) {
        // 2) Erro confirmado: NÃO limpa o formulário e deixa tentar de novo
        mostrarMensagem(traduzirErro(resultado.erro), "erro");
      } else {
        // 3) Resultado incerto: pode ter gravado. Não reenvia.
        console.error(
          "Resposta inesperada da API (primeiros 500 caracteres):",
          textoResposta.slice(0, 500),
        );
        mostrarMensagem(
          "Não conseguimos confirmar o cadastro. Confira a lista antes de tentar de novo.",
          "erro",
          true,
        );
      }
    } finally {
      enviando = false;
      botao.disabled = false;
      botao.textContent = "Salvar Cadastro";
    }
  });
}

if (document.getElementById("form-cadastro")) {
  iniciarCadastro();
}

/* MENU RESPONSIVO DO CABEÇALHO (roda em qualquer página com cabeçalho) */
function iniciarMenu() {
  const cabecalho = document.querySelector(".cabecalho");
  const botao = cabecalho && cabecalho.querySelector(".menu-botao");
  const menu = cabecalho && cabecalho.querySelector(".menu");
  if (!botao || !menu) return;

  // Só agora o CSS recolhe o menu: sem JavaScript, os links ficam visíveis
  cabecalho.classList.add("cabecalho--js");

  function definirAberto(aberto) {
    cabecalho.classList.toggle("cabecalho--aberto", aberto);
    botao.setAttribute("aria-expanded", String(aberto));
  }

  botao.addEventListener("click", function () {
    definirAberto(botao.getAttribute("aria-expanded") !== "true");
  });

  // Esc fecha o menu e devolve o foco ao botão
  cabecalho.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && botao.getAttribute("aria-expanded") === "true") {
      definirAberto(false);
      botao.focus();
    }
  });

  // Clicar num link fecha o menu (útil para links de âncora na mesma página)
  menu.addEventListener("click", function (evento) {
    if (evento.target.closest("a")) definirAberto(false);
  });

  // Ao voltar para tela larga, o menu aberto deixa de fazer sentido
  window.matchMedia("(min-width: 768px)").addEventListener("change", function (e) {
    if (e.matches) definirAberto(false);
  });
}

iniciarMenu();
