import os
import shutil
import sys

print("====================================================")
print("🚀 NeuroAds Uploaded Image Processing & Copy Script")
print("====================================================")

brain_dir = r"C:\Users\claud\.gemini\antigravity-ide\brain\e3547459-bee6-4cbd-b9d7-281562e889cd"
dest_dir = r"c:\Users\claud\OneDrive\Documentos\NeuroAds\LP\public\images\editorial\alem-do-algoritmo"
dest_image = os.path.join(dest_dir, "optimization-timer.png")

# Procura arquivos de mídia enviados pelo usuário
media_files = [f for f in os.listdir(brain_dir) if f.startswith("media__")]

if not media_files:
    print("❌ Nenhum arquivo de imagem recente encontrado na pasta do chat.")
    sys.exit(1)

# Ordena pelo nome para obter o mais recente (timestamp)
media_files.sort()
latest_media = media_files[-1]
latest_path = os.path.join(brain_dir, latest_media)

print(f"\n📂 Lendo a última imagem que você enviou: {latest_media}")

try:
    from PIL import Image
    os.makedirs(dest_dir, exist_ok=True)
    
    img = Image.open(latest_path)
    
    # Se a imagem tiver fundo preto/escuro e precisarmos garantir transparência:
    # Converter para RGBA se não estiver
    img = img.convert("RGBA")
    
    # Salva diretamente na pasta pública do Next.js
    img.save(dest_image, "PNG")
    print(f"\n✅ Sucesso! Imagem processada e salva com sucesso em:")
    print(f"   {dest_image}")
    print("\n✨ O Next.js recarregará automaticamente com a nova imagem e o efeito inclinado!")
    
except Exception as e:
    print(f"\n❌ Ocorreu um erro ao processar a imagem:\n   {str(e)}")
    print("🔄 Tentando cópia direta do arquivo como fallback...")
    try:
        os.makedirs(dest_dir, exist_ok=True)
        shutil.copyfile(latest_path, dest_image)
        print("✅ Sucesso (via cópia direta)!")
    except Exception as copy_err:
        print(f"❌ Falha no fallback de cópia:\n   {str(copy_err)}")
        sys.exit(1)
