import { categoriaSeleccionada, elegirCategoria, irAHome } from '../stores/flow';
import { cn } from '../ui/cn';
type Props = { categorias: { id: string; nombre: string }[] };
export default function SidebarList({ categorias }: Props) {
  const activa = categoriaSeleccionada.value?.id;
  const base = 'whitespace-nowrap rounded-sm border px-3 py-1.5 text-sm transition-colors lg:w-full lg:whitespace-normal lg:rounded-none lg:border-0 lg:border-l-2 lg:py-1.5 lg:pl-3 lg:pr-0 lg:text-left';
  const active = 'border-primary bg-primary/10 text-primary lg:border-l-primary lg:bg-transparent lg:text-foreground';
  const inactive = 'border-border text-muted hover:border-border-strong hover:text-foreground lg:border-l-transparent lg:hover:border-l-border-strong lg:hover:bg-transparent';
  return (
    <nav aria-label="Categorías del catálogo"><ul class="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:space-y-0.5 lg:gap-0 lg:overflow-x-visible lg:pb-0">
      <li class="shrink-0 lg:w-full"><button onClick={irAHome} class={cn(base, !activa ? active : inactive)}>Todos</button></li>
      {categorias.map((c) => { const isActive = activa === c.id; return (<li key={c.id} class="shrink-0 lg:w-full"><button onClick={() => elegirCategoria(c.id, c.nombre)} class={cn(base, isActive ? active : inactive)}>{c.nombre}</button></li>); })}
    </ul></nav>
  );
}
