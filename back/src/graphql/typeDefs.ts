export const typeDefs = /* GraphQL */ `
  enum Rol { ADMIN CLIENTE }
  enum EstadoPedido { PENDIENTE PAGADO ENVIADO COMPLETADO CANCELADO }
  type Categoria { id: ID! nombre: String! productos(limit: Int = 10, offset: Int = 0): [Producto!]! totalProductos: Int! }
  type Producto { id: ID! nombre: String! precio: Float! imagen: String stock: Int! categoria: Categoria! }
  type Usuario { id: ID! nombre: String! email: String! rol: Rol! pedidos: [Pedido!]! }
  type Pedido {
    id: ID! fecha: String! total: Float! status: String! metodoPago: String
    mpOrderId: String mpPaymentId: String mpPaymentMethod: String mpLast4: String mpInstallments: Int
    mpTicketUrl: String mpBarcode: String mpReference: String mpExpiresAt: String
    direccion: String lat: Float lng: Float
    usuario: Usuario! detalles: [PedidoDetalle!]!
  }
  type PedidoDetalle { id: ID! cantidad: Int! precio: Float! producto: Producto! }
  type AuthPayload { token: String! usuario: Usuario! }
  type PedidoCreadoEvento { pedido: Pedido! productos: [Producto!]! }
  input ProductoInput { nombre: String! precio: Float! imagen: String stock: Int! categoriaId: ID! }
  input ProductoUpdateInput { nombre: String precio: Float imagen: String stock: Int categoriaId: ID }
  input CategoriaInput { nombre: String! }
  input RegistroInput { nombre: String! email: String! password: String! }
  input LoginInput { email: String! password: String! }
  input UsuarioInput { nombre: String! email: String! password: String! rol: Rol! }
  type Query {
    categorias: [Categoria!]! categoria(id: ID!): Categoria
    productos(limit: Int = 10, offset: Int = 0): [Producto!]! producto(id: ID!): Producto
    misPedidos: [Pedido!]! pedidos: [Pedido!]! usuarios: [Usuario!]! me: Usuario
  }
  type Mutation {
    registrar(input: RegistroInput!): AuthPayload! login(input: LoginInput!): AuthPayload!
    crearProducto(input: ProductoInput!): Producto! actualizarProducto(id: ID!, input: ProductoUpdateInput!): Producto
    eliminarProducto(id: ID!): Boolean! crearCategoria(input: CategoriaInput!): Categoria!
    actualizarCategoria(id: ID!, input: CategoriaInput!): Categoria eliminarCategoria(id: ID!): Boolean!
    actualizarEstadoPedido(id: ID!, status: EstadoPedido!): Pedido! cancelarPedido(id: ID!): Pedido!
    eliminarUsuario(id: ID!): Boolean! cambiarPasswordUsuario(id: ID!, newPassword: String!): Boolean!
    cambiarRolUsuario(id: ID!, rol: Rol!): Usuario! crearUsuario(input: UsuarioInput!): Usuario!
  }
  type Subscription { pedidoCreado: PedidoCreadoEvento! }
`;
