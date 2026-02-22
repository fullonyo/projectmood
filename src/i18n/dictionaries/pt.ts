export type Dictionary = typeof pt;

export const pt = {
    common: {
        save: "Salvar",
        cancel: "Cancelar",
        close: "Fechar",
        confirm: "Confirmar",
        loading: "Processando...",
        items: "itens",
        delete: "Excluir",
        duplicate: "Duplicar",
        enable_interaction: "Habilitar Interação",
        disable_interaction: "Desabilitar Interação",
    },

    sidebar: {
        header_subtitle: "Seu espaço digital",
        header_title: "Diorama",
        discard_changes: "Esquecer",
        tabs: {
            elements: "Elementos",
            elements_desc: "Adicionar notas, fotos e memórias físicas.",
            room: "Quarto",
            room_desc: "Luzes, cores e efeitos.",
            layers: "Camadas",
            layers_desc: "Gerenciar ordem e visibilidade",
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
        library: {
            title: "Catálogo",
            subtitle: "Injete elementos no espaço",
            items: {
                text: { title: "Nota de Papel", desc: "Escreva pensamentos livres" },
                photo: { title: "Fotografia", desc: "Cole imagens e fotos" },
                youtube: { title: "Fita de Vídeo", desc: "Embed YouTube" },
                spotify: { title: "Disco de Vinil", desc: "Música do Spotify" },
                doodle: { title: "Rascunho", desc: "Desenho à mão livre" },
                phrase: { title: "Letreiro", desc: "Animação de texto" },
                quote: { title: "Citação", desc: "Destaque frases marcantes" },
                typography: { title: "Tipografia & Vibes", desc: "Notas, Letreiros, Citações e Status" },
                countdown: { title: "Contagem", desc: "Marque uma data" },
                guestbook: { title: "Recados", desc: "Deixe os outros assinarem" },
                moodStatus: { title: "Estado Atual", desc: "Como você está agora?" },
                social: { title: "Link Salto", desc: "Leve para outro lugar" },
                gif: { title: "Animação", desc: "Reações em GIF (Giphy)" },
                weather: { title: "Clima", desc: "Como está o dia lá fora?" },
                universal_media: { title: "Mídia Universal", desc: "YouTube & Spotify" },
                media: { title: "Registro Analógico", desc: "Livros e obras" }
            },
            inspector_back: "Voltar para Elementos",
            more_coming: "Mais componentes em breve"
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
        command_center: "Centro de Comando",
    },

    editors: {
        universal_media: {
            title: "Mídia Universal",
            subtitle: "Sincronize sua vibe",
            video_tab: "YouTube",
            music_tab: "Spotify",
            youtube_placeholder: "COLE O LINK DO YOUTUBE...",
            youtube_btn: "Conectar Vídeo",
            spotify_placeholder: "BUSQUE MÚSICA OU ARTISTA...",
            spotify_btn: "Buscar no Spotify",
            aesthetic_label: "Estética do Bloco",
            update_btn: "Atualizar Mídia",
            deploy_btn: "Pendurar Mídia"
        },
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
            types: {
                ticker: "Letreiro",
                subtitle: "Legenda Cine",
                floating: "Texto Livre"
            }
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
            custom_link: "Link Personalizado",
            styles: {
                tag: "Etiqueta",
                glass: "Glass",
                minimal: "Minimal",
                neon: "Neon"
            }
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
            media_deploy: "Colar Resenha",
            tapes: {
                classic_white: "Branco Clássico",
                vintage_paper: "Papel Vintage",
                sky_blue: "Azul Céu",
                rose_petal: "Pétala de Rosa",
                mint_leaf: "Folha de Menta",
                washi_dot: "Washi Dot"
            },
            weather_vibes: {
                sun: "Ensolarado e calmo",
                rain: "Chuvoso e reflexivo",
                snow: "Frio e aconchegante",
                cloud: "Nublado e urbano",
                wind: "Ventoso e dinâmico"
            }
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
        delete_modal_confirm: "Excluir",
        layers: "Camadas",
        layer_hide: "Ocultar",
        layer_show: "Mostrar",
        layer_lock: "Bloquear",
        layer_unlock: "Desbloquear",
        layer_to_front: "Trazer para o topo",
        layer_to_back: "Enviar para o fundo",
        layer_forward: "Trazer para frente",
        layer_backward: "Recuar",
        layers_precision: "Precisão",
        layers_safe: "Renderização Segura",
        layers_normalize: "Normalizar Camadas",
        layers_normalized: "Camadas Normalizadas",
        distance_label: "Distância",
        align_label: "Alinhamento",
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
    },
    publish: {
        button: "publicar diorama",
        confirm_title: "publicar alterações?",
        confirm_message: "seu diorama será atualizado para todos os visitantes.",
        confirm_action: "publicar agora",
        success: "diorama publicado",
        last_published: "publicado",
        unpublished_changes: "mudanças pendentes",
        synced: "sincronizado",
        never_published: "nunca publicado",
        rollback: "reverter",
        rollback_confirm_title: "reverter para esta versão?",
        rollback_confirm_message: "o diorama público será atualizado para esta versão.",
        rollback_success: "versão revertida",
        version_history: "histórico",
        active_label: "ativa",
        no_versions: "nenhuma versão",
        loading_history: "carregando...",
        history_error: "erro ao carregar histórico"
    }
};
