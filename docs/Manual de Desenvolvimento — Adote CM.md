# Manual de Desenvolvimento — Sistema Adote CM

Guia para a equipe técnica (3 pessoas) que vai construir o sistema. Fluxo simplificado, pensado para equipe pequena e prazo curto — sem processo formal de Pull Request.

---

## 1. Visão geral do que vamos construir

- **Tela 1:** formulário de cadastro de animal (HTML, CSS, JavaScript)
- **Tela 2:** vitrine pública de adoção (HTML, CSS, JavaScript)
- **Integração:** Google Apps Script (também JavaScript) — grava na planilha e sobe fotos no Drive
- **Banco de dados:** planilha do Google Sheets

Tudo é a mesma linguagem (JavaScript), então não importa quem pega qual parte — a curva de aprendizado é parecida.

---

## 2. Contas e ferramentas necessárias

### 2.1 Criar conta no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em **Sign up**
3. Use um e-mail que você acesse com frequência
4. Confirme o e-mail quando o GitHub pedir

### 2.2 Instalar o Git

- **Windows:** baixe em [git-scm.com](https://git-scm.com/downloads) e instale com as opções padrão
- **Mac:** abra o Terminal e digite `git --version` — se não tiver instalado, o Mac vai oferecer para instalar automaticamente

Depois de instalar, configure seu nome e e-mail (uma vez só, no terminal):

```
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

### 2.3 Instalar o VS Code

1. Baixe em [code.visualstudio.com](https://code.visualstudio.com)
2. Instale normalmente
3. Extensões recomendadas (instalar pelo ícone de blocos na lateral do VS Code):
   - **Live Server** (visualizar HTML em tempo real no navegador)
   - **Prettier** (formata o código automaticamente)

---

## 3. Entrando no projeto

O repositório já está criado: **[https://github.com/Hernandessn/adotecm.git](https://github.com/Hernandessn/adotecm.git)**

Para começar a trabalhar:

1. Abra o terminal (ou o terminal integrado do VS Code) na pasta onde quer guardar o projeto
2. Rode:

```
git clone https://github.com/Hernandessn/adotecm.git
```

3. Entre na pasta criada:

```
cd adotecm
```

4. Abra no VS Code:

```
code .
```

---

## 4. Fluxo de trabalho

A equipe tem dois perfis diferentes, então o fluxo de Git é diferente para cada um:

### Hernandes e Rony (já sabem programar)

- Podem commitar direto na branch principal (`main`) para tarefas do dia a dia.
- Para partes grandes ou arriscadas (ex: a integração com o Apps Script), criem uma branch separada mesmo assim, só para poder testar sem risco de quebrar o que já está funcionando:

```
git checkout -b nome-da-branch
```

- Antes de começar a trabalhar, sempre atualizem a cópia local:

```
git pull
```

### Marcos, Kallysson, Francisco, Natanael e Lucas (apoiados por IA)

Para evitar que um erro não identificado quebre o sistema, vocês **não commitam direto na `main`**. O fluxo é:

1. Crie sua própria branch, com seu nome na tarefa:

```
git checkout -b tarefa/marcos-navbar
```

(troque pelo nome da sua tarefa, ex: `tarefa/kallysson-cards`)

2. Trabalhe só nos arquivos da sua tarefa (veja a seção 8 — Divisão de tarefas).
3. Quando terminar, suba sua branch:

```
git add .
git commit -m "feat: adiciona estilo do cabeçalho da vitrine"
git push origin tarefa/marcos-navbar
```

4. Avise o **Hernandes** ou o **Rony** no grupo que terminou, mandando o nome da branch. Um dos dois vai revisar e juntar (merge) com a `main`.
5. **Não mexa em arquivos fora da sua tarefa.** Se precisar de algo que depende de outra parte (ex: um dado que só existe depois da integração pronta), avise no grupo em vez de tentar resolver sozinho.

---

## 5. Commits (conventional commits)

Toda vez que salvar um progresso, escreva a mensagem de commit seguindo este padrão:

```
tipo: descrição curta do que foi feito
```

**Tipos mais usados:**

| Tipo | Quando usar | Exemplo |
| --- | --- | --- |
| `feat` | Nova funcionalidade | `feat: adiciona campo de upload de foto` |
| `fix` | Correção de erro | `fix: corrige botão que não salvava o cadastro` |
| `style` | Ajuste visual, sem mudar funcionalidade | `style: ajusta cor do botão salvar` |
| `docs` | Documentação | `docs: atualiza manual de uso` |
| `refactor` | Reorganiza código sem mudar o que ele faz | `refactor: separa função de validação do formulário` |

**Comandos para commitar:**

```
git add .
git commit -m "feat: adiciona campo de upload de foto"
git push
```

Se estiver numa branch separada, o primeiro `push` pode pedir um comando extra — o próprio terminal mostra qual comando copiar e colar.

---

## 6. Comandos Git essenciais (cola rápida)

| Comando | O que faz |
| --- | --- |
| `git status` | Mostra o que mudou desde o último commit |
| `git pull` | Traz as atualizações mais recentes do GitHub |
| `git add .` | Marca todos os arquivos modificados para commit |
| `git commit -m "mensagem"` | Salva as mudanças com uma mensagem |
| `git push` | Envia os commits para o GitHub |
| `git checkout -b nome` | Cria e entra numa nova branch |
| `git checkout main` | Volta para a branch principal |
| `git log --oneline` | Mostra o histórico de commits de forma resumida |

---

## 7. Boas práticas

- **Nunca** suba senhas, chaves de API ou links de credenciais do Google direto no código. Se o Apps Script precisar de alguma chave, perguntem antes como lidar com isso.
- **Teste antes de commitar** — abra o arquivo no navegador (ou use o Live Server do VS Code) para confirmar que não quebrou nada.
- **Mensagens de commit claras** ajudam o resto do grupo a entender o que mudou sem precisar perguntar.
- **Dúvida trava mais que erro** — se travar em algo por mais de 20–30 minutos, avisa no grupo em vez de insistir sozinho.

---

## 8. Divisão de tarefas

### Hernandes — Integração com Google Apps Script

Parte mais crítica do sistema: se tiver erro aqui, nada mais funciona. Por isso fica com quem já tem mais experiência.

- Criar o projeto no Google Apps Script e publicá-lo como Web App.
- Escrever a função que recebe os dados do formulário (via `fetch`) e grava uma nova linha na planilha.
- Escrever a função que recebe a foto em base64, salva no Google Drive e grava o link gerado na planilha.
- Escrever a função que lê a planilha e devolve só os animais com status "Não adotado" (para a vitrine pública consumir).
- Testar as três funções isoladamente antes de avisar o grupo que estão prontas.

### Rony — Lógica das duas telas

- Montar a estrutura HTML da tela de cadastro (os campos: mês, espécie, sexo, faixa etária, status, origem, foto), seguindo o mockup já aprovado.
- Montar a estrutura HTML da vitrine (barra de busca, filtros, grid de cards), seguindo o mockup já aprovado.
- Escrever o JavaScript que pega os dados preenchidos no formulário e envia para o Apps Script do Hernandes (usando `fetch`).
- Escrever o JavaScript que busca os dados do Apps Script e gera os cards de animais automaticamente na vitrine.
- Avisar o Hernandes assim que a estrutura das telas estiver pronta, para alinhar os nomes dos campos entre o front-end e o Apps Script.

### Marcos — Cabeçalho e menu da vitrine

- Arquivo: parte do CSS referente à barra superior da vitrine (`Adote CM`, menu Início/Sobre/Contato, ícone de perfil).
- Aplicar as cores da identidade visual (azul-marinho e creme), seguindo o mockup.
- Deixar responsivo (funcionar bem tanto no celular quanto no computador).
- Branch: `tarefa/marcos-navbar`

### Kallysson — Cards de animais

- Arquivo: parte do CSS referente aos cards da vitrine (foto, nome, espécie, idade, botão "Adote-me").
- Seguir exatamente o visual do mockup (cantos arredondados, cores, espaçamento).
- Garantir que os cards se organizem bem em grade (3 por linha no computador, 1 por linha no celular).
- Branch: `tarefa/kallysson-cards`

### Francisco — Rodapé da vitrine

- Arquivo: parte do CSS e HTML do rodapé (ícones de Instagram, Facebook, e-mail de contato).
- Seguir o visual do mockup (fundo azul-marinho, ícones em creme).
- Adicionar os links reais das redes sociais da Adote CM (pedir pra Nívea se não tiver).
- Branch: `tarefa/francisco-rodape`

### Natanael — Campos e botões do formulário de cadastro

- Arquivo: parte do CSS dos campos e botões da tela de cadastro (toggle de espécie, sexo, faixa etária, status, origem, e o botão "Salvar Cadastro").
- Seguir o visual do mockup (botões arredondados, cor azul-marinho quando selecionado).
- Garantir que fique fácil de tocar no celular (botões não muito pequenos).
- Branch: `tarefa/natanael-formulario`

### Lucas — Testes (QA)

Não programa — testa o que os outros fizeram e reporta problemas.

- Preencher o formulário de cadastro várias vezes com dados diferentes (incluindo casos estranhos: nome vazio, foto muito grande, etc.) e anotar o que quebra.
- Testar o upload de foto em celular e em computador.
- Conferir se a vitrine atualiza corretamente depois de um novo cadastro.
- Conferir se um animal marcado como "Adotado" realmente some da vitrine.
- Testar em pelo menos 2 celulares diferentes, se possível.
- Reportar cada problema encontrado no grupo, com print e descrição de como reproduzir o erro.