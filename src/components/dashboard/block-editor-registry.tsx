"use client"
import { MoodBlock } from "@/types/database"
import { UniversalTextEditor } from "./UniversalTextEditor"
import { UniversalPhotoEditor } from "./UniversalPhotoEditor"
import { UniversalMediaEditor } from "./UniversalMediaEditor"
import { UniversalCountdownEditor } from "./UniversalCountdownEditor"
import { UniversalWeatherEditor } from "./UniversalWeatherEditor"
import { UniversalGuestbookEditor } from "./UniversalGuestbookEditor"
import { UniversalRorschachEditor } from "./UniversalRorschachEditor"
import { UniversalShapeEditor } from "./UniversalShapeEditor"
import { UniversalSocialEditor } from "./UniversalSocialEditor"
import { UniversalEffectsEditor } from "./UniversalEffectsEditor"
import { UniversalCommonEditor } from "./UniversalCommonEditor"
import { DoodlePad } from "./doodle-pad"
import { useTranslation } from "@/i18n/context"
import { Layout, Boxes } from "lucide-react"
import { useMemo } from "react"

interface BlockEditorRegistryProps {
    selectedBlocks: MoodBlock[]
    draftBlockType: string | null
    onUpdateBlock: (id: string, updates: Partial<MoodBlock>) => void
    onUpdateBlocks: (ids: string[], updates: Partial<MoodBlock> | ((block: MoodBlock) => Partial<MoodBlock>)) => void
    onClose: () => void
    setDraftBlockType: (type: string | null) => void
}

export function BlockEditorRegistry({
    selectedBlocks,
    draftBlockType,
    onUpdateBlock,
    onUpdateBlocks,
    onClose,
    setDraftBlockType
}: BlockEditorRegistryProps) {
    const { t } = useTranslation()

    // Detect if we are in Multi-Selection Mode
    const isMultiSelect = selectedBlocks.length > 1
    const firstBlock = selectedBlocks[0]
    
    // Check if all selected blocks share the same type
    const allSameType = isMultiSelect && selectedBlocks.every(b => b.type === firstBlock?.type)

    if (draftBlockType) {
        // Handle New Block Creation
        const Editor = getEditor(draftBlockType)
        if (!Editor) return null
        return (
            <Editor
                onUpdate={(updates: any) => {
                    // Logic for draft is handled via addMoodBlock in parent, 
                    // but editors might need internal state
                }}
                onClose={onClose}
            />
        )
    }

    // Memoized Update Handlers to prevent infinite loops in child editors' useEffects
    const selectedIdsString = selectedBlocks.map(b => b.id).join(',')
    
    const handleSingleUpdate = useMemo(() => (idOrUpdates: any, updates?: any) => {
        if (!firstBlock) return
        const actualId = typeof idOrUpdates === 'string' ? idOrUpdates : firstBlock.id
        const actualUpdates = typeof idOrUpdates === 'string' ? updates : idOrUpdates
        onUpdateBlock(actualId, actualUpdates)
    }, [firstBlock?.id, onUpdateBlock])

    const handleBatchUpdate = useMemo(() => (updates: any) => {
        onUpdateBlocks(selectedBlocks.map(b => b.id), updates)
    }, [selectedIdsString, onUpdateBlocks])

    if (selectedBlocks.length === 0) return null

    // Multi-Selection Logic
    if (isMultiSelect) {
        if (allSameType) {
            // Bulk Edit for items of the same type
            const Editor = getEditor(firstBlock.type)
            if (Editor) {
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1 mb-2">
                            <Boxes className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                                {t('canvas.multi_select')} // {selectedBlocks.length} {t('common.items')}
                            </span>
                        </div>
                        <Editor
                            block={firstBlock} 
                            selectedBlocks={selectedBlocks} 
                            onUpdate={handleBatchUpdate}
                            onClose={onClose}
                        />
                    </div>
                )
            }
        }

        // Mixed Selection or fallback: Common Properties Editor
        return (
            <UniversalCommonEditor
                selectedBlocks={selectedBlocks}
                onUpdateBlocks={onUpdateBlocks}
                onClose={onClose}
            />
        )
    }

    // Single Block Edit
    const Editor = getEditor(firstBlock.type)
    if (!Editor) return (
        <div className="flex flex-col items-center justify-center p-12 text-center opacity-50">
            <Layout className="w-12 h-12 mb-4 text-zinc-300" />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Editor indisponível para {firstBlock.type}</p>
        </div>
    )

    return (
        <Editor
            block={firstBlock}
            onUpdate={handleSingleUpdate}
            onClose={onClose}
        />
    )
}

function getEditor(type: string) {
    const editors: Record<string, any> = {
        'text': UniversalTextEditor,
        'photo': UniversalPhotoEditor,
        'gif': UniversalPhotoEditor,
        'music': UniversalMediaEditor,
        'video': UniversalMediaEditor,
        'audio': UniversalMediaEditor,
        'media': UniversalMediaEditor,
        'countdown': UniversalCountdownEditor,
        'weather': UniversalWeatherEditor,
        'guestbook': UniversalGuestbookEditor,
        'rorschach': UniversalRorschachEditor,
        'shape': UniversalShapeEditor,
        'social': UniversalSocialEditor,
        'moodStatus': UniversalSocialEditor,
        'doodle': DoodlePad,
        'effects': UniversalEffectsEditor
    }
    return editors[type]
}
