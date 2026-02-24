import { Dictionary } from './pt';

export const en: Dictionary = {
    common: {
        save: "Save",
        cancel: "Cancel",
        close: "Close",
        confirm: "Confirm",
        loading: "Processing...",
        items: "items",
        delete: "Delete",
        duplicate: "Duplicate",
        enable_interaction: "Enable Interaction",
        disable_interaction: "Disable Interaction",
        select: "Select"
    },

    sidebar: {
        header_subtitle: "Your digital space",
        header_title: "Diorama",
        discard_changes: "Forget",
        tabs: {
            elements: "Elements",
            elements_desc: "Add notes, photos and physical memories.",
            room: "Fragment",
            room_desc: "Lights, colors and effects.",
            layers: "Layers",
            layers_desc: "Manage order and visibility",
        },

        style: {
            atmosphere_title: "Base atmosphere",
            atmosphere_desc: "Light, shadow and color of your space",
            magic_fx_title: "Fragment aura",
            magic_fx_desc: "Particles, noises and immersive textures",
            danger_title: "Let go of everything",
            danger_desc: "Start over, with a blank canvas",
            clear_wall_btn: "Erase all memories"
        },
        writing: {
            text_title: "Text fragments",
            text_desc: "Loose thoughts and outbursts",
        },
        media: {
            atmosphere_nodes_title: "Living Elements",
            atmosphere_nodes_desc: "Soundtrack and visual memories"
        },
        art: {
            creative_assets_title: "Kinetic expression",
            creative_assets_desc: "Stickers, doodles and mess"
        },
        library: {
            title: "Catalog",
            subtitle: "Inject elements into space",
            items: {
                text: { title: "Paper Note", desc: "Write loose thoughts" },
                photo: { title: "Photograph", desc: "Paste images and photos" },
                youtube: { title: "Video Tape", desc: "Embed YouTube" },
                spotify: { title: "Vinyl Record", desc: "Spotify Music" },
                doodle: { title: "Sketch", desc: "Freehand drawing" },
                phrase: { title: "Marquee", desc: "Text animation" },
                quote: { title: "Quote", desc: "Highlight striking phrases" },
                typography: { title: "Typography & Vibes", desc: "Notes, Marquees, Quotes and Status" },
                countdown: { title: "Countdown", desc: "Mark a date" },
                guestbook: { title: "Guestbook", desc: "Let others sign" },
                moodStatus: { title: "Current State", desc: "How are you right now?" },
                social: { title: "Jump Link", desc: "Take elsewhere" },
                gif: { title: "Animation", desc: "GIF reactions (Giphy)" },
                weather: { title: "Weather", desc: "How's the day outside?" },
                universal_media: { title: "Universal Media", desc: "YouTube & Spotify" },
                media: { title: "Analog Record", desc: "Books and works" },
                shape: { title: "Artistic Shapes", desc: "Geometry and Blending" }
            },
            inspector_back: "Back to Elements",
            more_coming: "More components soon"
        },

        bottom_tip: "Click on blocks to rotate or delete them",
    },
    modals: {
        clear_wall: {
            title: "Clear Wall?",
            message: "This will erase all memories drawn in this space. Are you ready for a fresh start?",
            confirm_btn: "Yes, let it go"
        }
    },
    doodle: {
        fullscreen_canvas: "Soul Doodles",
        fullscreen_desc: "Leave an instant mark of your feeling.",
        start_drawing: "Doodle on the wall",
        cancel_drawing: "Forget doodle",
        clear_screen: "Clear Screen",
        kinetic_active: "Letting emotion flow...",
        manifesting: "Saving...",
        confirm_save: "Place doodle on panel",
        stroke_weight: "Thickness",
        identity_chrome: "Ink"
    },
    landing: {
        studio_platform: "Studio Platform",
        curator_access_only: "For feeling curators only",
        hero_title_curate: "A Home for",
        hero_title_your: "What",
        hero_title_reality: "You Feel.",
        hero_subtitle: "Create a space that hugs you back. Keep music, photos, and whispers in a digital sanctuary made of memories and care.",
        btn_create_studio: "Build my Fragment",
        version_deployment: "Syncing reality...",
        visuals: "01 // FRAGMENT",
        audio: "02 // FEELING",
        curation: "03 // MEMORY",
        showcase: {
            structure_title: "01 // YOUR SAFE FRAGMENT",
            structure_desc: "A space that is yours alone, free from judgment. Organize your mind and heart in a layout that breathes with you.",
            atmosphere_title: "02 // THE WARMTH OF NOW",
            atmosphere_desc: "Music that understands your soul and weather that follows your tears or smiles. The atmosphere reacts to your heart.",
            connection_title: "03 // SHARED AFFECTION",
            connection_desc: "Receive digital hugs through messages and share your essence with those who matter. Where connection is real and kind."
        },
        privacy: "Privacy Protocol",
        terms: "Access Terms",
        login_btn: "Login"
    },
    auth: {
        login: {
            auth_protocol: "Recognition",
            identify_presence: "Feel at home",
            title: "Enter my",
            title_italic: "Fragment",
            identity_url: "Your Email",
            placeholder_email: "your@email.com",
            access_key: "Your heart's key (Password)",
            placeholder_password: "••••••••",
            initiate_access: "Enter Fragment",
            unauthorized: "Don't have a place yet?",
            establish_identity: "Create my hideaway",
            protocol_denied: "Your essence was not recognized.",
            protocol_error: "Lost whisper: Connection failure",
            abort: "Back",
            footer: "Private Space // MoodSpace",
            authorizing: "Opening the door..."
        },
        register: {
            entity_reg: "Manifestation",
            request_alloc: "A new beginning",
            title: "Create my",
            title_italic: "Fragment",
            unique_identifier: "What should we call you?",
            placeholder_username: "your_essence",
            communication_node: "Your Email",
            placeholder_email: "your@email.com",
            private_key: "Your heart's key (Password)",
            placeholder_password: "••••••••",
            register_identity: "Start my journey",
            already_registered: "Already have your place?",
            resume_session: "Enter now",
            identity_rejected: "Manifestation interrupted",
            identity_established: "Your fragment has been prepared. Entering...",
            cancel: "Back",
            footer: "Allocation System // MoodSpace",
            establishing: "Creating keys..."
        }
    },
    leftSidebar: {
        greeting_morning: "Good morning",
        greeting_afternoon: "Good afternoon",
        greeting_night: "Good night",
        system_node: "Your online spot",
        active_studio: "Opened fragment",
        identity_protocol: "Current visitor",
        access_level: "Your plan",
        studio_free: "Free",
        system_status: "Status",
        authorized: "Settled in",
        deployment_area: "Share the key",

        external_visibility: "Let others into your fragment",
        launch_public_space: "Visit public space",
        system_configuration: "Settings",
        identity_registry: "Your account",
        system_ux: "Fragment preferences",
        terminate_session: "Leave fragment",
        exit_hex: "Lock the door",
        command_center: "Command Center",
    },

    editors: {
        universal_media: {
            title: "Universal Media",
            subtitle: "Sync your vibe",
            video_tab: "YouTube",
            music_tab: "Spotify",
            youtube_placeholder: "PASTE YOUTUBE LINK...",
            youtube_btn: "Connect Video",
            spotify_placeholder: "SEARCH MUSIC OR ARTIST...",
            spotify_btn: "Search on Spotify",
            aesthetic_label: "Block Aesthetic",
            update_btn: "Update Media",
            deploy_btn: "Hang Media"
        },
        theme: {
            title: "1. Weather & Vibe",
            title_desc: "The main color and lighting of the environment.",
            light: "Classic",
            dark: "Midnight",
            vintage: "Vintage",
            notebook: "Notebook",
            blueprint: "Blueprint",
            canvas: "Canvas",
            cyberpunk: "Cyberpunk",
            neobrutalism: "Neo-Brutalism",
            botanical: "Biophilic",
            ethereal: "Ethereal",
            charcoal: "Lead (Monochrome)",
            terminal: "Retro Terminal",
            doodle: "Sketchbook",
            manga: "Manga",
            y2k: "Frutiger Y2K",
            tarot: "Mystic Tarot",
            node_luminance: "Highlight color",
            luminance_desc: "Choose the color that represents you most now.",
            atomic_typography: "Main letter",
            base_system: "Letter Styles",
            textures_title: "2. Wall Material",
            textures_desc: "The tactile finish that goes over the color.",
            textures: {
                none: "Flat",
                noise: "TV Noise",
                dots: "Halftone",
                lines: "Notebook",
                cross: "X Grid",
                museum_paper: "Museum Paper",
                raw_canvas: "Raw Canvas",
                fine_sand: "Fine Sand"
            }
        },
        text: {
            title: "Write something",
            placeholder: "What are you thinking about?",
            substrate: "Paper type",
            node_color: "Paper color",
            font_scale: "Letter size",
            alignment: "Alignment",
            deploy: "Paste on mural",
            styles: {
                simple: "Simple",
                postit: "Post-it",
                ripped: "Ripped",
                typewriter: "Typewriter"
            }
        },
        photo: {
            title: "Develop a photo",
            drop_link: "Drop photo here",
            inject_visual: "Drag your photo here",
            format_hint: "FORMATS // PNG, JPG, WEBP",
            processing: "Developing...",
            live_preview: "How it looks:",
            caption: "Memory (Caption)",
            caption_placeholder: "Write something about this photo...",
            alt_text: "Alt Text (Accessibility)",
            alt_placeholder: "Describe the image for those who can't see...",
            filter: "Photo Filter",
            geometry: "Frame",
            deploy: "Hang photo",
            error_load: "Photographic aura corrupted. Could not read.",
            error_process: "The image did not resist the compression process."
        },
        phrase: {
            title: "Loose thoughts",
            protocol_type: "Animation Type",
            placeholder: "Leave a loose sentence here...",
            aura_style: "Style",
            flow: "Direction",
            cursor: "Cursor",
            text_color: "Text Color",
            bg_color: "Background Color",
            speed: "Speed",
            left: "Left",
            right: "Right",
            deploy: "Let it roll",
            types: {
                ticker: "Ticker",
                subtitle: "Movie Subtitle",
                floating: "Free Text"
            }
        },

        youtube: {
            title: "Play a clip",
            placeholder: "Paste YouTube link here...",
            established: "Video connected",
            deploy: "Start the tape",
            error: "Could not connect to this link.",
            supported: "We support links like: youtu.be, youtube.com/watch",
        },
        effects: {
            cursor_title: "Your cursor",
            trails_title: "Mouse trail",
            atmosphere_title: "Fragment atmosphere",
            active: "Selected",
            syncing: "Changing atmosphere...",
            deployed: "All ready.",
            cursors: {
                auto: "Standard Arrow",
                retro: "Retro Arrow",
                heart: "Heart",
                pixel: "Pixel Grid",
                ghost: "Ghostly"
            },
            trails: {
                none: "None",
                sparkles: "Sparkles",
                ghost: "Ghost",
                "pixel-dust": "Pixel Dust"
            },
            backgrounds: {
                none: "Solid Color",
                noise: "Analog Noise",
                aurora: "Northern Lights",
                liquid: "Liquid Flow",
                "mesh-gradient": "Mesh Gradient",
                metaballs: "Metaballs",
                hyperspeed: "Light Speed",
                rain: "Melancholy Rain",
                rhythm: "Wave Rhythm",
                vintage: "Vintage Film",
                universe: "Deep Universe",
                "grid-move": "Retro Grid",
                stars: "Starfield"
            }
        },
        countdown: {
            title: "Countdown",
            label: "When is it for?",
            placeholder: "My birthday...",
            target: "Marked date",
            registry: "Special icon",
            substrate: "Appearance",
            deploy: "Start countdown",
        },
        guestbook: {
            title: "Guestbook mural",
            subtitle: "Connection Registry",
            label: "What's the question or title?",
            placeholder: "Leave a little note...",
            color_label: "Main Color",
            deploy: "Paste on mural",
            update: "Update Mural",
            visit_active: "People will be able to write in your fragment.",
            tabs: {
                connection: "Connection",
                esthetics: "Aesthetics"
            },
            style_label: "Visual Theme",
            layout_label: "Display Mode",
            layouts: {
                classic: "Classic (Box)",
                scattered: "Scattered (Post-it)",
                cloud: "Cloud (Floating)"
            },
            styles: {
                glass: "Studio Glass (Premium)",
                vhs: "VHS / Retro (Analog)",
                cyber: "Cyber / Minimal (Cleaner)",
                paper: "Paper / Post-it (Physical)"
            }
        },
        mood: {
            title: "Your current state",
            registry: "How are you?",
            buffer: "Write what you're feeling (optional)",
            placeholder: "Everything's chill...",
            deploy: "Leave feeling",
        },
        quote: {
            title: "Quote",
            label_text: "What was said?",
            placeholder: "Write quote here...",
            label_author: "Who said that? (Optional)",
            author: "Author",
            style_title: "Style",
            color_text: "Text Color",
            color_bg: "Background Color",
            show_quotes: "Add decorative quotes",
            deploy: "Mark quote",
        },
        social: {
            title: "Add Social Link",
            nodes: "What link is this?",
            link_protocol: "What's the link?",
            link_placeholder: "https://...",
            visual_alias: "What should it be called? (Optional)",
            alias_placeholder: "My profile...",
            sub_label: "Small Caption (Optional)",
            sub_label_placeholder: "ex: New videos every Friday!",
            layout_bento: "Bento Box Layout",
            layout_bento_desc: "Hides text and creates a circular/square button",
            layout_borderless: "Hide Background & Border",
            layout_borderless_desc: "Turns off the social block frame leaving it floating",
            style_manifesto: "Button Style",
            deploy: "Add link",
            custom_link: "Custom Link",
            styles: {
                tag: "Tag",
                glass: "Glass",
                minimal: "Minimal",
                neon: "Neon",
                pill: "Pill",
                brutalist: "Brutal",
                ghost: "Ghost",
                clay: "Clay",
                retro: "Retro",
                aura: "Aura"
            }
        },
        doodle: {
            title: "Your sketch page",
            manifest: "Draw fullscreen on your wall."
        },
        gif: {
            title: "Reactions and Gifs",
            powered_by: "Pick your gif (Giphy).",
            search_placeholder: "Search gif...",
            searching: "Searching...",
            deploy: "Paste Gif",
            not_found: "No gif found"
        },
        block_manager: {
            delete_confirm: "Are you sure you want to remove this memory?",
            labels: {
                text: "Notes",
                music: "Spotify Music",
                photo: "Image / Photo",
                video: "YouTube Video",
                quote: "Quote",
                moodStatus: "Mood: ",
                countdown: "Countdown",
                social: "link",
                weather: "Vibe: ",
                book: "Book",
                movie: "Movie",
                gif: "Animated GIF",
                doodle: "Hand Drawn",
                guestbook: "Guestbook",
                default: "Content Block"
            },
            feed_title: "Your World",
            empty: "No blocks yet...",
        },
        art: {
            tape_title: "Stickers and tapes",
            weather_title: "Current weather",
            weather_state: "How's the day?",
            weather_location: "From where?",
            weather_location_placeholder: "London, NY, Tokyo...",
            weather_temp: "Temperature (Optional)",
            weather_temp_placeholder: "22°C, Freezing, Hot...",
            weather_deploy: "Paste weather",
            media_title: "Books and Movies",
            media_book: "Book",
            media_movie: "Movie",
            media_work_title: "What's the name?",
            media_work_title_placeholder: "Work name...",
            media_critique: "3-word summary",
            media_critique_placeholder: "Amazing, Boring, Surreal...",
            media_deploy: "Paste Review",
            tapes: {
                classic_white: "Classic White",
                vintage_paper: "Vintage Paper",
                sky_blue: "Sky Blue",
                rose_petal: "Rose Petal",
                mint_leaf: "Mint Leaf",
                washi_dot: "Washi Dot"
            },
            weather_vibes: {
                sun: "Sunny and calm",
                rain: "Rainy and reflective",
                snow: "Cold and cozy",
                cloud: "Cloudy and urban",
                wind: "Windy and dynamic"
            },
        },
        weather: {
            title: "Weather Studio",
            subtitle: "Real-Time Atmosphere",
            location_label: "City / Location",
            vibe_label: "Moment Message (Vibe)",
            update_btn: "Update Weather",
            deploy_btn: "Launch to Mural",
            location_placeholder: "Ex: London, Tokyo...",
            vibe_placeholder: "Ex: Rainy Afternoon...",
            tabs: {
                connection: "Connection",
                esthetics: "Aesthetics"
            }
        },
        shape: {
            title: "Smart Shapes",
            subtitle: "Artistic Geometry & Blending",
            geometry_label: "Base Geometry",
            adjust_sides: "Sides Adjustment",
            adjust_points: "Points Adjustment",
            color_label: "Solid Color",
            opacity_label: "Opacity",
            blend_label: "Blend Mode",
            blur_label: "Blur Effect",
            deploy_btn: "Add to Mural",
            update_btn: "Update Shape",
            shapes: {
                circle: "Circle",
                rect: "Rectangle",
                triangle: "Triangle",
                polygon: "Polygon",
                star: "Star",
                blob: "Organic",
                line: "Line",
                grid: "Grid",
                flower: "Flower",
                mesh: "Web",
                wave: "Wave",
                spiral: "Spiral"
            },
            tabs: {
                geometry: "Geometry",
                style: "Aesthetics",
                effects: "FX Effects"
            },
            glow_label: "Aura Intensity (Glow)",
            float_label: "Kinetic Fluctuation",
            float_speed_label: "Movement Speed",
            float_on: "On",
            float_off: "Static",
            gradient_type_label: "Gradient Type",
            gradient_linear: "Linear",
            gradient_radial: "Radial",
            variation_label: "Organic Variation"
        },
        palette: {
            title: "Extract Atmosphere",
            desc: "Define colors through an image",
            drag: "Drag an image here",
            drop: "Drop the image",
            hint: "FORMATS // PNG, JPG, WEBP",
            analyzing: "Analyzing aura...",
            apply: "Apply Colors to Fragment"
        },

        spotify: {
            title: "Soundtrack",
            search_placeholder: "Which song to look for?",
            search_btn: "Search Song",
            error: "Search error",
            results: "Results",
            source: "Source"
        },
        share: {
            link: "Share",
            copied: "Copied",
            qr_code: "QR CODE",
            save_qr: "Save QR"
        }
    },
    canvas: {
        weather_registry: "Current Weather",
        sync_active: "Syncing...",
        creativity_domain: "Your Space",
        delete_modal_title: "Delete Item?",
        delete_modal_message: "This action cannot be undone. The item will be permanently removed from your mural.",
        delete_modal_confirm: "Delete",
        layers: "Layers",
        layer_hide: "Hide",
        layer_show: "Show",
        layer_lock: "Lock",
        layer_unlock: "Unlock",
        layer_to_front: "Bring to top",
        layer_to_back: "Send to back",
        layer_forward: "Bring forward",
        layer_backward: "Send backward",
        layers_precision: "Precision",
        layers_safe: "Safe Rendering",
        layers_normalize: "Normalize Layers",
        layers_normalized: "Layers Normalized",
        distance_label: "Distance",
        align_label: "Alignment",
    },



    public_page: {
        signature: {
            role: "Creator",
            studio: "Space 01"
        },
        badge: {
            auth_access: "Verified Access",
            claim: "Create my space",
            open: "Access Released",
            footer: "01-MS-ACCESS-GRANTED"
        },
        share: {
            title: "Space Link",
            copied: "Link Saved"
        },
        catalog: {
            title: "Connection Registry"
        },
        analytics: {
            viral: "Radiant Vibe",
            high: "High Tune",
            stable: "Calm Tune",
            views: "Visiting Souls"
        },
        overlay: {
            title: "MoodSpace",
            click_to_enter: "Click to enter"
        }
    },
    publish: {
        button: "publish diorama",
        confirm_title: "publish changes?",
        confirm_message: "your diorama will be updated for all visitors.",
        confirm_action: "publish now",
        success: "diorama published",
        last_published: "published",
        unpublished_changes: "pending changes",
        synced: "synced",
        never_published: "never published",
        rollback: "rollback",
        rollback_confirm_title: "rollback to this version?",
        rollback_confirm_message: "the public diorama will be updated to this version.",
        rollback_success: "version rolled back",
        version_history: "history",
        active_label: "active",
        no_versions: "no versions",
        loading_history: "loading...",
        history_error: "error loading history"
    },
    templates: {
        chooser_title: "What's your vibe today?",
        chooser_subtitle: "Choose a template to start or create from scratch",
        empty_state: "Your mural is empty",
        items: {
            focus: {
                title: "Deep Work",
                vibe: "Aurora • Spotify Lo-fi • Focus",
                desc: "Immersive workstation: POMODORO timer, Lo-fi soundtrack, and production quick links."
            },
            scrapbook: {
                title: "Scrapbook",
                vibe: "Paper • Polaroid • Connection",
                desc: "The memories sanctuary: tactile textures, Polaroid photos, and a collective wall for connections."
            },
            cyber: {
                title: "Cyber Station",
                vibe: "Grid • YouTube VHS • Neon",
                desc: "Tech-noir interface: real-time network logs, Glitch video vibes, and neon curation."
            },
            zen: {
                title: "Atmospheric Zen",
                vibe: "Liquid • Kyoto • Flow",
                desc: "Ethereal peace: synchronous weather, fluid meditation, and floating phrases to calm the mind."
            }
        },
        applying: "Tuning Vibe...",
        start_fresh: "Start from Scratch"
    }
};
