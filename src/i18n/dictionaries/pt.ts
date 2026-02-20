export type Dictionary = typeof pt;

export const pt = {
    common: {
        save: "Salvar",
        cancel: "Cancelar",
        close: "Fechar",
        confirm: "Confirmar",
        loading: "Processando...",
    },
    sidebar: {
        header_subtitle: "Seu espaço digital",
        header_title: "Diorama",
        discard_changes: "Esquecer",
        tabs: {
            style: "Estilo",
            style_desc: "Luz e Cor",
            writing: "Escrita",
            writing_desc: "Textos",
            media: "Mídia",
            media_desc: "Conteúdo",
            art: "Criativo",
            art_desc: "Assets",
        },
        style: {
            atmosphere_title: "Atmosfera base",
            atmosphere_desc: "Luz, sombra e cor do seu espaço",
            magic_fx_title: "Aura do quarto",
            magic_fx_desc: "Partículas, ruídos e texturas imersivas",
            danger_title: "Desapegar de tudo",
            danger_desc: "Começar de novo, com a tela em branco",
            clear_wall_btn: "Apagar todas as memórias"
        },
        writing: {
            text_title: "Fragmentos de texto",
            text_desc: "Pensamentos soltos e desabafos",
        },
        media: {
            atmosphere_nodes_title: "Elementos Vivos",
            atmosphere_nodes_desc: "Trilha sonora e memórias visuais"
        },
        art: {
            creative_assets_title: "Expressão cinética",
            creative_assets_desc: "Adesivos, rabiscos e bagunça"
        },
        bottom_tip: "Clique nos blocos do mural para girar ou deletar",
    },
    modals: {
        clear_wall: {
            title: "Limpar Mural?",
            message: "Isso vai apagar todas as memórias desenhadas neste espaço. Você está pronto para um recomeço?",
            confirm_btn: "Sim, deixar ir"
        }
    },
    doodle: {
        fullscreen_canvas: "Rabiscos da Alma",
        fullscreen_desc: "Deixe uma marca instantânea do seu sentimento.",
        start_drawing: "Rabiscar na parede",
        cancel_drawing: "Esquecer o rabisco",
        clear_screen: "Limpar Tela",
        kinetic_active: "Deixando a emoção fluir...",
        manifesting: "Guardando...",
        confirm_save: "Colocar rabisco no painel",
        stroke_weight: "Espessura",
        identity_chrome: "Tinta"
    },
    landing: {
        studio_platform: "Plataforma do Estúdio",
        curator_access_only: "Apenas para curadores de sentimentos",
        hero_title_curate: "Construa",
        hero_title_your: "Sua",
        hero_title_reality: "Atmosfera.",
        hero_subtitle: "Um mural minimalista para curadoria digital. Músicas, mídias e atmosfera em um só lugar.",
        btn_create_studio: "Meu primeiro quarto",
        version_deployment: "Sincronizando a realidade...",
        visuals: "01 // VISUAIS",
        audio: "02 // ÁUDIO",
        curation: "03 // CURADORIA",
        privacy: "Protocolo de Privacidade",
        terms: "Termos de Acesso",
        login_btn: "Entrar"
    },
    auth: {
        login: {
            auth_protocol: "Identificação",
            identify_presence: "Reconhecimento de aura",
            title: "Entrar no",
            title_italic: "Quarto",
            identity_url: "Seu Email",
            placeholder_email: "seu@email.com",
            access_key: "Sua chave secreta (Senha)",
            placeholder_password: "••••••••",
            initiate_access: "Abrir a porta",
            unauthorized: "Ainda não tem a senha?",
            establish_identity: "Criar uma",
            protocol_denied: "Sua aura não foi reconhecida.",
            protocol_error: "Erro no sistema: Falha na conexão",
            abort: "Voltar",
            footer: "Conexão Segura // TLS_v1.3",
            authorizing: "Verificando..."
        },
        register: {
            entity_reg: "Manifestação de aura",
            request_alloc: "Pedindo as chaves",
            title: "Criar",
            title_italic: "Quarto",
            unique_identifier: "Como quer ser chamado? (Username)",
            placeholder_username: "seu_nome",
            communication_node: "Seu Email",
            placeholder_email: "seu@email.com",
            private_key: "Sua chave secreta (Senha)",
            placeholder_password: "••••••••",
            register_identity: "Pegar minhas chaves",
            already_registered: "Já tem a chave?",
            resume_session: "Abra a porta",
            identity_rejected: "Manifestação negada",
            identity_established: "Chaves entregues. Abrindo a porta do quarto...",
            cancel: "Voltar",
            footer: "Sistema de Alocação // MoodSpace",
            establishing: "Criando chaves..."
        }
    },
    leftSidebar: {
        greeting_morning: "Bom dia",
        greeting_afternoon: "Boa tarde",
        greeting_night: "Boa noite",
        system_node: "Seu canto online",
        active_studio: "Quarto aberto",
        identity_protocol: "Visitante atual",
        access_level: "Seu plano",
        studio_free: "Livre",
        system_status: "Status",
        authorized: "Acomodado",
        deployment_area: "Compartilhar a chave",
        external_visibility: "Deixe os outros entrarem no seu quarto",
        launch_public_space: "Visitar espaço público",
        system_configuration: "Configurações",
        identity_registry: "Sua conta",
        system_ux: "Preferências do quarto",
        terminate_session: "Sair do quarto",
        exit_hex: "Trancar a porta",
    },
    editors: {
        theme: {
            title: "Cores e vibes",
            light: "Clássico",
            dark: "Meia-noite",
            vintage: "Vintage",
            notebook: "Caderno",
            blueprint: "Projeto",
            canvas: "Tela",
            cyberpunk: "Cibernético",
            node_luminance: "Cor do destaque",
            luminance_desc: "Escolha a cor que mais te representa agora.",
            atomic_typography: "Letra principal",
            base_system: "Estilo base de letreiro",
        },
        text: {
            title: "Escrever algo",
            placeholder: "Sobre o que você está pensando?",
            substrate: "Tipo de papel",
            node_color: "Cor do papel",
            font_scale: "Tamanho da letra",
            alignment: "Alinhamento",
            deploy: "Colar no mural",
            styles: {
                simple: "Simples",
                postit: "Post-it",
                ripped: "Rasgado",
                typewriter: "Máquina"
            }
        },
        photo: {
            title: "Revelar uma foto",
            drop_link: "Solte a foto aqui",
            inject_visual: "Arraste sua foto para cá",
            format_hint: "FORMATOS // PNG, JPG, WEBP",
            processing: "Revelando...",
            live_preview: "Como vai ficar:",
            caption: "Lembrança (Legenda)",
            caption_placeholder: "Escreva algo sobre essa foto...",
            alt_text: "Texto Alternativo (Acessibilidade)",
            alt_placeholder: "Descreva a imagem para quem não pode ver...",
            filter: "Filtro da Foto",
            geometry: "Moldura",
            deploy: "Pendurar foto",
            error_load: "Aura fotográfica corrompida. Não conseguimos ler.",
            error_process: "A imagem não resistiu ao processo de compressão."
        },
        phrase: {
            title: "Pensamentos soltos",
            protocol_type: "Tipo de Animação",
            placeholder: "Deixe uma frase solta aqui...",
            aura_style: "Estilo",
            flow: "Direção",
            cursor: "Cursor",
            text_color: "Cor do Texto",
            bg_color: "Cor de Fundo",
            speed: "Velocidade",
            left: "Esq.",
            right: "Dir.",
            deploy: "Deixar rolar",
        },
        youtube: {
            title: "Tocar um clipe",
            placeholder: "Cole o link do YouTube aqui...",
            established: "Vídeo conectado",
            deploy: "Ligar a fita",
            error: "Não conseguimos conectar a este link.",
            supported: "Suportamos links como: youtu.be, youtube.com/watch",
        },
        effects: {
            cursor_title: "Seu cursor",
            trails_title: "Rastro do mouse",
            atmosphere_title: "Atmosfera do quarto",
            active: "Selecionado",
            syncing: "Mudando a atmosfera...",
            deployed: "Tudo pronto.",
        },
        countdown: {
            title: "Contagem regressiva",
            label: "Para quando é?",
            placeholder: "Meu aniversário...",
            target: "Data marcada",
            registry: "Ícone especial",
            substrate: "Aparência",
            deploy: "Começar contagem",
        },
        guestbook: {
            title: "Mural de recados",
            label: "Qual é a pergunta ou título?",
            placeholder: "Deixe um recadinho...",
            color_label: "Cor do recado",
            deploy: "Colar no mural",
            visit_active: "As pessoas poderão escrever no seu quarto.",
        },
        mood: {
            title: "Seu estado atual",
            registry: "Como você está?",
            buffer: "Escreva o que está sentindo (opcional)",
            placeholder: "Tudo tranquilo...",
            deploy: "Deixar o sentimento",
        },
        quote: {
            title: "Citação",
            label_text: "O que foi dito?",
            placeholder: "Escreva a citação aqui...",
            label_author: "Quem disse isso? (Opcional)",
            author: "Autor",
            style_title: "Estilo",
            color_text: "Cor do Texto",
            color_bg: "Cor de Fundo",
            show_quotes: "Adicionar aspas decorativas",
            deploy: "Marcar citação",
        },
        social: {
            title: "Adicionar Link Social",
            nodes: "Que link é esse?",
            link_protocol: "Qual é o link?",
            link_placeholder: "https://...",
            visual_alias: "Como deve se chamar? (Opcional)",
            alias_placeholder: "Meu perfil...",
            style_manifesto: "Estilo do Botão",
            deploy: "Adicionar link",
        },
        doodle: {
            title: "Sua folha de rascunhos",
            manifest: "Desenhe em tela cheia na sua parede."
        },
        gif: {
            title: "Reações e Gifs",
            powered_by: "Escolha seu gif (Giphy).",
            search_placeholder: "Procurar gif...",
            searching: "Procurando...",
            deploy: "Colar Gif",
            not_found: "Nenhum gif encontrado"
        },
        block_manager: {
            delete_confirm: "Tem certeza que deseja remover esta memória?",
            labels: {
                text: "Notas",
                music: "Música do Spotify",
                photo: "Imagem / Foto",
                video: "Vídeo do YouTube",
                quote: "Citação",
                moodStatus: "Mood: ",
                countdown: "Contagem Regressiva",
                social: "link",
                weather: "Vibe: ",
                book: "Livro",
                movie: "Filme",
                gif: "GIF Animado",
                doodle: "Desenho à mão",
                guestbook: "Livro de Recados",
                default: "Bloco de Conteúdo"
            },
            feed_title: "Seu Mundo",
            empty: "Nenhum bloco ainda...",
        },
        art: {
            tape_title: "Adesivos e fitas",
            weather_title: "Clima atual",
            weather_state: "Como está o dia?",
            weather_location: "De onde?",
            weather_location_placeholder: "Lisboa, BR, Tóquio...",
            weather_temp: "Temperatura (Opcional)",
            weather_temp_placeholder: "22°C, Congelando, Quente...",
            weather_deploy: "Colar clima",
            media_title: "Livros e Filmes",
            media_book: "Livro",
            media_movie: "Filme",
            media_work_title: "Qual é o nome?",
            media_work_title_placeholder: "Nome da obra...",
            media_critique: "Resumo em 3 palavras",
            media_critique_placeholder: "Incrível, Chato, Surreal...",
            media_deploy: "Colar Resenha"
        },
        spotify: {
            title: "Trilha Sonora",
            search_placeholder: "Qual música procurar?",
            search_btn: "Procurar Música",
            error: "Erro de busca",
            results: "Resultados",
            source: "Fonte"
        },
        palette: {
            title: "Auto Palette",
            desc: "Extraia cores de uma imagem",
            drop: "Solte para analisar",
            drag: "Arraste uma imagem",
            hint: "Extração inteligente de vibes",
            analyzing: "Analisando...",
            apply: "Aplicar no Mural"
        },
        share: {
            link: "Compartilhar",
            copied: "Copiado",
            qr_code: "QR CODE",
            save_qr: "Salvar QR"
        }
    },
    canvas: {
        weather_registry: "Clima Atual",
        sync_active: "Sincronizando...",
        creativity_domain: "Seu Espaço",
        delete_modal_title: "Deletar Item?",
        delete_modal_message: "Essa ação não pode ser desfeita. O item será removido permanentemente do seu mural.",
        delete_modal_confirm: "Excluir"
    },
    public_page: {
        signature: {
            role: "Criador(a)",
            studio: "Espaço 01"
        },
        badge: {
            auth_access: "Acesso Verificado",
            claim: "Criar meu espaço",
            open: "Acesso Liberado",
            footer: "01-MS-ACESSO-CONCEDIDO"
        },
        share: {
            title: "Link do Espaço",
            copied: "Link Salvo"
        },
        catalog: {
            title: "Registro de Conexão"
        },
        analytics: {
            viral: "Vibe Radiante",
            high: "Sintonia Alta",
            stable: "Sintonia Calma",
            views: "Almas Visitantes"
        }
    }
};
