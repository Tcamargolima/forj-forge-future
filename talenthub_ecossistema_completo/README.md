# Talent Hub - Módulo de Cursos e Formação

Este repositório contém o **Módulo Completo de Cursos e Formação** do Talent Hub, desenvolvido para ser integrado ao projeto `forj-forge-future`.

O módulo inclui a estrutura de dados, componentes React e todo o conteúdo (roteiros, PDFs, vídeos mock) para 12 cursos de formação, organizados em 4 níveis e 3 pacotes comerciais.

## 🚀 Tecnologias Principais

O projeto segue o padrão tecnológico existente:

| Tecnologia | Função |
| :--- | :--- |
| **React + Vite + TypeScript** | Frontend e Estrutura de Aplicação |
| **Tailwind CSS + shadcn-ui** | Estilização e Componentes UI (Padrão Minimalista) |
| **Supabase** | Backend, Banco de Dados (PostgreSQL) e Autenticação |
| **React Router** | Roteamento de Páginas |

## 🛠️ Instalação e Execução Local

Para rodar o projeto em sua máquina local, siga os passos abaixo:

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/Tcamargolima/forj-forge-future.git
    cd forj-forge-future
    ```

2.  **Instale as Dependências:**
    ```bash
    npm install
    # ou pnpm install, ou yarn install, dependendo do seu gerenciador
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env.local` na raiz do projeto e adicione suas chaves do Supabase.

    ```
    VITE_SUPABASE_URL="[SUA_URL_SUPABASE]"
    VITE_SUPABASE_ANON_KEY="[SUA_CHAVE_ANON_SUPABASE]"
    ```

4.  **Inicie o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```
    O aplicativo estará acessível em `http://localhost:5173` (ou porta similar).

## 💾 Configuração do Supabase (Banco de Dados)

Este módulo adiciona novas tabelas e dados essenciais para o controle de acesso e conteúdo dos cursos.

1.  **Acesse o Painel do Supabase:**
    Vá para o seu projeto Supabase e navegue até **SQL Editor**.

2.  **Execute os Scripts de Migração e Seed:**
    Os scripts devem ser executados na seguinte ordem para garantir a integridade referencial:

    | Arquivo | Descrição |
    | :--- | :--- |
    | `database/schema.sql` | Cria as tabelas `course_packages` e `talent_packages` e configura as políticas RLS. |
    | `database/seed_training_levels.sql` | Insere os 4 níveis de formação (`FUNDAMENTOS`, `DESENVOLVIMENTO`, etc.). |
    | `database/seed_courses.sql` | Insere os 12 cursos na tabela `courses`. |
    | `database/seed_lessons.sql` | Insere todas as aulas na tabela `course_lessons`. |
    | `database/seed_packages.sql` | Associa os cursos aos pacotes comerciais (`START`, `ADVANCED`, `PRO PREMIUM`). |

    **Importante:** As políticas RLS (Row Level Security) estão configuradas para proteger o acesso aos pacotes, garantindo que apenas o usuário com o pacote adquirido ou um administrador possa visualizar o conteúdo.

## 📂 Estrutura de Pastas

A nova estrutura de pastas para o módulo de cursos é a seguinte:

```
forj-forge-future/
├── database/
│   ├── schema.sql
│   ├── seed_courses.sql
│   ├── seed_lessons.sql
│   ├── seed_packages.sql
│   └── seed_training_levels.sql
├── src/
│   ├── components/
│   │   ├── CourseCard.tsx
│   │   ├── LessonViewer.tsx
│   │   ├── PackageLocked.tsx
│   │   ├── TrainingJourney.tsx
│   │   └── CourseListByPackage.tsx
│   └── data/
│       ├── courses.json
│       ├── lessons.json
│       ├── packages.json
│       └── training_levels.json
├── content/
│   ├── curso1/
│   │   ├── aula1.mp4 (Placeholder)
│   │   ├── aula1.pdf (Material da Aula)
│   │   ├── aula1_script.pdf (Roteiro)
│   │   ├── guia_completo.pdf (PDF do Curso)
│   │   └── ... (outras aulas, checklists, exercícios)
│   └── ... (curso2 até curso12)
└── assets/
    └── thumbnails/
        └── course_1.jpg (Placeholder)
        └── ... (course_12.jpg)
```

## 🎓 Conteúdo do Módulo (12 Cursos)

Abaixo está a lista completa dos cursos e o pacote comercial necessário para acesso:

| ID | Curso | Nível | Pacote Necessário |
| :---: | :--- | :--- | :---: |
| C1 | Introdução & Boas-vindas | Fundamentos | START |
| C2 | Fotogenia Essencial | Fundamentos | START |
| C3 | Poses que Aprovam | Fundamentos | START |
| C4 | Look Ideal para Entrevista | Fundamentos | START |
| C5 | Comunicação & Apresentação | Fundamentos | START |
| C6 | Mini Mídia Kit Express | Fundamentos | START |
| C7 | Simulação Real de Casting | Fundamentos | START |
| C8 | Self Tape Profissional | Desenvolvimento | ADVANCED |
| C9 | Expressão Facial Profissional | Desenvolvimento | ADVANCED |
| C10 | Passarela Online Básica | Profissionalização | PRO PREMIUM |
| C11 | Mercado da Moda & Publicidade | Profissionalização | PRO PREMIUM |
| C12 | Mentoria Online (base gravada) | Alto Desempenho | PRO PREMIUM |

## 🔄 Como Integrar ao Lovable e Atualizar o GitHub

O projeto é configurado para integração com o Lovable.

1.  **Commit e Push:** Após fazer suas alterações, faça o commit e push para o repositório GitHub.
    ```bash
    git add .
    git commit -m "feat: Adiciona módulo completo de cursos Talent Hub"
    git push origin main
    ```
2.  **Sincronização Lovable:** O Lovable detectará automaticamente as mudanças no repositório.
3.  **Deploy:** Você pode gerenciar o deploy e a publicação através do painel do Lovable.

---
*Módulo gerado por **Manus AI** em 08/12/2025*
