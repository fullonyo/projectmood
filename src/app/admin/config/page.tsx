import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getFeatureFlags, seedFeatureFlags } from "@/actions/system-config"
import { FeatureToggle } from "./feature-toggle"
import {
    Settings,
    RefreshCw,
    LayoutGrid,
    Type,
    FrameIcon,
    Shapes,
    Cpu,
    Square
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfigCategory } from "@/components/admin/config-category"

export default async function AdminConfigPage() {
    const session = await auth()
    if ((session?.user as any)?.role !== "ADMIN") redirect("/dashboard")

    let flags = await getFeatureFlags()

    const syncAction = async () => {
        "use server"
        await seedFeatureFlags()
    }

    const categories = [
        {
            id: 'blocks',
            title: "Core Modules",
            desc: "Primary canvas block types",
            icon: <LayoutGrid className="w-4 h-4" />,
            prefix: 'block_'
        },
        {
            id: 'behaviors',
            title: "Smart Text",
            desc: "Typography behaviors & animations",
            icon: <Type className="w-4 h-4" />,
            prefix: 'behavior_'
        },
        {
            id: 'frames',
            title: "Studio Frames",
            desc: "Visual containers & containers",
            icon: <Square className="w-4 h-4" />,
            prefix: 'frame_'
        },
        {
            id: 'shapes',
            title: "Geometric Shapes",
            desc: "SmartShape 2.0 components",
            icon: <Shapes className="w-4 h-4" />,
            prefix: 'shape_'
        }
    ]

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-900 pb-10">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <Cpu className="w-3 h-3 text-zinc-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Core Infrastructure</span>
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">System Configuration</h1>
                    <p className="text-sm text-zinc-500 font-mono mt-1 max-w-xl">
                        Granular control over the MoodSpace ecosystem. Toggle global features, manage VIP exclusivity, and sync module architecture.
                    </p>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest leading-none mb-1">Total Flags</div>
                        <div className="text-3xl font-black tabular-nums">{flags.length}</div>
                    </div>
                    <form action={syncAction}>
                        <Button type="submit" variant="outline" className="h-12 px-6 rounded-none border-zinc-800 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                            <RefreshCw className="w-4 h-4 mr-3" /> Sync Registry
                        </Button>
                    </form>
                </div>
            </header>

            <div className="space-y-16">
                {categories.map(cat => (
                    <ConfigCategory
                        key={cat.id}
                        title={cat.title}
                        description={cat.desc}
                        icon={cat.icon}
                    >
                        {flags.filter((f: any) => f.key.startsWith(cat.prefix)).map((flag: any) => (
                            <FeatureToggle key={flag.id} flag={flag} />
                        ))}
                    </ConfigCategory>
                ))}
            </div>
        </div>
    )
}
