import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getFeatureFlags, seedFeatureFlags } from "@/actions/system-config"
import { FeatureToggle } from "./feature-toggle"
import { Settings, RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AdminConfigPage() {
    const session = await auth()
    if ((session?.user as any)?.role !== "ADMIN") redirect("/dashboard")

    let flags = await getFeatureFlags()

    const syncAction = async () => {
        "use server"
        await seedFeatureFlags()
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <header className="flex items-end justify-between mb-8 border-b border-zinc-900 pb-6">
                <div className="flex-1">
                    <h1 className="text-2xl font-black uppercase tracking-tighter">System Configuration</h1>
                    <p className="text-sm text-zinc-500 font-mono mt-1">Manage global feature flags and core integrations.</p>
                </div>
                <div className="flex items-center gap-6">
                    <form action={syncAction}>
                        <Button type="submit" variant="outline" className="h-9 rounded-none border-zinc-800 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                            <RefreshCw className="w-3 h-3 mr-2" /> Sync Modules
                        </Button>
                    </form>
                    <div className="text-right">
                        <div className="text-xs font-mono text-zinc-500 uppercase">Registered</div>
                        <div className="text-xl font-black">{flags.length}</div>
                    </div>
                </div>
            </header>

            {/* Empty State / Seeder */}


            {flags.length > 0 && (
                <div className="space-y-8">
                    <section>
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <Settings className="w-4 h-4 text-zinc-400" />
                            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Library Blocks Modules</h2>
                        </div>
                        <div className="grid gap-2">
                            {flags.filter((f: any) => f.key.startsWith('block_')).map((flag: any) => (
                                <FeatureToggle key={flag.id} flag={flag} />
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    )
}
