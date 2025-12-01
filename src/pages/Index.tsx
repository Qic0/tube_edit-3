import { useState, useEffect } from "react";
import { PipeViewer3D } from "@/components/PipeViewer3D";
import { PipeConfigurator } from "@/components/PipeConfigurator";
import { PipeConfig, createDefaultConfig } from "@/types/pipe";
import { MainNav } from "@/components/MainNav";
import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cart } from "@/components/Cart";
import { 
  loadCartFromStorage, 
  saveCartToStorage, 
  addTubeItemToCart, 
  removeItemFromCart,
  Cart as CartType 
} from "@/types/cart";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [pipeConfig, setPipeConfig] = useState<PipeConfig>(createDefaultConfig());
  const [cart, setCart] = useState<CartType>(() => loadCartFromStorage());
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(true);
  const [isCartCollapsed, setIsCartCollapsed] = useState(() => {
    const saved = localStorage.getItem("cart-collapsed");
    return saved === "true";
  });

  // Save cart to localStorage
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  const handleFinishPart = () => {
    const newCart = addTubeItemToCart(cart, pipeConfig);
    const newItem = newCart.items[newCart.items.length - 1];
    
    setCart(newCart);
    setSelectedItemId(newItem.id);
    setIsCreatingNew(false);
    setPipeConfig(createDefaultConfig());

    toast({
      title: "Деталь добавлена",
      description: `Артикул: ${newItem.id}`
    });
  };

  const handleDeleteItem = (itemId: string) => {
    const newCart = removeItemFromCart(cart, itemId);
    setCart(newCart);
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
      setIsCreatingNew(true);
    }
    toast({
      title: "Деталь удалена"
    });
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsCreatingNew(false);
  };

  const handleCreateNew = () => {
    setSelectedItemId(null);
    setIsCreatingNew(true);
    setPipeConfig(createDefaultConfig());
  };

  const getDisplayConfig = (): PipeConfig | null => {
    if (isCreatingNew) {
      return pipeConfig.confirmed ? pipeConfig : null;
    }
    
    const item = cart.items.find(i => i.id === selectedItemId && i.type === "tube");
    return item?.pipeConfig || null;
  };

  const displayConfig = getDisplayConfig();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <MainNav />

      {/* Основной контент */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex gap-4 p-4 overflow-hidden overflow-x-hidden">
          {/* Левая панель - конфигуратор */}
          <div className="w-80 flex flex-col flex-shrink-0">
            {isCreatingNew ? (
              <PipeConfigurator 
                config={pipeConfig} 
                onChange={setPipeConfig}
                onFinish={handleFinishPart}
              />
            ) : (
              <Card className="bg-card">
                <CardContent className="pt-4">
                  <div className="text-center space-y-3">
                    <Eye className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Просмотр готовой детали
                    </p>
                    <button
                      onClick={handleCreateNew}
                      className="text-sm text-primary hover:underline"
                    >
                      + Создать новую деталь
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Центральная панель - 3D просмотр */}
          <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCartCollapsed ? 'mr-0' : ''}`}>
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="pb-3 border-b flex-shrink-0">
                <CardTitle className="text-lg">3D Просмотр</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-4 overflow-auto">
                {displayConfig ? (
                  <div className="h-full">
                    <PipeViewer3D config={displayConfig} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Выберите параметры профиля и нажмите OK
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Правая панель - корзина */}
          <div className={`flex flex-col transition-all duration-300 flex-shrink-0 overflow-hidden ${isCartCollapsed ? 'w-0' : 'w-80'}`}>
            <Cart 
              cart={cart} 
              onDeleteItem={handleDeleteItem}
              onCollapseChange={setIsCartCollapsed}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
