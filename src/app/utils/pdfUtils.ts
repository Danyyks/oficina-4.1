import logoImage from '../../assets/logo nova.jpeg';

export async function carregarLogo(): Promise<string | null> {
  try {
    const res = await fetch(logoImage);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
