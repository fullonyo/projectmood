"use client"

import { UniversalTextEditor } from "./UniversalTextEditor"
import { SocialLinksEditor } from "./social-links-editor"
import { UniversalMediaEditor } from "./UniversalMediaEditor"
import { PhotoEditor } from "./photo-editor"
import { GifPicker } from "./gif-picker"
import { GuestbookEditor } from "./guestbook-editor"
import { ArtTools } from "./art-tools"
import { DoodlePad } from "./doodle-pad"
import { CountdownEditor } from "./countdown-editor"
import { addMoodBlock } from "@/actions/profile"

interface BlockEditorRegistryProps {
    selectedBlock: any | null;
    draftBlockType: string | null;
    onUpdateBlock: (id: string, content: any) => void;
    onClose: () => void;
    setDraftBlockType: (type: string | null) => void;
}

export function BlockEditorRegistry({
    selectedBlock,
    draftBlockType,
    onUpdateBlock,
    onClose,
    setDraftBlockType
}: BlockEditorRegistryProps) {
    const activeType = selectedBlock?.type || draftBlockType || '';

    if (['text', 'ticker', 'subtitle', 'floating', 'phrase', 'quote', 'moodStatus', 'mood-status'].includes(activeType)) {
        return (
            <UniversalTextEditor
                key={selectedBlock?.id || 'draft-universal-text'}
                block={selectedBlock}
                onUpdate={onUpdateBlock}
                onAdd={async (type: string, content: any) => {
                    const result = await addMoodBlock('text', content, { x: 40, y: 40 })
                    if (result?.success) setDraftBlockType(null)
                }}
                onClose={onClose}
            />
        )
    }

    if (activeType === 'social') {
        return (
            <SocialLinksEditor
                block={selectedBlock || { content: {} } as any}
                onUpdate={selectedBlock ? onUpdateBlock : async (_, content) => {
                    const result = await addMoodBlock('social', content, { x: 40, y: 40, width: 150, height: 45 })
                    if (result?.success) setDraftBlockType(null)
                }}
                onClose={onClose}
            />
        )
    }

    if (['video', 'music', 'media'].includes(activeType)) {
        return (
            <UniversalMediaEditor
                key={selectedBlock?.id || 'draft-universal-media'}
                block={selectedBlock}
                onUpdate={onUpdateBlock}
                onAdd={async (type: string, content: any) => {
                    const result = await addMoodBlock('media', content, { x: 40, y: 40, width: 320, height: 200 })
                    if (result?.success) setDraftBlockType(null)
                }}
                onClose={onClose}
            />
        )
    }

    if (activeType === 'photo') {
        return (
            <PhotoEditor
                key={selectedBlock?.id || 'draft-photo'}
                block={selectedBlock}
                onUpdate={onUpdateBlock}
                onAdd={selectedBlock ? undefined : async (content) => {
                    const result = await addMoodBlock('photo', content, { x: 40, y: 40, width: 300, height: 300 })
                    if (result?.success) setDraftBlockType(null)
                }}
                onClose={onClose}
            />
        )
    }

    if (activeType === 'gif') {
        return <GifPicker key={selectedBlock?.id || 'draft-gif'} />
    }

    if (activeType === 'guestbook') {
        return <GuestbookEditor key={selectedBlock?.id || 'draft-guestbook'} />
    }

    if (['tape', 'weather'].includes(activeType)) {
        return <ArtTools key={selectedBlock?.id || 'draft-art'} />
    }

    if (activeType === 'doodle') {
        return <DoodlePad key={selectedBlock?.id || 'draft-doodle'} />
    }

    if (activeType === 'countdown') {
        return (
            <CountdownEditor
                key={selectedBlock?.id || 'draft-countdown'}
                block={selectedBlock}
                onUpdate={onUpdateBlock}
                onAdd={selectedBlock ? undefined : async (content) => {
                    const result = await addMoodBlock('countdown', content, { x: 40, y: 40 })
                    if (result?.success) setDraftBlockType(null)
                }}
                onClose={onClose}
            />
        )
    }

    return null;
}
