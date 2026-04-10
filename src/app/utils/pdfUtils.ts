import logoImage from '../../assets/7188601ef5c7fc783e87deb6439d04e88e0319a4.png';

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
