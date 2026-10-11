# AdoteCM — Sistema visual e componentes de interface

Padronização visual das telas do projeto de extensão da ONG **AdoteCM**, com componentes consistentes, legíveis e fáceis de reconhecer.

> Os exemplos descritos aqui são referências visuais para implementação, não capturas do site atual. Ajuste textos, links, contatos e estados conforme as funcionalidades reais do AdoteCM.

## Sumário

1. [Objetivo](#objetivo)
2. [Paleta principal](#paleta-principal)
3. [Botões](#1-botões)
4. [Ícones](#2-ícones)
5. [Menu de navegação](#3-menu-de-navegação)
6. [Cards de animais](#4-cards-de-animais)
7. [Campos de formulário](#5-campos-de-formulário)
8. [Rodapé](#6-rodapé)
9. [Especificações rápidas](#7-especificações-rápidas)
10. [Variáveis CSS](#variáveis-css)

---

## Objetivo

Padronizar a aparência das telas do projeto de extensão da ONG AdoteCM, com componentes consistentes, legíveis e fáceis de reconhecer.

## Paleta principal

| Cor | Código | Aplicação |
|---|---|---|
| Azul principal | `#1B3A57` | Botões principais, menu e rodapé |
| Azul secundário | `#294D6B` | Detalhes e ações alternativas |
| Azul claro | `#DCE7EF` | Fundos suaves e ícones |
| Fundo | `#F1EFE8` | Seções de apoio |
| Borda | `#CACAC9` | Campos e cards |
| Texto secundário | `#555555` | Descrições |

---

## 1. Botões

Modelos de ações principais, secundárias, confirmação e exclusão. Use rótulos diretos e mantenha o mesmo estilo em todas as telas.

| Exemplo | Tipo |
|---|---|
| **Quero adotar** | Principal |
| **Cadastrar animal** | Ação secundária |
| **Cancelar** | Contorno |
| **Enviar cadastro** | Confirmação |
| **Excluir** | Ação destrutiva |

**Regra:** botão principal em azul escuro com texto branco; ação secundária pode usar fundo branco e contorno azul. Para ações destrutivas, use uma cor de alerta e um rótulo claro.

## 2. Ícones

Os ícones devem ter traço uniforme. Acompanhe com texto quando a função não for óbvia, principalmente em ações importantes.

Conjunto previsto: **Início · Animais · Buscar · Favoritos · Perfil · Contato · Menu**

## 3. Menu de navegação

A marca fica à esquerda, os links principais no centro e a ação mais importante à direita. Em telas estreitas, os links podem ser recolhidos em um menu compacto.

```
AdoteCM    Início   Animais   Como ajudar              [ Quero adotar ]
```

*Exemplo ilustrativo do menu para desktop.*

## 4. Cards de animais

Cada card destaca a imagem, nome, resumo, situação de adoção e acesso aos detalhes. As imagens reais dos animais devem substituir as áreas ilustrativas.

| Nome | Resumo | Situação | Ação |
|---|---|---|---|
| **Mel** | 2 anos • Porte médio | Disponível | Conhecer |
| **Thor** | 1 ano • Porte pequeno | Disponível | Conhecer |
| **Luna** | 3 anos • Porte grande | Disponível | Conhecer |

## 5. Campos de formulário

Os rótulos ficam acima dos campos. O placeholder é apenas um exemplo e não deve substituir o rótulo. Mensagens de erro devem aparecer próximas ao campo.

| Rótulo | Placeholder |
|---|---|
| Nome do animal | `Ex.: Mel` |
| E-mail para contato | `nome@exemplo.com` |
| Cidade | `Digite a cidade` |
| Telefone | `(00) 00000-0000` |

## 6. Rodapé

Reúna a marca, uma frase sobre a missão, contato e créditos. O fundo azul principal com texto branco mantém a identidade visual.

```
AdoteCM
Adoção responsável transforma vidas.

Contato
contato@adotecm.org

© AdoteCM • Projeto de extensão
```

## 7. Especificações rápidas

| Componente | Recomendação | Estilo |
|---|---|---|
| Botão principal | Altura aproximada de 40–44 px; texto curto e direto. | `#1B3A57` + texto branco |
| Botão secundário | Para cancelar, voltar ou ações de menor prioridade. | Fundo branco e contorno azul |
| Ícones | Traço consistente; texto auxiliar quando necessário. | Azul escuro ou branco em fundo escuro |
| Menu | Marca, links principais e ação em destaque. | Fundo branco; links azuis |
| Card | Imagem, nome, resumo, status e ação. | Fundo branco e borda leve |
| Formulário | Rótulos visíveis, campos confortáveis e validação clara. | Borda `#CACAC9`; texto preto |
| Rodapé | Marca, missão, contato e créditos. | Azul `#1B3A57`; texto branco |

---

# Variáveis CSS

Complemento técnico que transforma as cores principais da paleta em variáveis CSS reutilizáveis, declaradas em `:root`, para aplicar os mesmos valores em botões, menus, cards, formulários e rodapé.

## 1. Código das variáveis CSS

```css
:root {
  /* Paleta principal do AdoteCM */
  --cor-azul-principal: #1B3A57;
  --cor-azul-secundario: #294D6B;
  --cor-azul-claro: #DCE7EF;
  --cor-fundo: #F1EFE8;
  --cor-borda: #CACAC9;
  --cor-texto-secundario: #555555;

  /* Cores de apoio */
  --cor-branco: #FFFFFF;
  --cor-texto-principal: #222222;
  --cor-alerta: #B42318;

  /* Medidas e acabamento */
  --raio-card: 10px;
  --raio-botao: 6px;
  --espacamento-padrao: 16px;
  --largura-maxima: 1200px;
}
```

## 2. Exemplo de uso das variáveis

```css
body {
  background-color: var(--cor-fundo);
  color: var(--cor-texto-principal);
  font-family: Arial, sans-serif;
}

.botao-principal {
  background-color: var(--cor-azul-principal);
  color: var(--cor-branco);
  border: 1px solid var(--cor-azul-principal);
  border-radius: var(--raio-botao);
  padding: 10px 16px;
}

.card-animal {
  background: var(--cor-branco);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-card);
  padding: var(--espacamento-padrao);
}

.texto-secundario {
  color: var(--cor-texto-secundario);
}
```

## 3. Como aplicar no projeto

- Coloque o bloco `:root` no início do arquivo `style.css`.
- Substitua cores escritas diretamente (por exemplo, `#1B3A57`) por `var(--cor-azul-principal)` nos componentes.
- Para mudar a identidade visual no futuro, altere o valor da variável uma única vez; todos os componentes que a utilizam serão atualizados.
- Os nomes das classes do exemplo são ilustrativos: adapte-os às classes já existentes no projeto.

## 4. Referência da paleta original

| Variável | Valor | Aplicação sugerida |
|---|---|---|
| `--cor-azul-principal` | `#1B3A57` | Botões principais, menu e rodapé |
| `--cor-azul-secundario` | `#294D6B` | Detalhes e ações alternativas |
| `--cor-azul-claro` | `#DCE7EF` | Fundos suaves e ícones |
| `--cor-fundo` | `#F1EFE8` | Seções de apoio |
| `--cor-borda` | `#CACAC9` | Campos e cards |
| `--cor-texto-secundario` | `#555555` | Descrições |

> **Observação:** `--cor-alerta`, `--cor-branco`, `--cor-texto-principal` e as variáveis de medidas são complementos sugeridos para facilitar a implementação; as seis cores da paleta principal correspondem ao documento original.