const API_URL = "https://script.google.com/macros/s/AKfycbyYKhWbEDTLrl2kyCofLlsX4DLmiy5xQJ8kzc2emK9TGd6DkFkILyMalTEQeQZNs2bh/exec";
const OPCOES = {
  especie: ["Cão", "Gato"],
  sexo: ["Macho", "Fêmea"],
  faixaEtaria: ["Menos de 6 meses", "Mais de 6 meses"],
  origem: ["Encontrado na rua", "Entregue por tutor"],
  status: ["Não adotado", "Adotado"]
};
const ERROS = {
  nao_autorizado: "Senha incorreta.",
  nome_vazio: "O nome não pode ficar vazio.",
  animal_nao_encontrado: "Animal não encontrado. A lista foi atualizada.",
  foto_muito_grande: "A foto é muito grande.",
  tipo_de_imagem_invalido: "Use uma imagem JPG, PNG ou WebP.",
  id_obrigatorio: "Animal sem identificação."
};
const $ = id => document.getElementById(id);
const norm = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
let senha = sessionStorage.getItem("senha") || "", animais = [], ocupado = false, editando = null, fotoNova = "", tt;

function el(tag, props, ...filhos) {
  const n = document.createElement(tag);
  Object.assign(n, props || {});
  filhos.flat().filter(Boolean).forEach(f => n.append(f));
  return n;
}
function aviso(texto, erro) {
  const b = $("toast");
  b.textContent = texto;
  b.className = erro ? "erro" : "";
  b.style.display = "block";
  clearTimeout(tt);
  tt = setTimeout(() => b.style.display = "none", erro ? 7000 : 3500);
}
function mostrar(logado) {
  $("login").classList.toggle("hidden", logado);
  $("painel").classList.toggle("hidden", !logado);
  $("sair").classList.toggle("hidden", !logado);
  if (!logado) $("senha").focus();
}
function sair() {
  sessionStorage.removeItem("senha");
  senha = "";
  animais = [];
  mostrar(false);
}

/* Chamada à API. Só devolve se a resposta for um objeto com "sucesso".
   Qualquer outra coisa (lista, HTML, falha de rede) é resultado incerto. */
async function api(corpo) {
  let txt;
  try {
    const r = await fetch(API_URL, { method: "POST", body: JSON.stringify({ ...corpo, senha }) });
    txt = await r.text();
  } catch (e) { throw { incerto: true }; }
  let j;
  try { j = JSON.parse(txt); } catch (e) { throw { incerto: true }; }
  if (!j || Array.isArray(j) || typeof j !== "object" || !("sucesso" in j)) throw { incerto: true };
  return j;
}

/* Ler a lista não altera nada, então pode repetir sem risco. */
async function lerLista() {
  for (let i = 1; i <= 3; i++) {
    try {
      const j = await api({ acao: "listar" });
      if (j.sucesso) { animais = j.animais || []; render(); return "ok"; }
      return j.erro || "erro";
    } catch (e) {
      await new Promise(r => setTimeout(r, 1500 * i));
    }
  }
  return "incerto";
}

/* Editar: sempre recarrega a lista depois e mostra o estado real da planilha. */
async function salvar(corpo, okMsg) {
  if (ocupado) return { estado: "erro", msg: "Aguarde o envio anterior terminar." };
  ocupado = true;
  document.querySelectorAll("button").forEach(b => b.disabled = true);
  let estado = "ok", msg = okMsg;
  try {
    const j = await api({ acao: "editar", ...corpo });
    if (!j.sucesso) {
      estado = "erro";
      msg = ERROS[j.erro] || (String(j.erro).startsWith("valor_invalido") ? "Valor inválido em " + String(j.erro).replace("valor_invalido_", "") + "." : "Erro: " + j.erro);
    }
  } catch (e) {
    estado = "incerto";
    msg = "Não deu para confirmar a resposta. Atualizei a lista: confira se a alteração aparece. Se não aparecer, tente de novo.";
  }
  const r = await lerLista();
  document.querySelectorAll("button").forEach(b => b.disabled = false);
  ocupado = false;
  if (r === "nao_autorizado") { sair(); return { estado: "sair", msg: "Sessão expirada. Entre de novo." }; }
  return { estado, msg };
}

function fotoUrl(link) {
  const m = String(link || "").match(/[?&]id=([\w-]+)/);
  return m ? "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w500" : "";
}

function card(a) {
  const ad = norm(a.status) === "adotado", u = fotoUrl(a.foto);
  const foto = el("div", { className: "foto" });
  if (u) {
    const i = el("img", { src: u, alt: "Foto de " + a.nome, loading: "lazy" });
    i.onerror = () => foto.replaceChildren("🐾");
    foto.append(i);
  } else foto.textContent = "🐾";
  const idade = a.idadeAproximada ? ", " + a.idadeAproximada : "";
  return el("article", { className: "card" }, foto,
    el("div", { className: "info" },
      el("h3", {}, a.nome + " ", el("span", { className: "id", textContent: "nº " + a.id })),
      el("div", { className: "meta", textContent: [a.especie, a.sexo].join(", ") }),
      el("div", { className: "meta", textContent: a.faixaEtaria + idade }),
      el("div", { className: "meta", textContent: "Entrada em " + (a.mesEntrada || "data não informada") }),
      el("span", { className: "badge" + (ad ? " ad" : ""), textContent: ad ? "Adotado" + (a.dataAdocao ? " em " + a.dataAdocao : "") : "Disponível" })),
    el("div", { className: "acoes" },
      el("button", { textContent: ad ? "Desfazer adoção" : "Marcar como adotado", className: ad ? "sec" : "", onclick: () => alternar(a, !ad) }),
      el("button", { textContent: "Editar", className: "sec", onclick: () => abrirEdicao(a) })));
}

function render() {
  const q = norm($("busca").value), f = $("filtro").value;
  const lista = animais.filter(a => {
    const ad = norm(a.status) === "adotado";
    return (f === "todos" || (f === "sim") === ad) && norm(a.nome).includes(q);
  });
  $("cont").textContent = animais.length ? lista.length + " de " + animais.length + " animais" : "";
  const g = $("grid");
  g.replaceChildren();
  if (!lista.length) {
    g.append(el("p", { textContent: animais.length ? "Nenhum animal com esse filtro." : "Nenhum animal cadastrado ainda. Os cadastros feitos no formulário aparecem aqui." }));
    return;
  }
  lista.forEach(a => g.append(card(a)));
}

async function alternar(a, adotar) {
  const pergunta = adotar
    ? "Marcar " + a.nome + " como adotado? Ele sai da vitrine."
    : "Desfazer a adoção de " + a.nome + "? Ele volta para a vitrine.";
  if (!confirm(pergunta)) return;
  const r = await salvar({ id: a.id, status: adotar ? "Adotado" : "Não adotado" }, adotar ? a.nome + " marcado como adotado." : "Adoção de " + a.nome + " desfeita.");
  aviso(r.msg, r.estado !== "ok");
}

function abrirEdicao(a) {
  editando = a;
  fotoNova = "";
  $("dt").textContent = "Editar " + a.nome;
  $("fNome").value = a.nome;
  $("fIdade").value = a.idadeAproximada || "";
  [["fEsp", "especie"], ["fSexo", "sexo"], ["fFaixa", "faixaEtaria"], ["fOrig", "origem"], ["fStatus", "status"]]
    .forEach(([id, k]) => $(id).value = a[k]);
  $("fFoto").value = "";
  $("prev").classList.add("hidden");
  $("msgDlg").textContent = "";
  $("dlg").showModal();
}

function reduzir(arquivo) {
  return new Promise((ok, falha) => {
    const img = new Image(), u = URL.createObjectURL(arquivo);
    img.onload = () => {
      const s = Math.min(1, 1000 / img.width), c = document.createElement("canvas");
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(u);
      ok(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => falha(new Error("imagem"));
    img.src = u;
  });
}

/* Preenche as listas de escolha com os valores exatos que o servidor aceita. */
[["fEsp", "especie"], ["fSexo", "sexo"], ["fFaixa", "faixaEtaria"], ["fOrig", "origem"], ["fStatus", "status"]]
  .forEach(([id, k]) => OPCOES[k].forEach(v => $(id).append(new Option(v, v))));

$("login").addEventListener("submit", async e => {
  e.preventDefault();
  if (ocupado) return;
  ocupado = true;
  senha = $("senha").value;
  $("msgLogin").textContent = "Entrando…";
  const r = await lerLista();
  ocupado = false;
  if (r === "ok") {
    sessionStorage.setItem("senha", senha);
    $("senha").value = "";
    $("msgLogin").textContent = "";
    mostrar(true);
  } else {
    senha = "";
    $("msgLogin").textContent = r === "nao_autorizado" ? "Senha incorreta." : "Não deu para conectar. Verifique a internet e tente de novo.";
  }
});

$("fFoto").addEventListener("change", async e => {
  const f = e.target.files[0];
  fotoNova = "";
  $("prev").classList.add("hidden");
  if (!f) return;
  try {
    fotoNova = await reduzir(f);
    $("prev").src = fotoNova;
    $("prev").classList.remove("hidden");
    $("msgDlg").textContent = "";
  } catch (err) {
    $("msgDlg").textContent = "Não consegui ler essa imagem. Tente outra.";
  }
});

$("fe").addEventListener("submit", async e => {
  e.preventDefault();
  const corpo = {
    id: editando.id,
    nome: $("fNome").value.trim(),
    idadeAproximada: $("fIdade").value.trim(),
    especie: $("fEsp").value, sexo: $("fSexo").value, faixaEtaria: $("fFaixa").value,
    origem: $("fOrig").value, status: $("fStatus").value
  };
  if (fotoNova) corpo.foto = fotoNova;
  $("msgDlg").textContent = "Salvando…";
  const r = await salvar(corpo, "Alterações salvas.");
  if (r.estado === "erro") { $("msgDlg").textContent = r.msg; return; }
  $("dlg").close();
  aviso(r.msg, r.estado !== "ok");
});

$("cancelar").onclick = () => $("dlg").close();
$("busca").oninput = render;
$("filtro").onchange = render;
$("sair").onclick = sair;
$("recarregar").onclick = async () => {
  const r = await lerLista();
  if (r === "nao_autorizado") { sair(); aviso("Sessão expirada. Entre de novo.", true); return; }
  aviso(r === "ok" ? "Lista atualizada." : "Não deu para atualizar. Tente de novo.", r !== "ok");
};

(async () => {
  if (!senha) return;
  const r = await lerLista();
  if (r === "ok") mostrar(true); else sair();
})()}<footer> class="rodape" ></footer>