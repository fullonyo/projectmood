import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface BoardStageProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

/**
 * BoardStage
 * 
 * O container unificado que define o sistema de coordenadas para o MoodSpace.
 * Deve ser usado tanto no Editor quanto na Página Pública para garantir
 * que "O que você vê é o que você tem" (WYSIWYG).
 * 
 * Regras:
 * - Ocupa 100% da largura e altura do pai.
 * - Define contexto de posicionamento (relative).
 * - Mantém o padding padrão (p-10) para evitar que elementos toquem as bordas extremas.
 */
export const BoardStage = forwardRef<HTMLDivElement, BoardStageProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "relative w-full h-full p-4 sm:p-10 canvas-items-wrapper",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

BoardStage.displayName = "BoardStage";
