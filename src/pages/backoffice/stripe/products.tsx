import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  RefreshCw, 
  Check, 
  AlertTriangle,
  ExternalLink,
  Loader2,
  Unlink
} from 'lucide-react';
import { 
  useStripeProducts, 
  useSyncProduct, 
  useSyncAllProducts, 
  useUnlinkProduct,
  useStripeProductStats 
} from '@/hooks/backoffice';
import { formatEur } from '@/components/voip/backoffice/format';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function StripeProductsPage() {
  const { data: products, isLoading } = useStripeProducts();
  const { data: stats } = useStripeProductStats();
  const syncProduct = useSyncProduct();
  const syncAllProducts = useSyncAllProducts();
  const unlinkProduct = useUnlinkProduct();

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [productToUnlink, setProductToUnlink] = useState<string | null>(null);

  const handleUnlink = (productId: string) => {
    setProductToUnlink(productId);
    setUnlinkDialogOpen(true);
  };

  const confirmUnlink = () => {
    if (productToUnlink) {
      unlinkProduct.mutate(productToUnlink);
    }
    setUnlinkDialogOpen(false);
    setProductToUnlink(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sincronización de Productos</h1>
          <p className="text-muted-foreground">
            Sincroniza productos y precios de IP-NEXUS con Stripe
          </p>
        </div>
        <Button 
          onClick={() => syncAllProducts.mutate()}
          disabled={syncAllProducts.isPending}
        >
          {syncAllProducts.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Sync todo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-sm text-muted-foreground">Total productos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats?.productsSynced || 0}</div>
            <p className="text-sm text-muted-foreground">Sincronizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats?.productsNotSynced || 0}</div>
            <p className="text-sm text-muted-foreground">Sin sincronizar</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats?.pricesSynced || 0}/{stats?.totalPrices || 0}</div>
            <p className="text-sm text-muted-foreground">Precios sincronizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
          <CardDescription>
            Última sincronización: {products?.[0]?.stripe_synced_at 
              ? new Date(products[0].stripe_synced_at).toLocaleString() 
              : 'Nunca'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Stripe ID</TableHead>
                  <TableHead>Precios</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow 
                    key={product.id}
                    className={selectedProduct === product.id ? 'bg-muted' : ''}
                    onClick={() => setSelectedProduct(
                      selectedProduct === product.id ? null : product.id
                    )}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.product_type}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.stripe_product_id ? (
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {product.stripe_product_id}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.prices.filter(p => p.stripe_price_id).length}/{product.prices.length}
                    </TableCell>
                    <TableCell>
                      {product.stripe_product_id ? (
                        <Badge variant="default" className="bg-green-500">
                          <Check className="h-3 w-3 mr-1" /> Sync
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertTriangle className="h-3 w-3 mr-1" /> No sync
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            syncProduct.mutate(product.id);
                          }}
                          disabled={syncProduct.isPending}
                        >
                          {syncProduct.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        {product.stripe_product_id && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnlink(product.id);
                              }}
                            >
                              <Unlink className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              asChild
                            >
                              <a
                                href={`https://dashboard.stripe.com/products/${product.stripe_product_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Product Detail */}
      {selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle>Detalle: {products?.find(p => p.id === selectedProduct)?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const product = products?.find(p => p.id === selectedProduct);
              if (!product) return null;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Stripe Product ID:</span>
                      <span className="ml-2 font-mono">{product.stripe_product_id || '-'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Creado en Stripe:</span>
                      <span className="ml-2">
                        {product.stripe_synced_at 
                          ? new Date(product.stripe_synced_at).toLocaleDateString()
                          : '-'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Precios:</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Período</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Stripe ID</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.prices.map((price) => (
                          <TableRow key={price.id}>
                            <TableCell className="capitalize">{price.billing_period}</TableCell>
                            <TableCell>{formatEur(price.price * 100)}</TableCell>
                            <TableCell>
                              {price.stripe_price_id ? (
                                <code className="text-xs">{price.stripe_price_id}</code>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              {price.stripe_price_id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex gap-2">
                    {product.stripe_product_id && (
                      <Button variant="outline" asChild>
                        <a
                          href={`https://dashboard.stripe.com/products/${product.stripe_product_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver en Stripe
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => syncProduct.mutate(product.id)}
                      disabled={syncProduct.isPending}
                    >
                      Re-sincronizar
                    </Button>
                    {product.stripe_product_id && (
                      <Button
                        variant="outline"
                        onClick={() => handleUnlink(product.id)}
                      >
                        Desvincular
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Unlink Confirmation Dialog */}
      <AlertDialog open={unlinkDialogOpen} onOpenChange={setUnlinkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desvincular producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará la vinculación con Stripe. El producto seguirá existiendo en Stripe,
              pero ya no estará sincronizado con IP-NEXUS.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnlink}>Desvincular</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
