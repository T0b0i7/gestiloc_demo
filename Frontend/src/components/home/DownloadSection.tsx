import { Download } from "lucide-react";

export default function DownloadSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Disponible sur mobile
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          Téléchargez notre application mobile pour gérer vos propriétés en déplacement
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          {/* App Store */}
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.3-3.14-2.53C4.25 17 2.94 12.94 4.7 9.64c.87-1.6 2.44-2.58 4.12-2.58 1.28 0 2.47.6 3.44.6.59 0 1.89-.6 3.18-.6 1.5 0 2.7.77 3.44 1.94 2.04 2.3-.34 5.46-2.07 7.55zM12 2c.82 0 1.48.65 1.48 1.45 0 .81-.66 1.48-1.48 1.48-1.45 0-1.48-1.49-1.48-1.49 0-.8.66-1.44 1.48-1.44z" />
            </svg>
            <div className="text-left">
              <div className="text-xs opacity-75">Télécharger sur</div>
              <div className="text-lg font-semibold">App Store</div>
            </div>
          </a>

          {/* Google Play */}
          <a
            href="https://play.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-4 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
          >
            <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13.5h8v8.5H3z M11 13.5h10V24H11z M3 3h8v10H3z M13.5 3H24v10.5H13.5z" />
            </svg>
            <div className="text-left">
              <div className="text-xs opacity-75">Obtenez-le sur</div>
              <div className="text-lg font-semibold">Google Play</div>
            </div>
          </a>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <Download className="inline-block mr-2 h-4 w-4" />
          Plus de 10,000 téléchargements en Afrique de l'Ouest
        </div>
      </div>
    </section>
  );
}
