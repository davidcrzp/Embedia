import { irAMisPedidos } from '../stores/flow';
import { Button } from '../ui/button';
export default function PedidosBadge() {
  return (
    <Button variant="ghost" size="sm" onClick={irAMisPedidos} class="hidden font-mono text-xs uppercase tracking-wider md:inline-flex">
      Mis pedidos
    </Button>
  );
}
