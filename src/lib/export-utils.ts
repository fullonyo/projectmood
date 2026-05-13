import { toPng } from 'html-to-image';
import { toast } from 'sonner';

export const exportMuralAsImage = async (elementId: string, filename: string = 'my-moodspace') => {
    const element = document.getElementById(elementId);
    if (!element) {
        toast.error("Erro: Mural não encontrado para exportação.");
        return;
    }

    const toastId = toast.loading("Preparando Snapshot...", {
        description: "Capturando elementos e texturas..."
    });

    try {
        // Aguarda um pequeno delay para garantir que animações de entrada terminaram
        await new Promise(resolve => setTimeout(resolve, 500));

        const dataUrl = await toPng(element, {
            cacheBust: true,
            pixelRatio: 2, 
            backgroundColor: 'transparent',
            // CORREÇÃO: Desativa a incorporação automática de fontes que causa o SecurityError em stylesheets externos
            fontEmbedCSS: undefined, 
            style: {
                opacity: '1',
                transform: 'none'
            },
            filter: (node: HTMLElement) => {
                const exclusionClasses = ['selection-aura', 'canvas-context-menu', 'no-export'];
                const isExcluded = exclusionClasses.some(cls => node.classList?.contains(cls));
                return !isExcluded;
            }
        });

        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataUrl;
        link.click();

        toast.success("Snapshot concluído!", {
            id: toastId,
            description: "A imagem foi salva na sua pasta de downloads."
        });
    } catch (err) {
        console.error('Export error:', err);
        toast.error("Erro na exportação", {
            id: toastId,
            description: "Não foi possível gerar a imagem. Verifique as permissões de mídia."
        });
    }
};
