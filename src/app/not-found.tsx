import { ArrowLeft } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

/**
 * Page 404 sur-mesure. Cohérente avec l'univers éditorial (fond crème, serif
 * display, ton bienveillant). Le header étant fixe et solide hors accueil, on
 * réserve un padding haut pour dégager le contenu. Sobre : les deux seules
 * destinations garanties sont l'accueil et l'ancre contact de la home.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 pb-20 pt-32 text-center">
      <Container size="narrow">
        <p className="font-sans text-sm uppercase tracking-[0.28em] text-accent">Erreur 404</p>
        <h1 className="mt-6 font-display text-5xl leading-tight sm:text-7xl">
          Cette page s&apos;est éclipsée
        </h1>
        <p className="mx-auto mt-6 max-w-md font-sans text-lg leading-relaxed text-muted">
          La page que vous cherchez n&apos;existe pas ou a été déplacée. Revenons à un espace qui a
          du sens.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button href="/" size="lg">
            <ArrowLeft
              size={18}
              strokeWidth={1.5}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Retour à l&apos;accueil
          </Button>
          <Button href="/#contact" size="lg" variant="outline">
            Me contacter
          </Button>
        </div>
      </Container>
    </div>
  );
}
