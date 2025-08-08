










import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Product, Category, Banner, StoreConfig, CartItem, Order, ToastMessage, ProductVariantDetail, ProductColorVariantDetail, ProductVariants } from './types';
import { database } from './services/firebase';
import {
  CartIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon, InstagramIcon, MenuIcon,
  SearchIcon, TikTokIcon, WhatsAppIcon, TrashIcon, PlusIcon, MinusIcon,
  PencilIcon, UploadIcon
} from './components/Icons';

// --- MOCK DATA (Initial values for Firebase) ---
const initialConfig: StoreConfig = {
    logoUrl: 'https://i.imgur.com/JvA19tW.png',
    contact: { name: 'Bombon Store', phone: '573001234567', schedule: 'Lunes a Sábado, 9am - 7pm' },
    social: { instagram: 'https://instagram.com', tiktok: 'https://tiktok.com', whatsapp: '573001234567' }
};

const initialBanners: Banner[] = [
    { id: 1, imageUrl: 'https://i.imgur.com/8m2nJCr.jpeg', title: 'Colección Esencia', subtitle: 'Descubre tu estilo, define tu esencia.', link: '#productos' },
    { id: 2, imageUrl: 'https://i.imgur.com/jBwDqA4.jpeg', title: 'Vibra con el Color', subtitle: 'Piezas únicas para un look inolvidable.', link: '#productos' },
    { id: 3, imageUrl: 'https://i.imgur.com/1nL3y2A.jpeg', title: 'Pantalones con Estilo', subtitle: 'Comodidad y elegancia en cada paso.', link: 'category:Pantalones' }
];

const initialCategories: Category[] = ['Blusas', 'Vestidos', 'Pantalones', 'Accesorios', 'Chaquetas', 'Bolsos'];

const initialProducts: Product[] = [
    {
        id: 'prod1', name: 'Blusa de Seda "Aurora"', description: 'Elegante blusa de seda con un corte clásico y un tacto suave.',
        price: 180000, category: 'Blusas', imageUrl: 'https://i.imgur.com/sT9c2Yd.jpeg', available: true,
        variants: {
            hasSizes: true, sizes: { 'S': { available: true }, 'M': { available: true }, 'L': { available: false } },
            hasColors: true, colors: {
                'Rosa Pastel': { available: true, imageUrl: 'https://i.imgur.com/sT9c2Yd.jpeg' },
                'Blanco Crudo': { available: true, imageUrl: 'https://i.imgur.com/RJGt0zF.jpeg' }
            }
        }
    },
    {
        id: 'prod2', name: 'Vestido "Verano Eterno"', description: 'Vestido floral perfecto para un día soleado, ligero y fresco.',
        price: 250000, category: 'Vestidos', imageUrl: 'https://i.imgur.com/E13sYyO.jpeg', available: true,
        variants: {
            hasSizes: true, sizes: { 'S': { available: true }, 'M': { available: true }, 'L': { available: true } },
            hasColors: false, colors: {}
        }
    },
    {
        id: 'prod3', name: 'Pantalón Palazzo "Elegancia"', description: 'Pantalón de pierna ancha que estiliza la figura.',
        price: 220000, category: 'Pantalones', imageUrl: 'https://i.imgur.com/1nL3y2A.jpeg', available: true,
        variants: {
            hasSizes: true, sizes: { '34': { available: true }, '36': { available: true }, '38': { available: true } },
            hasColors: true, colors: {
                'Negro': { available: true, imageUrl: 'https://i.imgur.com/1nL3y2A.jpeg' },
                'Beige': { available: false, imageUrl: 'https://i.imgur.com/qEwV3nC.jpeg' }
            }
        }
    },
    {
        id: 'prod4', name: 'Bolso "Tote" de Cuero', description: 'Un bolso espacioso y chic para llevar todo lo que necesitas.',
        price: 350000, category: 'Bolsos', imageUrl: 'https://i.imgur.com/AdA202F.jpeg', available: true,
        variants: {
            hasSizes: false, sizes: {},
            hasColors: true, colors: {
                'Marrón': { available: true, imageUrl: 'https://i.imgur.com/AdA202F.jpeg' },
                'Negro': { available: true, imageUrl: 'https://i.imgur.com/YAnK9uq.jpeg' }
            }
        }
    },
    {
        id: 'prod5', name: 'Falda Midi "Parisina"', description: 'Falda con pliegues y un estampado chic.',
        price: 190000, category: 'Vestidos', imageUrl: 'https://i.imgur.com/Qk7a5xS.jpeg', available: false, // Out of stock
        variants: {
            hasSizes: true, sizes: { 'S': { available: true }, 'M': { available: false } },
            hasColors: false, colors: {}
        }
    },
    {
        id: 'prod6', name: 'Aretes "Gota de Oro"', description: 'Aretes delicados para un toque de brillo.',
        price: 95000, category: 'Accesorios', imageUrl: 'https://i.imgur.com/J3cZJ8W.jpeg', available: true,
        variants: {
            hasSizes: false, sizes: {},
            hasColors: false, colors: {}
        }
    },
    {
        id: 'prod7', name: 'Chaqueta Denim "Urbana"', description: 'Chaqueta de jean clásica, un básico indispensable.',
        price: 280000, category: 'Chaquetas', imageUrl: 'https://i.imgur.com/tqB9z3g.jpeg', available: true,
        variants: {
            hasSizes: true, sizes: { 'S': { available: true }, 'M': { available: true } },
            hasColors: false, colors: {}
        }
    },
     {
        id: 'prod8', name: 'Top Corto de Lino', description: 'Top fresco y versátil, ideal para combinar.',
        price: 130000, category: 'Blusas', imageUrl: 'https://i.imgur.com/hYkH5sN.jpeg', available: true,
        variants: {
            hasSizes: true, sizes: { 'XS': { available: true }, 'S': { available: true }, 'M': { available: true } },
            hasColors: false, colors: {}
        }
    }
];

// --- Helper Functions ---
const useBrowserStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)) {
          console.warn(
            `LocalStorage quota exceeded when trying to save key "${key}". ` +
            `The latest changes will not be persisted across sessions.`
          );
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error(`Error in useBrowserStorage setValue for key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

const useFirebaseSync = <T,>(key: string, initialValue: T): [T, (value: T) => void, boolean] => {
    const [data, setData] = useState<T>(initialValue);
    const [isLoading, setIsLoading] = useState(true);

    const dataRef = useRef(data);
    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    useEffect(() => {
        const dbRef = database.ref(key);
        const listener = dbRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                setData(snapshot.val());
            } else {
                dbRef.set(initialValue).catch(error => console.error(`Firebase initial set error for key "${key}":`, error));
            }
            setIsLoading(false);
        }, (error) => {
            console.error(`Firebase error on key "${key}":`, error);
            setIsLoading(false);
        });

        return () => dbRef.off('value', listener);
    }, [key, JSON.stringify(initialValue)]);

    const setValue = useCallback((value: T) => {
        try {
            database.ref(key).set(value);
        } catch (error) {
            console.error(`Firebase set error for key "${key}":`, error);
        }
    }, [key]);

    return [data, setValue, isLoading];
};


const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const App: React.FC = () => {
    // Global State
    const [config, setConfig, isConfigLoading] = useFirebaseSync<StoreConfig>('config', initialConfig);
    const [banners, setBanners, areBannersLoading] = useFirebaseSync<Banner[]>('banners', initialBanners);
    const [products, setProducts, areProductsLoading] = useFirebaseSync<Product[]>('products', initialProducts);
    const [categories, setCategories, areCategoriesLoading] = useFirebaseSync<Category[]>('categories', initialCategories);
    const [orders, , areOrdersLoading] = useFirebaseSync<Order[]>('orders', []); // Orders are now write-only from client, so we don't need a setter here.
    const [cart, setCart] = useBrowserStorage<CartItem[]>('storeCart', []);
    
    // UI State
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCartOpen, setCartOpen] = useState(false);
    const [isAdminOpen, setAdminOpen] = useState(false);
    const [isPasswordPromptOpen, setPasswordPromptOpen] = useState(false);
    const [isInvoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [logoClicks, setLogoClicks] = useState(0);
    
    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

    // Admin State
    const [editMode, setEditMode] = useState(false);
    
    const isAppLoading = isConfigLoading || areBannersLoading || areProductsLoading || areCategoriesLoading || areOrdersLoading;

    // --- UTILS ---
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
    };

    // --- DERIVED STATE & MEMOS ---
    const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
    const cartSubtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
    
    const filteredProducts = useMemo(() => {
        return (products || []).filter(product => {
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, searchTerm]);

    const newArrivals = useMemo(() => [...(products || [])].sort((a,b) => b.id.localeCompare(a.id)).slice(0, 6), [products]);
    const bestSellers = useMemo(() => {
        return [...(products || [])].sort(() => Math.random() - 0.5).slice(0, 4);
    }, [products]);


    // --- EVENT HANDLERS ---
    const handleLogoClick = () => {
        const newClicks = logoClicks + 1;
        setLogoClicks(newClicks);
        if (newClicks >= 3) {
            setPasswordPromptOpen(true);
            setLogoClicks(0);
        }
        setTimeout(() => setLogoClicks(0), 1500);
    };

    const handleAdminLogin = () => {
        setPasswordPromptOpen(false);
        setAdminOpen(true);
    }

    const handleAddToCart = (product: Product, quantity: number, size?: string, color?: string) => {
        const cartItemId = `${product.id}${size ? `-${size}` : ''}${color ? `-${color}` : ''}`;
        const existingItem = cart.find(item => item.id === cartItemId);
        
        if (existingItem) {
            setCart(cart.map(item => item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item));
        } else {
            const newItem: CartItem = {
                id: cartItemId,
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity,
                imageUrl: (color && product.variants?.colors?.[color]?.imageUrl) || product.imageUrl,
                size,
                color,
            };
            setCart([...cart, newItem]);
        }
        showToast(`${product.name} agregado al carrito!`);
        setSelectedProduct(null);
    };
    
    const handleQuickAddToCart = (product: Product) => {
      if (product.variants?.hasSizes || product.variants?.hasColors) {
        setSelectedProduct(product);
      } else {
        handleAddToCart(product, 1);
      }
    };
    
    const handleRemoveFromCart = (cartItemId: string) => {
        setCart(cart.filter(item => item.id !== cartItemId));
        showToast("Producto eliminado del carrito.", "error");
    };
    
    const handleUpdateCartQuantity = (cartItemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            handleRemoveFromCart(cartItemId);
            return;
        }
        setCart(cart.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item));
    };

    const handleOpenProductDetails = (product: Product) => {
        setSelectedProduct(product);
    };
    
    const handleOpenProductEdit = (product: Product) => {
        setProductToEdit(product);
        setAdminOpen(true);
    };
    
    useEffect(() => {
        if (!isAdminOpen) {
            setProductToEdit(null);
        }
    }, [isAdminOpen]);

    const handleNavigateToCategory = (category: Category | 'All') => {
      setSelectedCategory(category);
      setMobileMenuOpen(false);
      const element = document.getElementById('productos');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };
    
    // --- ADMIN CRUD HANDLERS ---
    const handleUpdateConfig = (newConfig: StoreConfig) => { setConfig(newConfig); showToast("Configuración general guardada."); };
    const handleSaveBanners = (newBanners: Banner[]) => { setBanners(newBanners); showToast("Banners guardados."); };
    const handleSaveCategories = (newCategories: Category[]) => { setCategories(newCategories); showToast("Categorías guardadas."); };
    
    const handleAddProduct = (newProduct: Product) => {
      const updatedProducts = [newProduct, ...(products || [])];
      setProducts(updatedProducts);
      showToast("Producto agregado exitosamente.");
    };

    const handleUpdateProduct = (updatedProduct: Product) => {
      const updatedProducts = (products || []).map(p => p.id === updatedProduct.id ? updatedProduct : p);
      setProducts(updatedProducts);
      showToast("Producto actualizado exitosamente.");
    };
    
    const handleDeleteProduct = (productId: string) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.")) {
            const updatedProducts = (products || []).filter(p => p.id !== productId);
            setProducts(updatedProducts);
            showToast("Producto eliminado.", "error");
        }
    };
    
     const handleNewOrder = (newOrder: Omit<Order, 'id'>) => {
        const newOrderRef = database.ref('orders').push();
        const fullOrder = { ...newOrder, id: newOrderRef.key! };
        newOrderRef.set(fullOrder)
            .then(() => {
                setCart([]);
                setInvoiceModalOpen(false);
                showToast("¡Pedido enviado por WhatsApp!");
            })
            .catch(error => {
                console.error("Error saving order to Firebase:", error);
                showToast("Error al guardar el pedido.", "error");
            });
    };

    if (isAppLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="flex flex-col items-center">
                   <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-on-surface">Cargando tu tienda...</p>
                </div>
            </div>
        );
    }
    
    // --- UI COMPONENTS ---
    const ToastContainer = () => (
        <div className="fixed top-5 right-5 z-[100] space-y-2">
            {toasts.map(toast => (
                <div key={toast.id} className={`px-4 py-2 rounded-md shadow-lg text-white ${toast.type === 'success' ? 'bg-primary' : 'bg-red-500'}`}>
                    {toast.message}
                </div>
            ))}
        </div>
    );
    
    const ProductCard = ({ product }: { product: Product }) => (
      <div className="relative group bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full cursor-pointer" onClick={() => handleOpenProductDetails(product)}>
        <div className="relative aspect-[4/5] w-full overflow-hidden">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            {!product.available && (
                <div className="absolute top-2 left-2 bg-on-surface text-background text-xs font-bold px-2 py-1 rounded">AGOTADO</div>
            )}
            <div className="absolute top-2 right-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleQuickAddToCart(product); }}
                  className="bg-white/80 backdrop-blur-sm text-primary rounded-full p-2 shadow-md hover:bg-white transition-all scale-0 group-hover:scale-100 disabled:opacity-50"
                  aria-label="Agregar al carrito"
                  disabled={!product.available}
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
            </div>
             {editMode && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => {e.stopPropagation(); handleOpenProductEdit(product);}} className="bg-white text-on-surface px-3 py-1 rounded text-sm font-semibold flex items-center space-x-1">
                  <PencilIcon className="w-4 h-4"/>
                  <span>Editar</span>
                </button>
              </div>
            )}
        </div>
        <div className="p-4 flex flex-col flex-grow">
            <h3 className="font-semibold text-sm truncate">{product.name}</h3>
            <p className="text-primary font-bold mt-1 text-base">{formatCurrency(product.price)}</p>
        </div>
      </div>
    );

    const ProductCarousel = ({ title, products: carouselProducts }: { title: string, products: Product[] }) => (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif text-center mb-8 text-on-surface">{title}</h2>
          <div className="relative">
              <div className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4 scrollbar-hide">
                  {carouselProducts.map(product => (
                      <div key={product.id} className="flex-shrink-0 w-64 sm:w-72">
                          <ProductCard product={product} />
                      </div>
                  ))}
              </div>
          </div>
        </div>
      </section>
    );

    // --- MAIN RENDER ---
    return (
        <div className="bg-background min-h-screen">
            <ToastContainer />
            <Header
                logoUrl={config.logoUrl}
                cartItemCount={cartItemCount}
                onLogoClick={handleLogoClick}
                onCartClick={() => setCartOpen(true)}
                isMobileMenuOpen={isMobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                categories={categories}
                onSelectCategory={handleNavigateToCategory}
            />
            
            <CategoryNav
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleNavigateToCategory}
            />

            <main className="pt-12">
                <BannerCarousel banners={banners} onNavigateToCategory={handleNavigateToCategory} />
                
                <ProductCarousel title="Lo Nuevo" products={newArrivals} />
                <ProductCarousel title="Más Vendidos" products={bestSellers} />
                
                <section id="productos" className="py-12 bg-surface">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-serif text-center mb-8 text-on-surface">Todo Nuestro Catálogo</h2>
                         <div className="flex justify-center mb-8">
                            <div className="relative w-full md:w-1/2">
                               <input 
                                   type="text" 
                                   placeholder="Buscar productos por nombre..." 
                                   value={searchTerm}
                                   onChange={e => setSearchTerm(e.target.value)}
                                   className="w-full bg-white border border-gray-300 rounded-full pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                               <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
                            {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
                        </div>
                        {filteredProducts.length === 0 && <p className="text-center col-span-full mt-8">No se encontraron productos que coincidan con tu búsqueda.</p>}
                    </div>
                </section>
                
            </main>
            
            <Footer contact={config.contact} social={config.social} />

            {isCartOpen && <CartPanel setOpen={setCartOpen} cart={cart} subtotal={cartSubtotal} onUpdateQuantity={handleUpdateCartQuantity} onRemoveItem={handleRemoveFromCart} onCheckout={() => { setCartOpen(false); setInvoiceModalOpen(true); }} formatCurrency={formatCurrency}/>}
            {isPasswordPromptOpen && <PasswordPrompt onClose={() => setPasswordPromptOpen(false)} onSuccess={handleAdminLogin} />}
            {isAdminOpen && <AdminPanel setOpen={setAdminOpen} editMode={editMode} setEditMode={setEditMode} store={{config, banners, products, categories, orders}} onUpdateConfig={handleUpdateConfig} onSaveBanners={handleSaveBanners} onSaveCategories={handleSaveCategories} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} formatCurrency={formatCurrency} productToEdit={productToEdit} />}
            {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} formatCurrency={formatCurrency} />}
            {isInvoiceModalOpen && <InvoiceModal setOpen={setInvoiceModalOpen} cart={cart} subtotal={cartSubtotal} onSubmitOrder={handleNewOrder} config={config} formatCurrency={formatCurrency} />}

            <a
              href={`https://wa.me/${config.social.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-5 right-5 z-40 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark hover:scale-110 transition-transform duration-300"
              aria-label="Contáctanos por WhatsApp"
            >
              <WhatsAppIcon className="w-8 h-8" />
            </a>
        </div>
    );
};

// --- SUB-COMPONENTS ---
const PasswordPrompt: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') { // Simple hardcoded password
      onSuccess();
    } else {
      setError('Contraseña incorrecta.');
      setPassword('');
      inputRef.current?.focus();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold text-center mb-2">Acceso de Administrador</h2>
            <p className="text-center text-sm text-gray-600 mb-4">Ingresa la contraseña para continuar.</p>
            <div className="w-full">
                <AdminInput
                ref={inputRef}
                label="Contraseña" 
                type="password" 
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-2 text-center w-full">{error}</p>}
            <button type="submit" className="mt-4 w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark">Entrar</button>
        </div>
      </form>
    </div>
  );
};

const Header: React.FC<{
    logoUrl: string, cartItemCount: number, onLogoClick: () => void, onCartClick: () => void,
    isMobileMenuOpen: boolean, setMobileMenuOpen: (isOpen: boolean) => void,
    categories: Category[], onSelectCategory: (category: Category | 'All') => void
}> = ({ logoUrl, cartItemCount, onLogoClick, onCartClick, isMobileMenuOpen, setMobileMenuOpen, categories, onSelectCategory }) => {
    
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm shadow-md h-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex items-center justify-between h-full">
                    {/* Left side */}
                    <div className="flex-1 flex justify-start">
                        <button className="md:hidden text-on-surface" onClick={() => setMobileMenuOpen(true)}>
                            <MenuIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Center */}
                    <div className="flex-shrink-0">
                        <img onClick={onLogoClick} src={logoUrl} alt="Bombon Logo" className="h-14 w-auto cursor-pointer" />
                    </div>

                    {/* Right side */}
                    <div className="flex-1 flex justify-end">
                        <button onClick={onCartClick} className="relative text-on-surface hover:text-primary p-2">
                            <CartIcon className="w-6 h-6" />
                            {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartItemCount}</span>}
                        </button>
                    </div>
                </div>
            </div>
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMobileMenuOpen(false)}>
                    <div className="fixed top-0 left-0 h-full w-72 bg-surface shadow-xl p-5" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4 text-on-surface"><CloseIcon className="w-6 h-6" /></button>
                         <img src={logoUrl} alt="Bombon Logo" className="h-10 w-auto mb-8" />
                        <nav className="mt-8 flex flex-col space-y-2">
                            <h3 className="font-semibold px-4 mb-2">Categorías</h3>
                            <a href="#productos" onClick={() => onSelectCategory('All')} className="block px-4 py-2 rounded-md hover:bg-gray-100">Todas</a>
                            {(categories || []).map(cat => (
                                <a key={cat} href="#productos" onClick={() => onSelectCategory(cat)} className="block px-4 py-2 rounded-md hover:bg-gray-100">{cat}</a>
                            ))}
                            <a href="#contacto" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 rounded-md hover:bg-gray-100 mt-4">Contacto</a>
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
};

const CategoryNav: React.FC<{
    categories: Category[];
    selectedCategory: string;
    onSelectCategory: (category: Category | 'All') => void;
}> = ({ categories, selectedCategory, onSelectCategory }) => {
    return (
        <nav className="bg-surface border-b border-gray-200 sticky top-20 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide py-3 md:justify-center">
                    <button
                        onClick={() => onSelectCategory('All')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${selectedCategory === 'All' ? 'bg-primary text-white' : 'bg-gray-200 text-on-surface hover:bg-pink-100'}`}
                    >
                        Todas
                    </button>
                    {(categories || []).map(cat => (
                        <button
                            key={cat}
                            onClick={() => onSelectCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-gray-200 text-on-surface hover:bg-pink-100'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

const BannerCarousel: React.FC<{ banners: Banner[]; onNavigateToCategory: (category: Category) => void; }> = ({ banners, onNavigateToCategory }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextBanner = useCallback(() => {
        if (!banners || banners.length === 0) return;
        setCurrentIndex(prev => (prev + 1) % banners.length);
    }, [banners]);

    const prevBanner = () => {
        if (!banners || banners.length === 0) return;
        setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
    };

    useEffect(() => {
        if(!banners || banners.length <= 1) return;
        const timer = setInterval(nextBanner, 5000);
        return () => clearInterval(timer);
    }, [nextBanner, banners]);

    const handleBannerClick = (e: React.MouseEvent<HTMLAnchorElement>, banner: Banner) => {
        if (banner.link.startsWith('category:')) {
            e.preventDefault();
            const category = banner.link.split(':')[1];
            onNavigateToCategory(category as Category);
        }
        // If it's a normal link like '#productos', the default href behavior will work
    };

    if (!banners || banners.length === 0) {
        return <div className="h-96 md:h-[500px] bg-gray-200 flex items-center justify-center text-gray-500">No hay banners para mostrar.</div>;
    }

    return (
        <div className="relative w-full h-96 md:h-[500px] overflow-hidden bg-gray-100">
            {banners.map((banner, index) => (
                <div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white p-4">
                        <h2 className="text-4xl md:text-6xl font-serif">{banner.title}</h2>
                        <p className="mt-2 text-lg md:text-xl">{banner.subtitle}</p>
                        <a 
                           href={banner.link.startsWith('category:') ? '#productos' : banner.link} 
                           onClick={(e) => handleBannerClick(e, banner)}
                           className="mt-6 px-8 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors duration-300 shadow-lg"
                        >
                            Ver Colección
                        </a>
                    </div>
                </div>
            ))}
            {banners.length > 1 && <>
              <button onClick={prevBanner} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 text-black p-2 rounded-full hover:bg-white"><ChevronLeftIcon className="w-6 h-6" /></button>
              <button onClick={nextBanner} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/50 text-black p-2 rounded-full hover:bg-white"><ChevronRightIcon className="w-6 h-6" /></button>
            </>}
        </div>
    );
};

const CartPanel: React.FC<{
    setOpen: (isOpen: boolean) => void, cart: CartItem[], subtotal: number,
    onUpdateQuantity: (id: string, qty: number) => void, onRemoveItem: (id: string) => void,
    onCheckout: () => void, formatCurrency: (amount: number) => string
}> = ({ setOpen, cart, subtotal, onUpdateQuantity, onRemoveItem, onCheckout, formatCurrency }) => {
    const FREE_SHIPPING_THRESHOLD = 150000;
    const missingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const progressPercentage = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

    return (
        <div className="fixed inset-0 bg-black/60 z-[60]" onClick={() => setOpen(false)}>
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">Carrito de Compras</h2>
                    <button onClick={() => setOpen(false)}><CloseIcon className="w-6 h-6" /></button>
                </div>
                {cart.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                        <CartIcon className="w-24 h-24 text-gray-300" />
                        <p className="mt-4 text-gray-500">Tu carrito está vacío.</p>
                        <button onClick={() => setOpen(false)} className="mt-6 bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition-colors">
                            Seguir comprando
                        </button>
                    </div>
                ) : (
                    <>
                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-start space-x-4">
                                <img src={item.imageUrl} alt={item.name} className="w-20 h-24 object-cover rounded-md"/>
                                <div className="flex-grow">
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-sm text-gray-500">{item.size && `Talla: ${item.size}`}{item.color && `, Color: ${item.color}`}</p>
                                    <p className="text-sm font-bold text-primary">{formatCurrency(item.price)}</p>
                                    <div className="flex items-center mt-2">
                                        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 border rounded-md"><MinusIcon className="w-4 h-4"/></button>
                                        <span className="px-3 font-semibold">{item.quantity}</span>
                                        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 border rounded-md"><PlusIcon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                                <button onClick={() => onRemoveItem(item.id)}><TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500"/></button>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t space-y-4 bg-surface">
                         <div className="w-full">
                            <div className="bg-gray-200 rounded-full h-2.5 mb-1">
                                <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                            <p className="text-xs text-center font-medium text-gray-600">
                                {missingForFreeShipping > 0
                                    ? `¡Te faltan ${formatCurrency(missingForFreeShipping)} para el envío gratis!`
                                    : "¡Felicidades! Tienes envío gratis."}
                            </p>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <button onClick={onCheckout} className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary-dark transition-colors font-semibold">
                            Finalizar Compra
                        </button>
                    </div>
                    </>
                )}
            </div>
        </div>
    );
};

const ProductDetailModal: React.FC<{
    product: Product, onClose: () => void,
    onAddToCart: (product: Product, quantity: number, size?: string, color?: string) => void,
    formatCurrency: (amount: number) => string,
}> = ({ product, onClose, onAddToCart, formatCurrency }) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
    const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);

    useEffect(() => {
      const sizes = product.variants?.sizes || {};
      const availableSizes = Object.entries(sizes).filter(([,d]) => d.available).map(([s]) => s);
      if (product.variants?.hasSizes && availableSizes.length > 0) setSelectedSize(availableSizes[0]);
      else setSelectedSize(undefined);

      const colors = product.variants?.colors || {};
      const availableColors = Object.entries(colors).filter(([,d]) => d.available).map(([c]) => c);
      if (product.variants?.hasColors && availableColors.length > 0) setSelectedColor(availableColors[0]);
      else setSelectedColor(undefined);
    }, [product]);

    const displayImage = selectedColor && product.variants?.colors?.[selectedColor]?.imageUrl
        ? product.variants.colors[selectedColor]!.imageUrl
        : product.imageUrl;

    const isAddToCartDisabled = !product.available || (product.variants?.hasSizes && !selectedSize) || (product.variants?.hasColors && !selectedColor);

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="w-full md:w-1/2 h-80 md:h-auto bg-gray-100">
                    <img src={displayImage} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto relative scrollbar-hide">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black p-1 rounded-full bg-white/50 hover:bg-white z-10"><CloseIcon className="w-6 h-6"/></button>
                    <h2 className="text-2xl font-bold font-serif pr-8">{product.name}</h2>
                    <p className="text-2xl text-primary font-bold my-2">{formatCurrency(product.price)}</p>
                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                    
                    {product.variants?.hasSizes && (
                        <div className="mb-4">
                            <h4 className="font-semibold mb-2 text-sm">Talla: <span className="font-normal text-gray-500">{selectedSize}</span></h4>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(product.variants?.sizes || {}).map(([size, details]) => (
                                    <button key={size} onClick={() => setSelectedSize(size)} disabled={!details.available}
                                        className={`px-4 py-2 border rounded-md text-sm transition-colors ${selectedSize === size ? 'bg-primary text-white border-primary' : 'bg-white'} ${!details.available ? 'text-gray-400 bg-gray-100 line-through cursor-not-allowed' : 'hover:border-primary'}`}
                                    >{size}</button>
                                ))}
                            </div>
                        </div>
                    )}

                    {product.variants?.hasColors && (
                         <div className="mb-4">
                            <h4 className="font-semibold mb-2 text-sm">Color: <span className="font-normal text-gray-500">{selectedColor}</span></h4>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(product.variants?.colors || {}).map(([color, details]) => (
                                    <button key={color} onClick={() => setSelectedColor(color)} disabled={!details.available}
                                        className={`px-4 py-2 border rounded-md text-sm transition-colors ${selectedColor === color ? 'bg-primary text-white border-primary' : 'bg-white'} ${!details.available ? 'text-gray-400 bg-gray-100 line-through cursor-not-allowed' : 'hover:border-primary'}`}
                                    >{color}</button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="flex items-center space-x-4 my-4">
                        <label htmlFor="quantity" className="font-semibold text-sm">Cantidad:</label>
                        <div className="flex items-center">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 border rounded-md"><MinusIcon className="w-5 h-5"/></button>
                            <span className="text-lg font-bold w-12 text-center">{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)} className="p-2 border rounded-md"><PlusIcon className="w-5 h-5"/></button>
                        </div>
                    </div>

                    <button onClick={() => onAddToCart(product, quantity, selectedSize, selectedColor)} disabled={isAddToCartDisabled} className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary-dark transition-colors mt-auto disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {product.available ? 'Agregar al Carrito' : 'Agotado'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const InvoiceModal: React.FC<{
    setOpen: (isOpen: boolean) => void, cart: CartItem[], subtotal: number,
    onSubmitOrder: (order: Omit<Order, 'id'>) => void, config: StoreConfig,
    formatCurrency: (amount: number) => string
}> = ({ setOpen, cart, subtotal, onSubmitOrder, config, formatCurrency }) => {
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState<'Recoger en Tienda' | 'Envío a Domicilio'>('Recoger en Tienda');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Nequi');

    const paymentOptions = ['Nequi', 'Daviplata', 'Tarjeta', 'Addi', 'Sistecredito'];
    const FREE_SHIPPING_THRESHOLD = 150000;
    const SHIPPING_COST = 10000;
    const shippingCost = deliveryMethod === 'Envío a Domicilio' && subtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_COST : 0;
    const total = subtotal + shippingCost;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName || !customerPhone) {
            alert("Por favor, completa tu nombre y teléfono.");
            return;
        }
        if (deliveryMethod === 'Envío a Domicilio' && !address) {
            alert("Por favor, ingresa tu dirección de envío.");
            return;
        }

        const tempOrderId = `BMB-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        
        const newOrderData: Omit<Order, 'id'> = {
            date: new Date().toISOString(),
            customerName,
            customerPhone,
            items: cart,
            subtotal,
            shippingCost,
            total,
            deliveryMethod,
            ...(deliveryMethod === 'Envío a Domicilio' && { address }),
            paymentMethod,
        };
        
        const messageItems = cart.map(item => `- ${item.quantity}x ${item.name} ${item.size ? `(Talla: ${item.size})` : ''} ${item.color ? `(Color: ${item.color})` : ''} - ${formatCurrency(item.price * item.quantity)}`).join('\n');
        
        const message = `¡Hola ${config.contact.name}! 👋 Quiero hacer un pedido:\n\n*Número de Orden:* ${tempOrderId}\n\n*Productos:*\n${messageItems}\n\n*Subtotal:* ${formatCurrency(subtotal)}\n*Envío:* ${formatCurrency(shippingCost)}\n*TOTAL:* ${formatCurrency(total)}\n\n*Datos del Cliente:*\n- Nombre: ${customerName}\n- Teléfono: ${customerPhone}\n\n*Entrega:* ${deliveryMethod}\n${deliveryMethod === 'Envío a Domicilio' ? `- Dirección: ${address}\n` : ''}*Medio de Pago:* ${paymentMethod}\n\n¡Gracias! 😊`;
        
        window.open(`https://wa.me/${config.social.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
        
        onSubmitOrder(newOrderData);
    };

    return (
         <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" onClick={() => setOpen(false)}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">Finalizar Compra</h2>
                    <button type="button" onClick={() => setOpen(false)}><CloseIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 scrollbar-hide">
                    <h3 className="font-semibold text-lg border-b pb-2">Tus Datos</h3>
                     <div>
                        <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="w-full bg-surface border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Teléfono (WhatsApp)</label>
                        <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required className="w-full bg-surface border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" />
                    </div>
                    <h3 className="font-semibold text-lg border-b pb-2 pt-4">Método de Entrega</h3>
                     <div className="space-y-2">
                        <label className="flex items-center p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-pink-50">
                          <input type="radio" name="delivery" value="Recoger en Tienda" checked={deliveryMethod === 'Recoger en Tienda'} onChange={() => setDeliveryMethod('Recoger en Tienda')} className="h-4 w-4 text-primary focus:ring-primary"/>
                          <span className="ml-3 text-sm font-medium">Recoger en Tienda</span>
                        </label>
                        <label className="flex items-center p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-pink-50">
                          <input type="radio" name="delivery" value="Envío a Domicilio" checked={deliveryMethod === 'Envío a Domicilio'} onChange={() => setDeliveryMethod('Envío a Domicilio')} className="h-4 w-4 text-primary focus:ring-primary"/>
                           <span className="ml-3 text-sm font-medium">Envío a Domicilio</span>
                        </label>
                     </div>
                     {deliveryMethod === 'Envío a Domicilio' && (
                        <div>
                           <label className="block text-sm font-medium mb-1">Dirección Completa</label>
                           <input type="text" value={address} onChange={e => setAddress(e.target.value)} required className="w-full bg-surface border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" />
                        </div>
                     )}
                     <h3 className="font-semibold text-lg border-b pb-2 pt-4">Medio de Pago</h3>
                     <div>
                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-surface border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary">
                            {paymentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                     </div>
                     <div className="bg-surface p-4 rounded-lg space-y-2 mt-4">
                        <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                        <div className="flex justify-between text-sm"><span>Costo de Envío</span><span>{formatCurrency(shippingCost)}</span></div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
                     </div>
                </div>
                <div className="p-4 border-t bg-gray-50">
                    <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 flex items-center justify-center space-x-2 font-semibold">
                        <WhatsAppIcon className="w-5 h-5" />
                        <span>Enviar Pedido por WhatsApp</span>
                    </button>
                </div>
            </form>
        </div>
    )
}

const Footer: React.FC<{ contact: StoreConfig['contact'], social: StoreConfig['social'] }> = ({ contact, social }) => (
    <footer id="contacto" className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
                <h3 className="font-serif text-lg">Bombon</h3>
                <p className="mt-2 text-gray-400">Ropa con estilo que cuenta tu historia.</p>
            </div>
            <div>
                <h3 className="font-semibold">Contacto</h3>
                <ul className="mt-2 space-y-1 text-gray-400">
                    <li>{contact.name}</li>
                    <li>Tel: {contact.phone}</li>
                    <li>{contact.schedule}</li>
                </ul>
            </div>
            <div>
                 <h3 className="font-semibold">Síguenos</h3>
                 <div className="flex items-center space-x-4 mt-2">
                    <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><InstagramIcon className="w-6 h-6" /></a>
                    <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><TikTokIcon className="w-6 h-6" /></a>
                    <a href={`https://wa.me/${social.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><WhatsAppIcon className="w-6 h-6" /></a>
                </div>
            </div>
        </div>
        <div className="bg-gray-900 py-4">
            <p className="text-center text-gray-500 text-sm">&copy; {new Date().getFullYear()} Bombon. Todos los derechos reservados.</p>
        </div>
    </footer>
);

// --- ADMIN PANEL COMPONENTS ---

const AdminInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string }>(
    ({ label, ...props }, ref) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input ref={ref} {...props} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-100" />
    </div>
));


const ImageUpload: React.FC<{
    currentImage: string;
    onImageSelect: (base64: string) => void;
    label: string;
}> = ({ currentImage, onImageSelect, label }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const base64 = await fileToBase64(file);
                onImageSelect(base64);
            } catch (error) {
                console.error("Error converting file to Base64:", error);
            }
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="mt-1 flex items-center space-x-4">
                <img src={currentImage || 'https://via.placeholder.com/80x100'} alt="Preview" className="w-20 h-24 rounded-md object-cover bg-gray-100" />
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2">
                   <UploadIcon className="w-4 h-4" />
                   <span>Cambiar</span>
                </button>
            </div>
        </div>
    );
};

interface AdminPanelProps {
    setOpen: (isOpen: boolean) => void;
    editMode: boolean;
    setEditMode: (isEditing: boolean) => void;
    store: {
        config: StoreConfig;
        banners: Banner[];
        products: Product[];
        categories: Category[];
        orders: Order[];
    };
    onUpdateConfig: (config: StoreConfig) => void;
    onSaveBanners: (banners: Banner[]) => void;
    onSaveCategories: (categories: Category[]) => void;
    onAddProduct: (product: Product) => void;
    onUpdateProduct: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
    formatCurrency: (amount: number) => string;
    productToEdit: Product | null;
}

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const {
        setOpen, editMode, setEditMode, store,
        onUpdateConfig, onSaveBanners, onSaveCategories,
        onAddProduct, onUpdateProduct, onDeleteProduct,
        formatCurrency, productToEdit
    } = props;
    
    const [activeTab, setActiveTab] = useState('Productos');
    const tabs = ['Productos', 'Categorías', 'Banners', 'General', 'Pedidos'];
    
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isAddingProduct, setIsAddingProduct] = useState(false);

    useEffect(() => {
        if(productToEdit) {
            setEditingProduct(productToEdit);
            setIsAddingProduct(false);
            setActiveTab('Productos');
        }
    }, [productToEdit]);

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsAddingProduct(false);
    };
    
    const handleAddNewProduct = () => {
        const newId = `prod-${Date.now()}`;
        const newProductTemplate: Product = {
            id: newId,
            name: '',
            description: '',
            price: 0,
            category: (props.store.categories || [])[0] || '',
            imageUrl: '',
            available: true,
            variants: {
                hasSizes: false, sizes: {},
                hasColors: false, colors: {}
            }
        };
        setEditingProduct(newProductTemplate);
        setIsAddingProduct(true);
    };

    const handleCloseEditor = () => {
        setEditingProduct(null);
        setIsAddingProduct(false);
    };

    const handleSaveProduct = (productToSave: Product) => {
        if (isAddingProduct) {
            onAddProduct(productToSave);
        } else {
            onUpdateProduct(productToSave);
        }
        handleCloseEditor();
    };

    const renderContent = () => {
        if (editingProduct) {
            return <ProductEditor 
                key={editingProduct.id}
                product={editingProduct}
                categories={props.store.categories}
                onSave={handleSaveProduct}
                onCancel={handleCloseEditor}
                onDelete={onDeleteProduct}
                isNewProduct={isAddingProduct}
            />;
        }

        switch (activeTab) {
            case 'Productos':
                return <AdminProductsTab 
                            products={props.store.products}
                            onEdit={handleEditProduct}
                            onAdd={handleAddNewProduct}
                            onDelete={onDeleteProduct}
                            formatCurrency={formatCurrency}
                        />;
            case 'Categorías':
                return <AdminCategoriesTab 
                            categories={props.store.categories}
                            onSave={onSaveCategories}
                        />;
            case 'Banners':
                return <AdminBannersTab 
                            banners={props.store.banners}
                            onSave={onSaveBanners}
                        />;
            case 'General':
                return <AdminGeneralTab
                            config={props.store.config}
                            onSave={onUpdateConfig}
                        />;
            case 'Pedidos':
                return <AdminOrdersTab 
                            orders={props.store.orders}
                            formatCurrency={formatCurrency}
                        />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[80] flex" onClick={() => setOpen(false)}>
            <div className="bg-gray-100 w-full max-w-7xl h-full flex shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="w-64 bg-gray-800 text-white flex flex-col">
                    <div className="p-4 border-b border-gray-700">
                        <h2 className="text-xl font-bold">Panel de Admin</h2>
                        <label htmlFor="editModeToggle" className="flex items-center space-x-2 mt-4 cursor-pointer">
                            <input id="editModeToggle" type="checkbox" checked={editMode} onChange={(e) => setEditMode(e.target.checked)} className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary"/>
                             <span className="text-sm">Edición Rápida</span>
                        </label>
                    </div>
                    <nav className="flex-grow p-2">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); handleCloseEditor(); }}
                                className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'hover:bg-gray-700'}`}
                            >{tab}</button>
                        ))}
                    </nav>
                     <div className="p-4 border-t border-gray-700">
                        <button onClick={() => setOpen(false)} className="w-full text-left px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Cerrar Panel</button>
                    </div>
                </div>
                <div className="flex-grow h-full overflow-y-auto bg-white">{renderContent()}</div>
            </div>
        </div>
    );
};

const AdminProductsTab: React.FC<{
    products: Product[], onEdit: (p: Product) => void, onAdd: () => void,
    onDelete: (id: string) => void, formatCurrency: (n: number) => string
}> = ({ products, onEdit, onAdd, onDelete, formatCurrency }) => (
    <div className="p-6">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Productos</h1>
            <button onClick={onAdd} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">Agregar Producto</button>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibilidad</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {(products || []).map(p => (
                        <tr key={p.id}>
                            <td className="p-3"><img src={p.imageUrl} alt={p.name} className="w-12 h-16 object-cover rounded-md" /></td>
                            <td className="p-3 text-sm font-medium text-gray-900">{p.name}</td>
                            <td className="p-3 text-sm text-gray-500">{p.category}</td>
                            <td className="p-3 text-sm text-gray-500">{formatCurrency(p.price)}</td>
                            <td className="p-3"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.available ? 'Sí' : 'No'}</span></td>
                            <td className="p-3 text-sm space-x-2">
                                <button onClick={() => onEdit(p)} className="text-primary hover:text-primary-dark">Editar</button>
                                <button onClick={() => onDelete(p.id)} className="text-red-600 hover:text-red-800">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const AdminCategoriesTab: React.FC<{categories: Category[], onSave: (cats: Category[]) => void}> = ({ categories, onSave }) => {
    const [localCategories, setLocalCategories] = useState(categories || []);
    const [newCat, setNewCat] = useState('');
    
    useEffect(() => {
        setLocalCategories(categories || []);
    }, [categories]);

    const handleAdd = () => {
        if (newCat && !localCategories.includes(newCat)) {
            setLocalCategories([...localCategories, newCat]);
            setNewCat('');
        }
    };
    const handleRemove = (catToRemove: string) => {
        setLocalCategories(localCategories.filter(c => c !== catToRemove));
    };
    const handleSave = () => onSave(localCategories);
    
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Categorías</h1>
            <div className="bg-white rounded-lg shadow p-6 max-w-md">
                <div className="flex space-x-2 mb-4">
                    <AdminInput label="" type="text" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Nueva categoría" />
                    <button onClick={handleAdd} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark whitespace-nowrap self-end">Agregar</button>
                </div>
                <div className="space-y-2">
                    {localCategories.map(cat => (
                        <div key={cat} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                            <span>{cat}</span>
                            <button onClick={() => handleRemove(cat)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                </div>
                <button onClick={handleSave} className="mt-6 w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Guardar Cambios</button>
            </div>
        </div>
    );
};

const AdminBannersTab: React.FC<{banners: Banner[], onSave: (b: Banner[]) => void}> = ({ banners, onSave }) => {
    const [localBanners, setLocalBanners] = useState<Banner[]>(banners || []);
    
    useEffect(() => {
        setLocalBanners(banners || []);
    }, [banners]);

    const updateBanner = (id: number, field: keyof Omit<Banner, 'id'>, value: string) => {
        setLocalBanners(localBanners.map(b => b.id === id ? { ...b, [field]: value } : b));
    };
    const addBanner = () => {
        const newBanner: Banner = { id: Date.now(), imageUrl: '', title: '', subtitle: '', link: '#' };
        setLocalBanners([...localBanners, newBanner]);
    };
    const removeBanner = (id: number) => {
        setLocalBanners(localBanners.filter(b => b.id !== id));
    };

    return (
         <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Banners</h1>
                <div>
                    <button onClick={addBanner} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mr-2">Agregar Banner</button>
                    <button onClick={() => onSave(localBanners)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Guardar Banners</button>
                </div>
            </div>
            <div className="space-y-6">
                {localBanners.map(banner => (
                    <div key={banner.id} className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                        <ImageUpload label="Imagen del Banner" currentImage={banner.imageUrl} onImageSelect={base64 => updateBanner(banner.id, 'imageUrl', base64)} />
                        <div className="md:col-span-2 space-y-4">
                            <AdminInput label="Título" value={banner.title} onChange={e => updateBanner(banner.id, 'title', e.target.value)} />
                            <AdminInput label="Subtítulo" value={banner.subtitle} onChange={e => updateBanner(banner.id, 'subtitle', e.target.value)} />
                            <AdminInput label="Enlace (Link)" value={banner.link} onChange={e => updateBanner(banner.id, 'link', e.target.value)} placeholder="Ej: #productos o category:Pantalones"/>
                        </div>
                        <button onClick={() => removeBanner(banner.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminGeneralTab: React.FC<{config: StoreConfig, onSave: (c: StoreConfig) => void}> = ({ config, onSave }) => {
    const [localConfig, setLocalConfig] = useState(config);

    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    const handleSave = () => onSave(localConfig);
    
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Configuración General</h1>
            <div className="bg-white rounded-lg shadow p-6 max-w-2xl space-y-6">
                <ImageUpload label="Logo de la Tienda" currentImage={localConfig.logoUrl} onImageSelect={base64 => setLocalConfig({...localConfig, logoUrl: base64})} />
                <AdminInput label="Nombre de la Tienda" value={localConfig.contact.name} onChange={e => setLocalConfig({...localConfig, contact: {...localConfig.contact, name: e.target.value}})} />
                <AdminInput label="Teléfono de Contacto" value={localConfig.contact.phone} onChange={e => setLocalConfig({...localConfig, contact: {...localConfig.contact, phone: e.target.value}})} />
                <AdminInput label="Horario" value={localConfig.contact.schedule} onChange={e => setLocalConfig({...localConfig, contact: {...localConfig.contact, schedule: e.target.value}})} />
                <AdminInput label="Instagram (URL completa)" value={localConfig.social.instagram} onChange={e => setLocalConfig({...localConfig, social: {...localConfig.social, instagram: e.target.value}})} />
                <AdminInput label="TikTok (URL completa)" value={localConfig.social.tiktok} onChange={e => setLocalConfig({...localConfig, social: {...localConfig.social, tiktok: e.target.value}})} />
                <AdminInput label="Número de WhatsApp (con cód. país)" value={localConfig.social.whatsapp} onChange={e => setLocalConfig({...localConfig, social: {...localConfig.social, whatsapp: e.target.value}})} />
                <button onClick={handleSave} className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Guardar Configuración</button>
            </div>
        </div>
    );
};

const AdminOrdersTab: React.FC<{orders: Order[], formatCurrency: (n: number) => string}> = ({ orders, formatCurrency }) => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Pedidos</h1>
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
                 <thead className="bg-gray-50">
                    <tr>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Orden</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrega</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {(!orders || orders.length === 0) && <tr><td colSpan={5} className="p-4 text-center text-gray-500">No hay pedidos aún.</td></tr>}
                    {(Object.values(orders || {}) as Order[]).map(o => (
                        <tr key={o.id}>
                           <td className="p-3 text-sm font-medium text-gray-900">{o.id}</td>
                           <td className="p-3 text-sm text-gray-500">{new Date(o.date).toLocaleDateString()}</td>
                           <td className="p-3 text-sm text-gray-500">{o.customerName}</td>
                           <td className="p-3 text-sm text-gray-500">{formatCurrency(o.total)}</td>
                           <td className="p-3 text-sm text-gray-500">{o.deliveryMethod}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const ProductEditor: React.FC<{
    product: Product; categories: Category[]; onSave: (p: Product) => void;
    onCancel: () => void; onDelete: (id: string) => void; isNewProduct: boolean;
}> = ({ product, categories, onSave, onCancel, onDelete, isNewProduct }) => {
    const [edited, setEdited] = useState(product);
    const [newSize, setNewSize] = useState('');
    const [newColor, setNewColor] = useState('');

    const handleChange = (field: keyof Product, value: any) => {
        setEdited(p => ({ ...p, [field]: value }));
    };

    const handleVariantChange = (field: keyof ProductVariants, value: any) => {
        setEdited(p => ({ ...p, variants: { ...p.variants, [field]: value } }));
    };

    const handleSizeAdd = () => {
        if (newSize && !edited.variants.sizes[newSize]) {
            const newSizes = { ...edited.variants.sizes, [newSize]: { available: true } };
            handleVariantChange('sizes', newSizes);
            setNewSize('');
        }
    };

    const handleSizeRemove = (size: string) => {
        const { [size]: _, ...remaining } = edited.variants.sizes;
        handleVariantChange('sizes', remaining);
    };

    const handleSizeAvailability = (size: string, available: boolean) => {
        const newSizes = { ...edited.variants.sizes, [size]: { available } };
        handleVariantChange('sizes', newSizes);
    };

    const handleColorAdd = () => {
        if (newColor && !edited.variants.colors[newColor]) {
            const newColors = { ...edited.variants.colors, [newColor]: { available: true, imageUrl: '' } };
            handleVariantChange('colors', newColors);
            setNewColor('');
        }
    };
    
    const handleColorRemove = (color: string) => {
        const { [color]: _, ...remaining } = edited.variants.colors;
        handleVariantChange('colors', remaining);
    };

    const handleColorUpdate = (color: string, field: keyof ProductColorVariantDetail, value: any) => {
        const currentColors = edited.variants.colors;
        const currentColorData = currentColors[color] || { available: false, imageUrl: '' };
        const updatedColor = { ...currentColorData, [field]: value };
        const newColors = { ...currentColors, [color]: updatedColor };
        handleVariantChange('colors', newColors);
    };

    return (
        <div className="p-6 h-full">
            <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold">{isNewProduct ? 'Agregar Nuevo Producto' : `Editando: ${product.name}`}</h1>
                <div>
                    <button onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 mr-2">Cancelar</button>
                    <button onClick={() => onSave(edited)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Guardar Producto</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda: Detalles Básicos */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-4">
                    <AdminInput label="Nombre del Producto" value={edited.name} onChange={e => handleChange('name', e.target.value)} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea value={edited.description} onChange={e => handleChange('description', e.target.value)} rows={4} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <AdminInput label="Precio (COP)" type="number" value={edited.price} onChange={e => handleChange('price', parseFloat(e.target.value) || 0)} />
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select value={edited.category} onChange={e => handleChange('category', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                {(categories || []).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                     <ImageUpload label="Imagen Principal" currentImage={edited.imageUrl} onImageSelect={base64 => handleChange('imageUrl', base64)} />
                     <div className="flex items-center space-x-2">
                        <input type="checkbox" id="isAvailable" checked={edited.available} onChange={e => handleChange('available', e.target.checked)} className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary" />
                        <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">Disponible para la venta</label>
                    </div>
                </div>

                {/* Columna Derecha: Variantes */}
                <div className="lg:col-span-1 bg-white rounded-lg shadow p-6 space-y-6">
                    <h3 className="font-bold text-lg">Variantes</h3>
                    
                    {/* Tallas */}
                    <div className="border-t pt-4">
                        <div className="flex items-center space-x-2 mb-2">
                           <input type="checkbox" id="hasSizes" checked={edited.variants.hasSizes} onChange={e => handleVariantChange('hasSizes', e.target.checked)} className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary" />
                           <label htmlFor="hasSizes" className="text-sm font-medium text-gray-700">Tiene tallas</label>
                        </div>
                        {edited.variants.hasSizes && (
                            <div className="pl-6 space-y-2">
                                <div className="flex space-x-2">
                                    <input type="text" value={newSize} onChange={e => setNewSize(e.target.value)} placeholder="Ej: S, M, 36" className="w-full text-sm px-2 py-1 border border-gray-300 rounded-md"/>
                                    <button onClick={handleSizeAdd} className="bg-gray-200 px-3 py-1 text-sm rounded-md">+</button>
                                </div>
                                {Object.entries(edited.variants.sizes).map(([size, detail]) => (
                                    <div key={size} className="flex justify-between items-center text-sm">
                                        <span>{size}</span>
                                        <div className="flex items-center space-x-2">
                                            <label className="flex items-center space-x-1 cursor-pointer"><input type="checkbox" checked={detail.available} onChange={e => handleSizeAvailability(size, e.target.checked)} className="h-3.5 w-3.5"/><span>Disp.</span></label>
                                            <button onClick={() => handleSizeRemove(size)} className="text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Colores */}
                    <div className="border-t pt-4">
                        <div className="flex items-center space-x-2 mb-2">
                           <input type="checkbox" id="hasColors" checked={edited.variants.hasColors} onChange={e => handleVariantChange('hasColors', e.target.checked)} className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"/>
                           <label htmlFor="hasColors" className="text-sm font-medium text-gray-700">Tiene colores</label>
                        </div>
                        {edited.variants.hasColors && (
                             <div className="pl-6 space-y-4">
                                <div className="flex space-x-2">
                                    <input type="text" value={newColor} onChange={e => setNewColor(e.target.value)} placeholder="Ej: Rojo, Azul" className="w-full text-sm px-2 py-1 border border-gray-300 rounded-md"/>
                                    <button onClick={handleColorAdd} className="bg-gray-200 px-3 py-1 text-sm rounded-md">+</button>
                                </div>
                                {Object.entries(edited.variants.colors).map(([color, detail]) => (
                                    <div key={color} className="space-y-2 p-2 border rounded-md">
                                        <div className="flex justify-between items-center text-sm font-medium">
                                          <span>{color}</span>
                                          <button onClick={() => handleColorRemove(color)} className="text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                        <ImageUpload label="" currentImage={detail.imageUrl || ''} onImageSelect={base64 => handleColorUpdate(color, 'imageUrl', base64)} />
                                        <label className="flex items-center space-x-1 cursor-pointer text-sm"><input type="checkbox" checked={detail.available} onChange={e => handleColorUpdate(color, 'available', e.target.checked)} className="h-3.5 w-3.5"/><span>Disponible</span></label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {!isNewProduct && (
                <div className="lg:col-span-3">
                     <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="font-bold text-red-800">Zona de Peligro</h3>
                        <p className="text-sm text-red-600 mt-1">Esta acción no se puede deshacer. Se eliminará el producto permanentemente.</p>
                        <button onClick={() => onDelete(product.id)} className="mt-2 bg-red-600 text-white px-4 py-2 text-sm rounded-md hover:bg-red-700">Eliminar este producto</button>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default App;