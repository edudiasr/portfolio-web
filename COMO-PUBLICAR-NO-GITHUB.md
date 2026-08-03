# Como publicar este portfólio no GitHub

Guia completo: o que sobe, o que escrever e como deixar online com GitHub Pages.

---

## 1. O que sobe para o GitHub

Suba **tudo** que está nesta pasta (o repositório inteiro):

```
PROJETO GITHUB/
├── index.html                 ← página inicial do portfólio (GitHub Pages)
├── README.md                  ← texto que aparece na capa do repositório
├── COMO-PUBLICAR-NO-GITHUB.md ← este guia (pode manter ou apagar depois)
├── .gitignore
└── site-informatica/
    ├── index.html
    ├── README.md
    ├── robots.txt
    ├── sitemap.xml
    └── assets/
        ├── css/style.css
        └── js/main.js
```

**Não precisa** subir:

- Nada de `node_modules` (não existe neste projeto)
- Arquivos `.env` (não existem)
- Pastas do sistema como `.DS_Store`

O `.gitignore` já protege o essencial.

---

## 2. Textos prontos (copie e cole)

### Nome do repositório (sugerido)

```
portfolio-web
```

Outras opções boas: `projetos-web`, `sites-portfolio`, `dev-portfolio`.

### Descrição curta do repositório (campo "Description" no GitHub)

```
Portfólio de sites e landing pages com HTML, CSS e JavaScript — design profissional e focado em conversão.
```

### Topics / tags (em About → ⚙️ → Topics)

```
html
css
javascript
portfolio
landing-page
frontend
responsive-design
web-design
```

### Website (campo do repositório, depois de ativar o Pages)

```
https://SEU-USUARIO.github.io/portfolio-web/
```

Troque `SEU-USUARIO` pelo seu usuário do GitHub e `portfolio-web` pelo nome real do repo.

---

## 3. Duas formas de subir

### Opção A — Pelo site do GitHub (mais fácil, sem terminal)

1. Instale o Git **só se quiser usar o terminal depois**. Para esta opção, não precisa.
2. Entre em https://github.com/new
3. **Repository name:** `portfolio-web`
4. **Description:** cole o texto da seção 2
5. Deixe **Public**
6. **NÃO** marque "Add a README"
7. Clique em **Create repository**
8. Na tela do repositório vazio, clique em **uploading an existing file**
9. Arraste **todos os arquivos e pastas** da pasta `PROJETO GITHUB` para a área de upload:
   - `index.html`
   - `README.md`
   - `COMO-PUBLICAR-NO-GITHUB.md`
   - `.gitignore`
   - pasta `site-informatica` (com tudo dentro)
10. Em **Commit changes**, escreva:
    ```
    Primeiro commit: portfólio com site CtrlTec
    ```
11. Clique em **Commit changes**

Pronto. Os arquivos já estão no GitHub.

---

### Opção B — Pelo terminal (recomendado a longo prazo)

#### B1. Instalar o Git

Baixe e instale: https://git-scm.com/download/win  
Durante a instalação, pode deixar as opções padrão.  
**Feche e reabra** o PowerShell depois de instalar.

#### B2. Criar o repositório no GitHub

1. Entre em https://github.com/new
2. **Repository name:** `portfolio-web`
3. **Description:** cole o texto da seção 2
4. Deixe **Public**
5. **NÃO** marque "Add a README"
6. Clique em **Create repository**

#### B3. Enviar os arquivos

Abra o PowerShell e rode **um comando por vez**:

```powershell
cd "C:\Users\DIAS\Desktop\PROJETO GITHUB"
```

```powershell
git init
```

```powershell
git add .
```

```powershell
git commit -m "Primeiro commit: portfólio com site CtrlTec (assistência técnica)"
```

```powershell
git branch -M main
```

```powershell
git remote add origin https://github.com/SEU-USUARIO/portfolio-web.git
```

> Troque `SEU-USUARIO` pelo seu usuário do GitHub.

```powershell
git push -u origin main
```

Se pedir login: use seu usuário GitHub e um **Personal Access Token** (não a senha da conta).  
Criar token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token (marque `repo`).

> **Nota:** Neste PC o Git ainda não estava instalado. Use a **Opção A** agora, ou instale o Git e use a Opção B.

---

## 4. Ativar o site online (GitHub Pages) — grátis

1. No repositório → **Settings** → **Pages**
2. Em **Source**, escolha **Deploy from a branch**
3. Branch: `main` · Pasta: `/ (root)`
4. Save

Em 1–2 minutos o site fica em:

```
https://SEU-USUARIO.github.io/portfolio-web/
```

Projeto da informática:

```
https://SEU-USUARIO.github.io/portfolio-web/site-informatica/
```

---

## 5. Depois de publicar — ajuste estes 2 arquivos

Abra e troque `SEU-USUARIO` e `SEU-REPOSITORIO` pela URL real:

- `site-informatica/robots.txt`
- `site-informatica/sitemap.xml`

Exemplo, se o repo for `portfolio-web` e o usuário `diasdev`:

```
https://diasdev.github.io/portfolio-web/site-informatica/
```

---

## 6. (Opcional) README do perfil do GitHub

Para a capa do seu perfil (`github.com/SEU-USUARIO`), crie um repositório com o **mesmo nome do seu usuário** e um `README.md` assim:

```markdown
# Olá, eu sou [Seu Nome]

Desenvolvedor Front-end focado em sites profissionais para negócios locais.

## O que eu faço
- Landing pages e sites institucionais
- Sites para comércios e prestadores de serviço
- Páginas de captura e manutenção de sites

## Portfólio
👉 [Ver projetos](https://SEU-USUARIO.github.io/portfolio-web/)

## Contato
- WhatsApp: (00) 00000-0000
- E-mail: seu@email.com
```

---

## 7. Checklist rápido antes de mostrar para clientes

- [ ] Site abre no celular sem quebrar
- [ ] Dark/Light mode funciona
- [ ] Formulário abre o WhatsApp (mesmo com número placeholder, para demo)
- [ ] Before/After arrasta no mouse e no touch
- [ ] GitHub Pages ativo e link no About do repositório
- [ ] README da raiz e do projeto legíveis

---

## 8. Atualizar o projeto no futuro

Sempre que mudar arquivos:

```powershell
cd "C:\Users\DIAS\Desktop\PROJETO GITHUB"
git add .
git commit -m "Descreva o que mudou em uma frase"
git push
```

O GitHub Pages atualiza sozinho em alguns segundos.
