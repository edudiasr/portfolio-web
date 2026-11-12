# Validador de types.xml (versão web)

https://edudiasr.github.io/portfolio-web/validador-types/

Versão no navegador do [Dayz-Types-Validator](https://github.com/edudiasr/Dayz-Types-Validator), que eu fiz em Python. Fiz essa pra quem administra servidor de DayZ não precisar instalar nada: solta o `types.xml` na página e vê os problemas com a linha de cada um. O arquivo não sai do navegador.

Dá pra soltar junto o `cfglimitsdefinition.xml` e o `cfglimitsdefinitionuser.xml` (ele descobre qual é qual pela tag raiz) e vários types de uma vez, que viram abas.

## Arquivos

```
js/xml.js        leitor de XML que guarda a linha de cada elemento
js/validator.js  as regras (as mesmas do Python)
js/app.js        a página
teste/           testes
exemplos/        os arquivos do botão "Usar exemplo"
```

O `DOMParser` do navegador não diz em que linha está cada elemento, por isso tem um leitor de XML próprio. Ele é tão chato quanto o expat do Python: recusa `--` dentro de comentário e `<?xml` no meio do arquivo, duas coisas que achei em types de mods do meu servidor.

## Testes

```
node --test teste/xml.test.mjs
node teste/paridade.mjs <pasta do Dayz-Types-Validator>
```

O de paridade roda a versão em Python e a em JS nos mesmos arquivos e compara problema por problema (linha, código e item). Rodei com o `types.xml` do meu servidor e mais 206 types de mods: deu igual em todos. O `types.xml` de 1,5 MB (3123 itens) é validado em uns 0,6 s no navegador.
