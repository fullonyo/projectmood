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
        select: "Selecionar",
        regenerate: "Regenerar",
        opacity: "Opacidade",
        blur: "Desfoque",
        update: "Atualizar",
        deploy: "Colocar no Mural",
        mute_audio: "Silenciar Tudo",
        unmute_audio: "Ativar Som Global"
    },

    sidebar: {
        header_subtitle: "Seu espaço digital",
        header_title: "Diorama",
        discard_changes: "Esquecer",
        tabs: {
            elements: "Elementos",
            elements_desc: "Adicionar notas, fotos e memórias físicas.",
            room: "Mood",
            room_desc: "Luzes, cores e efeitos.",
            layers: "Camadas",
            layers_desc: "Gerenciar ordem e visibilidade",
        },


        style: {
            atmosphere_title: "Atmosfera base",
            atmosphere_desc: "Luz, sombra e cor do seu espaço",
            magic_fx_title: "Aura do Mood",
            magic_fx_desc: "Partículas, ruídos e texturas imersivas",
            danger_title: "Desapegar de tudo",
            danger_desc: "Começar de novo, com a tela em branco",
            clear_wall_btn: "Apagar todas as memórias"
        },
        writing: {
            text_title: "Moods de texto",
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
                social: { title: "Conexões", desc: "Links e redes sociais" },
                gif: { title: "Animação", desc: "Reações em GIF (Giphy)" },
                weather: { title: "Clima", desc: "Como está o dia lá fora?" },
                universal_media: { title: "Mídia Universal", desc: "YouTube, Spotify & Áudio" },
                media: { title: "Mídia Universal", desc: "YouTube, Spotify & Áudio" },
                shape: { title: "Formas", desc: "Geometria e estética" },
                rorschach: { title: "Rorschach", desc: "Arte generativa" }
            },
            inspector_back: "Voltar para Elementos",
            more_coming: "Mais componentes em breve"
        },

        insight: {
            atmosphere: "Atmosfera.v1",
            luminance: "Luminance.Spectrum",
            memories: "Memórias",
            released: "Publicado",
            dynamic_weight: "Peso cromático dinâmico dos nós ativos"
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
        hero_title_curate: "Um Lugar para os",
        hero_title_your: "Seus",
        hero_title_reality: "Sentimentos.",
        hero_subtitle: "Crie um mural que te abrace. Guarde músicas, fotos e sussurros em um santuário digital feito de memórias e afeto.",
        btn_create_studio: "Criar meu Mood",
        version_deployment: "Sincronizando a realidade...",
        visuals: "01 // ACOLHIMENTO",
        audio: "02 // SENTIMENTO",
        curation: "03 // MEMÓRIA",
        showcase: {
            structure_title: "01 // SEU PORTO SEGURO",
            structure_desc: "Um espaço que é só seu, livre de julgamentos. Organize sua mente e seu coração em um layout que respira com você.",
            atmosphere_title: "02 // O CALOR DO MOMENTO",
            atmosphere_desc: "Músicas que entendem sua alma e climas que acompanham suas lágrimas ou sorrisos. A atmosfera reage ao seu coração.",
            connection_title: "03 // AFETO PARTILHADO",
            connection_desc: "Receba abraços em forma de mensagens e compartilhe sua essência com quem importa. Onde a conexão é real e carinhosa."
        },
        privacy: "Protocolo de Privacidade",
        terms: "Termos de Acesso",
        login_btn: "Entrar"
    },
    auth: {
        login: {
            auth_protocol: "Reconhecimento",
            identify_presence: "Sinta-se em casa",
            title: "Entrar no meu",
            title_italic: "Mood",
            identity_url: "Seu Email",
            placeholder_email: "seu@email.com",
            access_key: "Sua chave do coração (Senha)",
            placeholder_password: "••••••••",
            initiate_access: "Entrar no Mood",
            unauthorized: "Ainda não tem um lugar?",
            establish_identity: "Criar meu cantinho",
            protocol_denied: "Sua essência não foi reconhecida.",
            protocol_error: "Sussurro perdido: Falha na conexão",
            abort: "Voltar",
            footer: "Espaço Particular // MoodSpace",
            authorizing: "Abrindo a porta..."
        },
        register: {
            entity_reg: "Manifestação",
            request_alloc: "Um novo começo",
            title: "Criar meu",
            title_italic: "Mood",
            unique_identifier: "Como quer ser chamado(a)?",
            placeholder_username: "sua_essência",
            communication_node: "Seu Email",
            placeholder_email: "seu@email.com",
            private_key: "Sua chave do coração (Senha)",
            placeholder_password: "••••••••",
            register_identity: "Começar minha jornada",
            already_registered: "Já tem seu lugar?",
            resume_session: "Entrar agora",
            identity_rejected: "Manifestação interrompida",
            identity_established: "Seu Mood foi preparado. Entrando...",
            cancel: "Voltar",
            footer: "Sistema de Alocação // MoodSpace",
            establishing: "Criando chaves...",
        },
        promotion: {
            title: "Gostou deste Mood?",
            subtitle: "Crie seu próprio espaço de sentimentos.",
            btn_claim: "Registrar meu Mood",
            viewing_status: "Explorando a essência de",
            official_registry: "Protocolo de Visitação",
            dismiss: "[ Esconder Console ]"
        }
    },
    leftSidebar: {
        greeting_morning: "Bom dia",
        greeting_afternoon: "Boa tarde",
        greeting_night: "Boa noite",
        system_node: "Seu canto online",
        active_studio: "Mood aberto",
        identity_protocol: "Visitante atual",
        access_level: "Seu plano",
        studio_free: "Livre",
        system_status: "Status",
        authorized: "Acomodado",
        deployment_area: "Compartilhar a chave",

        external_visibility: "Deixe os outros entrarem no seu Mood",
        launch_public_space: "Visitar espaço público",
        system_configuration: "Configurações",
        identity_registry: "Sua conta",
        system_ux: "Preferências do Mood",
        terminate_session: "Deixar o Mood",
        exit_hex: "Trancar a porta",
        command_center: "Centro de Comando",
    },

    editors: {
        universal_media: {
            title: "Mídia Universal",
            subtitle: "Sincronize sua vibe",
            video_tab: "YouTube",
            music_tab: "Spotify",
            audio_tab: "Arquivo Local",
            youtube_placeholder: "COLE O LINK DO YOUTUBE...",
            youtube_btn: "Conectar Vídeo",
            spotify_placeholder: "BUSQUE MÚSICA OU ARTISTA...",
            spotify_btn: "Buscar no Spotify",
            audio_placeholder: "ARRASTE OU CLIQUE PARA ÁUDIO...",
            audio_btn: "Carregar Faixa",
            audio_title_label: "Título da Memória",
            audio_artist_label: "Autor / Artista",
            error_size: "Muito pesado (Limite 10MB)",
            error_type: "Formato inválido (Use MP3/WAV)",
            aesthetic_label: "Estética do Bloco",
            lyrics_label: "Legendas Sincronizadas",
            lyrics_placeholder: "[00:00] Início da música\n[00:12] Primeira frase...",
            lyrics_hint: "Use o formato [mm:ss] para cada linha.",
            update_btn: "Atualizar Mídia",
            deploy_btn: "Pendurar Mídia"
        },
        theme: {
            title: "1. Clima e Vibe",
            title_desc: "A cor e iluminação principal do ambiente.",
            light: "Clássico",
            dark: "Meia-noite",
            vintage: "Vintage",
            notebook: "Caderno",
            blueprint: "Projeto",
            canvas: "Tela",
            cyberpunk: "Cibernético",
            neobrutalism: "Neo-Brutalismo",
            botanical: "Biofílico",
            ethereal: "Etéreo",
            charcoal: "Chumbo (Monocromático)",
            terminal: "Terminal Retro",
            doodle: "Caderno de Rascunhos",
            manga: "Mangá",
            y2k: "Frutiger Y2K",
            tarot: "Tarô Místico",
            node_luminance: "Cor do destaque",
            luminance_desc: "Escolha a cor que mais te representa agora.",
            atomic_typography: "Letra principal",
            base_system: "Estilos de Letra",
            textures_title: "2. Material da Parede",
            textures_desc: "O acabamento tátil que vai por cima da cor.",
            textures: {
                none: "Plano",
                noise: "Ruído TV",
                dots: "Halftone",
                lines: "Caderno",
                cross: "Grade X",
                museum_paper: "Papel Museu",
                raw_canvas: "Canvas Cru",
                fine_sand: "Areia Fina"
            }
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
        rorschach: {
            title: "Smart Rorschach",
            subtitle: "Arte generativa simétrica",
            tabs: {
                geometry: "Geometria",
                style: "Estilo"
            },
            seed: "Semente",
            symmetry: "Simetria",
            complexity: "Complexidade",
            color: "Cor da Tinta",
            symmetries: {
                vertical: "Vertical",
                horizontal: "Horizontal",
                quad: "Quad"
            }
        },
        effects: {
            cursor_title: "Seu cursor",
            trails_title: "Rastro do mouse",
            atmosphere_title: "Atmosfera do Mood",
            active: "Selecionado",
            syncing: "Mudando a atmosfera...",
            deployed: "Tudo pronto.",
            cursors: {
                auto: "Seta Padrão",
                retro: "Seta Retro",
                heart: "Coração",
                pixel: "Pixel Grid",
                ghost: "Fantasmagórico"
            },
            trails: {
                none: "Nenhum",
                sparkles: "Brilhos",
                ghost: "Fantasma",
                "pixel-dust": "Poeira Pixel"
            },
            backgrounds: {
                none: "Cor Sólida",
                noise: "Ruído Analógico",
                aurora: "Aurora Boreal",
                liquid: "Fluxo Líquido",
                "mesh-gradient": "Gradiente Mesh",
                metaballs: "Metaballs",
                hyperspeed: "Velocidade Luz",
                rain: "Chuva de Melancolia",
                rhythm: "Ritmo de Ondas",
                vintage: "Filme Vintage",
                universe: "Universo Profundo",
                "grid-move": "Grade Retro",
                stars: "Campo Estelar"
            }
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
            subtitle: "Registro de Conexões",
            label: "Qual é a pergunta ou título?",
            placeholder: "Deixe um recadinho...",
            color_label: "Cor Principal",
            deploy: "Colar no mural",
            update: "Atualizar Mural",
            visit_active: "As pessoas poderão escrever no seu Mood.",
            tabs: {
                connection: "Conexão",
                esthetics: "Estética"
            },
            style_label: "Tema Visual",
            layout_label: "Modo de Exibição",
            layouts: {
                classic: "Clássico (Box)",
                scattered: "Espalhado (Post-it)",
                cloud: "Nuvem (Flutuante)"
            },
            styles: {
                glass: "Studio Glass (Premium)",
                vhs: "VHS / Retro (Analógico)",
                cyber: "Cyber / Minimal (Cleaner)",
                paper: "Paper / Post-it (Físico)"
            }
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
            sub_label: "Legenda Pequena (Opcional)",
            sub_label_placeholder: "ex: Novos vídeos toda sexta!",
            layout_bento: "Layout em Cubo (Bento Box)",
            layout_bento_desc: "Oculta textos e cria um botão circular/quadrado",
            layout_borderless: "Ocultar Fundo e Borda",
            layout_borderless_desc: "Desliga a caixa da rede social deixando-a flutuante",
            style_manifesto: "Estilo do Botão",
            deploy: "Adicionar link",
            custom_link: "Link Personalizado",
            styles: {
                tag: "Tag",
                glass: "Vidro",
                minimal: "Minimal",
                neon: "Neon",
                pill: "Pílula",
                brutalist: "Brutal",
                ghost: "Fantasma",
                clay: "Clay",
                retro: "Retro",
                aura: "Aura"
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
            },
        },
        weather: {
            title: "Weather Studio",
            subtitle: "Atmosfera em Tempo Real",
            location_label: "Cidade / Local",
            vibe_label: "Mensagem do Momento (Vibe)",
            update_btn: "Atualizar Clima",
            deploy_btn: "Lançar ao Mural",
            location_placeholder: "Ex: Londres, Tóquio...",
            vibe_placeholder: "Ex: Tarde Chuvosa...",
            tabs: {
                connection: "Conexão",
                esthetics: "Estética"
            }
        },
        shape: {
            title: "Smart Shapes",
            subtitle: "Geometria Artística & Mesclagem",
            geometry_label: "Geometria Base",
            adjust_sides: "Ajustes de Lados",
            adjust_points: "Ajustes de Pontas",
            color_label: "Cor Sólida",
            opacity_label: "Opacidade",
            blend_label: "Modo de Mesclagem (Blend Mode)",
            blur_label: "Efeito de Desfoque (Blur)",
            deploy_btn: "Adicionar ao Mural",
            update_btn: "Atualizar Forma",
            shapes: {
                circle: "Círculo",
                rect: "Retângulo",
                triangle: "Triângulo",
                polygon: "Polígono",
                star: "Estrela",
                blob: "Orgânico",
                line: "Linha",
                grid: "Grade",
                flower: "Flor",
                mesh: "Teia",
                wave: "Onda",
                spiral: "Espiral"
            },
            tabs: {
                geometry: "Geometria",
                style: "Estética",
                effects: "Efeitos FX"
            },
            glow_label: "Intensidade da Aura (Glow)",
            float_label: "Flutuação Cinética",
            float_speed_label: "Velocidade do Movimento",
            float_on: "Ligado",
            float_off: "Estático",
            gradient_type_label: "Tipo de Gradiente",
            gradient_linear: "Linear",
            gradient_radial: "Radial",
            variation_label: "Variação Orgânica"
        },
        palette: {
            title: "Extrair Atmosfera",
            desc: "Defina cores através de uma imagem",
            drag: "Arraste uma imagem para cá",
            drop: "Pode soltar a imagem",
            hint: "FORMATOS // PNG, JPG, WEBP",
            analyzing: "Analisando aura...",
            apply: "Aplicar Cores no Mood"
        },

        spotify: {
            title: "Trilha Sonora",
            search_placeholder: "Qual música procurar?",
            search_btn: "Procurar Música",
            error: "Erro de busca",
            results: "Resultados",
            source: "Fonte"
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
        },
        overlay: {
            title: "MoodSpace",
            click_to_enter: "Clique para entrar"
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
    },
    templates: {
        chooser_title: "Qual é a sua vibe hoje?",
        chooser_subtitle: "Escolha um template para começar ou crie do zero",
        empty_state: "O seu mural está vazio",
        items: {
            focus: {
                title: "Deep Work",
                vibe: "Aurora • Spotify Lo-fi • Focus",
                desc: "Estação de trabalho imersiva: cronômetro POMODORO, trilha sonora Lo-fi e links rápidos para produção."
            },
            scrapbook: {
                title: "Scrapbook",
                vibe: "Papel • Polaroid • Afeto",
                desc: "O santuário das memórias: texturas táteis, fotos Polaroid e um mural coletivo para registrar afetos."
            },
            cyber: {
                title: "Cyber Station",
                vibe: "Grid • YouTube VHS • Neon",
                desc: "Interface tech-noir: logs de rede em tempo real, ambientação Glitch de vídeo e curadoria neon."
            },
            zen: {
                title: "Atmospheric Zen",
                vibe: "Líquido • Kyoto • Fluidez",
                desc: "Paz etérea: clima síncrono, meditação fluida e frases que flutuam para acalmar a mente."
            }
        },
        applying: "Sintonizando Vibe...",
        start_fresh: "Começar do Zero"
    },
    hotkeys: {
        title: "Comandos & Atalhos",
        subtitle: "Acesse o poder do MoodSpace",
        sections: {
            basics: "Essenciais",
            organize: "Organização",
            layers: "Camadas & Fluxo"
        },
        keys: {
            move: "Mover blocos",
            nudge: "Ajuste fino (1px)",
            nudgeshift: "Impulso (10px)",
            delete: "Deletar seleção",
            duplicate: "Duplicar bloco",
            group: "Agrupar blocos",
            ungroup: "Desagrupar",
            undo: "Desfazer",
            redo: "Refazer",
            escape: "Deselecionar tudo",
            bring_front: "Trazer para frente",
            send_back: "Enviar para trás",
            proportional: "Redimensionar proporcional",
            snapping: "Snap de eixo",
            copy: "Copiar blocos",
            paste: "Colar blocos",
            zoom: "Zoom in/out",
            pan: "Mover câmera (Pan)"
        }
    }
};
