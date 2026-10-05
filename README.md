# Adote CM — Sistema de Organização Digital

Sistema desenvolvido como projeto de extensão universitária (curso de Análise e Desenvolvimento de Sistemas) em parceria com a ONG **Adote CM** (Campo Maior, PI).

## O que o sistema faz

- **Formulário de cadastro:** a ONG registra cada animal (espécie, sexo, idade, status de adoção, origem e foto).
- **Vitrine pública:** página com os animais disponíveis para adoção, atualizada automaticamente.
- **Planilha central:** os dados ficam organizados em uma planilha do Google Sheets, que também serve de base para o relatório anual da ONG.

## Como o sistema funciona

```
Formulário de cadastro → Planilha (Google Sheets) → Vitrine pública + Relatório anual
```

A integração entre o formulário, a planilha e o Google Drive (para as fotos) é feita via **Google Apps Script**.

## Tecnologias

- HTML, CSS e JavaScript (sem framework)
- Google Apps Script
- Google Sheets (banco de dados)
- Hospedagem: GitHub Pages

## Equipe

Projeto desenvolvido por discentes do curso de Análise e Desenvolvimento de Sistemas.

## Documentação

Guia para quem for contribuir com o código: [docs/manual_desenvolvimento.md](docs/manual_desenvolvimento.md)