export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white py-4 px-6 mt-auto">
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-xs text-gray-500">
          © 2026 — Todos os direitos reservados — Oficina Mecânica 4.1
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Desenvolvido por:</span>
          <svg width="72" height="22" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="kGradientFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#b794f6', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#9f7aea', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#805ad5', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <polygon points="180,120 220,140 220,280 180,300" fill="url(#kGradientFooter)" />
            <polygon points="220,140 380,120 380,180 260,200" fill="url(#kGradientFooter)" />
            <polygon points="260,220 380,240 380,300 220,280" fill="url(#kGradientFooter)" />
            <text x="410" y="260" fontFamily="Arial, sans-serif" fontSize="120" fontWeight="700" fill="#374151" letterSpacing="0">Khode</text>
            <text x="410" y="310" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="400" fill="#805ad5" letterSpacing="12">SYSTEMS</text>
          </svg>
        </div>
      </div>
    </footer>
  );
}
