import { Dictionary } from './pt';

export const en: Dictionary = {
    common: {
        save: "Save",
        cancel: "Cancel",
        close: "Close",
        confirm: "Confirm",
        loading: "Processing...",
    },
    sidebar: {
        header_subtitle: "Your digital space",
        header_title: "Diorama",
        discard_changes: "Forget",
        tabs: {
            style: "Style",
            style_desc: "Light and Color",
            writing: "Writing",
            writing_desc: "Texts",
            media: "Media",
            media_desc: "Content",
            art: "Creative",
            art_desc: "Assets",
        },
        style: {
            atmosphere_title: "Base atmosphere",
            atmosphere_desc: "Light, shadow and color of your space",
            magic_fx_title: "Room aura",
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
        bottom_tip: "Click on the blocks on the wall to rotate or delete them",
    },
    modals: {
        clear_wall: {
            title: "Clear Wall?",
            message: "This will erase all the memories drawn in this space. Are you ready for a fresh start?",
            confirm_btn: "Yes, let it go"
        }
    },
    doodle: {
        fullscreen_canvas: "Soul Doodles",
        fullscreen_desc: "Leave an instant mark of your feeling.",
        start_drawing: "Doodle on the wall",
        cancel_drawing: "Forget doodle",
        clear_screen: "Clear Screen",
        kinetic_active: "Letting the emotion flow...",
        manifesting: "Keeping...",
        confirm_save: "Pin doodle on board",
        stroke_weight: "Thickness",
        identity_chrome: "Ink"
    },
    landing: {
        studio_platform: "Studio Platform",
        curator_access_only: "For feeling curators only",
        hero_title_curate: "Build",
        hero_title_your: "Your",
        hero_title_reality: "Atmosphere.",
        hero_subtitle: "A minimalist canvas for digital curatorship. Music, media, and atmosphere all in one place.",
        btn_create_studio: "My first room",
        version_deployment: "Syncing reality...",
        visuals: "01 // VISUALS",
        audio: "02 // AUDIO",
        curation: "03 // CURATION",
        privacy: "Privacy Protocol",
        terms: "Access Terms",
        login_btn: "Login"
    },
    auth: {
        login: {
            auth_protocol: "Identification",
            identify_presence: "Aura recognition",
            title: "Enter",
            title_italic: "Room",
            identity_url: "Your mail (Email)",
            placeholder_email: "your@access.com",
            access_key: "Your secret key (Password)",
            placeholder_password: "••••••••",
            initiate_access: "Open the door",
            unauthorized: "Don't have a key yet?",
            establish_identity: "Create one",
            protocol_denied: "Your aura was not recognized.",
            protocol_error: "System Error: Connection failed",
            abort: "Go Back",
            footer: "Secure Connection // TLS_v1.3",
            authorizing: "Verifying..."
        },
        register: {
            entity_reg: "Aura manifestation",
            request_alloc: "Asking for keys",
            title: "Create",
            title_italic: "Room",
            unique_identifier: "What should we call you? (Username)",
            placeholder_username: "entity_name",
            communication_node: "Your mail (Email)",
            placeholder_email: "entity@access.com",
            private_key: "Your secret key (Password)",
            placeholder_password: "••••••••",
            register_identity: "Get my keys",
            already_registered: "Already have a key?",
            resume_session: "Open the door",
            identity_rejected: "Manifestation denied",
            identity_established: "Keys delivered. Opening room door...",
            cancel: "Go Back",
            footer: "Allocation System // MoodSpace",
            establishing: "Forging keys..."
        }
    },
    leftSidebar: {
        greeting_morning: "Good morning",
        greeting_afternoon: "Good afternoon",
        greeting_night: "Good night",
        system_node: "Your online spot",
        active_studio: "Room opened",
        identity_protocol: "Current visitor",
        access_level: "Your plan",
        studio_free: "Free",
        system_status: "Status",
        authorized: "Settled in",
        deployment_area: "Share your key",
        external_visibility: "Let others enter your room",
        launch_public_space: "Visit public space",
        system_configuration: "Settings",
        identity_registry: "Your account",
        system_ux: "Room preferences",
        terminate_session: "Leave the room",
        exit_hex: "Lock the door",
    },
    editors: {
        theme: {
            title: "Colors & vibes",
            light: "Classic",
            dark: "Midnight",
            vintage: "Vintage",
            notebook: "Notebook",
            blueprint: "Blueprint",
            canvas: "Canvas",
            cyberpunk: "Cyberpunk",
            node_luminance: "Highlight color",
            luminance_desc: "Pick the color that best represents you right now.",
            atomic_typography: "Main letter",
            base_system: "Base lettering style",
        },
        text: {
            title: "Write something",
            placeholder: "What's on your mind?",
            substrate: "Paper type",
            node_color: "Paper color",
            font_scale: "Letter size",
            alignment: "Alignment",
            deploy: "Stick to the wall",
            styles: {
                simple: "Simple",
                postit: "Post-it",
                ripped: "Ripped",
                typewriter: "Typewriter"
            }
        },
        photo: {
            title: "Develop a photo",
            drop_link: "Drop your photo here",
            inject_visual: "Drag your photo here",
            format_hint: "FORMATS // PNG, JPG, WEBP",
            processing: "Developing...",
            live_preview: "How it looks:",
            caption: "Memory (Caption)",
            caption_placeholder: "Write something about this photo...",
            alt_text: "Alternative Text (Accessibility)",
            alt_placeholder: "Describe the image for those who can't see...",
            filter: "Photo Filter",
            geometry: "Frame",
            deploy: "Hang photo",
            error_load: "Photographic aura corrupted. Cannot read.",
            error_process: "The image couldn't survive the compression process."
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
        },
        youtube: {
            title: "Play a clip",
            placeholder: "Paste the YouTube link here...",
            established: "Video connected",
            deploy: "Play the tape",
            error: "We couldn't connect to this link.",
            supported: "We support links like: youtu.be, youtube.com/watch",
        },
        effects: {
            cursor_title: "Your cursor",
            trails_title: "Mouse trail",
            atmosphere_title: "Room atmosphere",
            active: "Selected",
            syncing: "Changing the atmosphere...",
            deployed: "All set.",
        },
        countdown: {
            title: "Countdown",
            label: "When is it for?",
            placeholder: "My birthday...",
            target: "Marked date",
            registry: "Special icon",
            substrate: "Appearance",
            deploy: "Start counting",
        },
        guestbook: {
            title: "Guestbook mural",
            label: "What's the question or title?",
            placeholder: "Leave a little note...",
            color_label: "Note color",
            deploy: "Stick to mural",
            visit_active: "People will be able to write in your room.",
        },
        mood: {
            title: "Your current state",
            registry: "How are you?",
            buffer: "Write what you are feeling (optional)",
            placeholder: "Everything's chill...",
            deploy: "Leave a feeling",
        },
        quote: {
            title: "Quote",
            label_text: "What was said?",
            placeholder: "Write the quote here...",
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
            style_manifesto: "Button Style",
            deploy: "Add link",
        },
        doodle: {
            title: "Your draftpad",
            manifest: "Draw fullscreen on your wall."
        },
        gif: {
            title: "Reactions and Gifs",
            powered_by: "Pick your gif (Giphy).",
            search_placeholder: "Search gif...",
            searching: "Searching...",
            deploy: "Stick Gif",
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
            empty: "No elements yet...",
        },
        art: {
            tape_title: "Stickers and tapes",
            weather_title: "Current weather",
            weather_state: "How's the day?",
            weather_location: "From where?",
            weather_location_placeholder: "Lisbon, NY, Tokyo...",
            weather_temp: "Temperature (Optional)",
            weather_temp_placeholder: "72°F, Freezing, Hot...",
            weather_deploy: "Stick weather",
            media_title: "Books & Movies",
            media_book: "Book",
            media_movie: "Movie",
            media_work_title: "What's the name?",
            media_work_title_placeholder: "Work name...",
            media_critique: "3-word summary",
            media_critique_placeholder: "Amazing, Boring, Surreal...",
            media_deploy: "Stick Review"
        },
        spotify: {
            title: "Soundtrack",
            search_placeholder: "What song to find?",
            search_btn: "Search Song",
            error: "Search Error",
            results: "Results",
            source: "Source"
        },
        palette: {
            title: "Auto Palette",
            desc: "Extract colors from an image",
            drop: "Drop to analyze",
            drag: "Drag an image",
            hint: "Smart vibe extraction",
            analyzing: "Analyzing...",
            apply: "Apply to Mural"
        },
        share: {
            link: "Share Link",
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
        delete_modal_confirm: "Delete"
    },
    public_page: {
        signature: {
            role: "Creator",
            studio: "Space 01"
        },
        badge: {
            auth_access: "Verified Access",
            claim: "Create my space",
            open: "Access Granted",
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
            high: "High Tuning",
            stable: "Calm Tuning",
            views: "Visiting Souls"
        }
    }
};
