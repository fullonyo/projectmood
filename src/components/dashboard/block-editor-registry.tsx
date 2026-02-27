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
import { UniversalShapeEditor } from "./UniversalShapeEditor"
import { UniversalWeatherEditor } from "./UniversalWeatherEditor"
import { RorschachEditor } from "./RorschachEditor"
import { addMoodBlock } from "@/actions/profile"
import { MoodBlock } from "@/types/database"
import { getInitialBlockSize } from "@/lib/canvas-scale"

interface BlockEditorRegistryProps {
    selectedBlock: MoodBlock | null;
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

    const handleAdd = async (type: string, content: any, typeOverride?: string) => {
        const { width, height } = getInitialBlockSize(type);
        const result = await addMoodBlock(typeOverride || type, content, { x: 40, y: 40, width, height });
        if (result?.success) setDraftBlockType(null);
    }

    if (['text', 'ticker', 'subtitle', 'floating', 'phrase', 'quote', 'moodStatus', 'mood-status'].includes(activeType)) {
        return (
            <UniversalTextEditor
                key={selectedBlock?.id || 'draft-universal-text'}
                block={selectedBlock}
                onUpdate={onUpdateBlock}
                onAdd={(type, content) => handleAdd('text', content)}
                onClose={onClose}
            />
        )
    }

    if (activeType === 'social') {
        const socialBlock = selectedBlock || { content: {} } as MoodBlock;
        return (
            <SocialLinksEditor
                block={socialBlock}
                onUpdate={selectedBlock ? onUpdateBlock : (_, content) => handleAdd('social', content)}
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
                onAdd={(type, content) => handleAdd('media', content)}
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
                onAdd={selectedBlock ? undefined : (content) => handleAdd('photo', content)}
                onClose={onClose}
            />
        )
    }

    if (activeType === 'gif') {
        return <GifPicker key={selectedBlock?.id || 'draft-gif'} />
    }

    if (activeType === 'guestbook') {
        return (
            <GuestbookEditor
                key={selectedBlock?.id || 'draft-guestbook'}
                block={selectedBlock}
                onUpdate={onUpdateBlock}
                onClose={onClose}
            />
        )
    }

    if (activeType === 'weather') {
        return (
            <UniversalWeatherEditor
                key={selectedBlock?.id || 'draft-weather'}
                block={selectedBlock}
                onUpdate={onUpdateBlock}
                onAdd={(type, content) => handleAdd('weather', content)}
                onClose={onClose}
            />
        )
    }

    if (activeType === 'tape') {
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
                onAdd={selectedBlock ? undefined : (content) => handleAdd('countdown', content)}
                onClose={onClose}
            />
        )
    }

    if (activeType === 'shape') {
        return (
            <UniversalShapeEditor
                key={selectedBlock?.id || 'draft-shape'}
                block={selectedBlock}
                onUpdate={onUpdateBlock}
                onAdd={(type, content) => handleAdd('shape', content)}
                onClose={onClose}
            />
        )
    }

    if (activeType === 'rorschach') {
        return (
            <RorschachEditor
                key={selectedBlock?.id || 'draft-rorschach'}
                block={selectedBlock}
                onUpdate={onUpdateBlock}
                onAdd={(type, content) => handleAdd('rorschach', content)}
                onClose={onClose}
            />
        )
    }

    return null;
}
