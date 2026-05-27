import os
import sys

print("====================================================")
print("🚀 NeuroAds Image Background Remover & Copy Script")
print("====================================================")

try:
    from PIL import Image
except ImportError:
    print("\n❌ A biblioteca 'Pillow' não está instalada no seu Python.")
    print("👉 Para instalar, execute o comando abaixo no seu terminal:")
    print("   pip install Pillow\n")
    sys.exit(1)

# Caminhos absolutos
source_image = r"C:\Users\claud\.gemini\antigravity-ide\brain\e3547459-bee6-4cbd-b9d7-281562e889cd\optimization_timer_1779864450136.png"
dest_dir = r"c:\Users\claud\OneDrive\Documentos\NeuroAds\LP\public\images\editorial\alem-do-algoritmo"
dest_image = os.path.join(dest_dir, "optimization-timer.png")

if not os.path.exists(source_image):
    print(f"\n❌ Arquivo de origem não encontrado:\n   {source_image}")
    sys.exit(1)

print(f"\n📂 Lendo imagem de origem: {source_image}")

try:
    # Cria diretório de destino se não existir
    os.makedirs(dest_dir, exist_ok=True)
    
    # Abre e converte a imagem para RGBA (suporta transparência)
    img = Image.open(source_image).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    print("⏳ Processando pixels para remover o fundo branco...")
    
    # Substitui pixels próximos do branco por transparentes
    for item in datas:
        # Se os canais R, G, B forem maiores que 240 (quase branco), torna transparente
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0)) # Transparência total
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    # Salva no destino como PNG transparente
    img.save(dest_image, "PNG")
    print(f"\n✅ Sucesso! Imagem salva com fundo transparente em:")
    print(f"   {dest_image}")
    print("\n✨ A página já está configurada e com efeito inclinado (tilted) ativo!")
    
except Exception as e:
    print(f"\n❌ Ocorreu um erro durante o processamento:\n   {str(e)}")
    sys.exit(1)
