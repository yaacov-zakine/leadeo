export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="bg-white rounded-xl shadow-lg p-10 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Accès interdit</h1>
        <p className="text-gray-700 mb-6">
          Vous n'avez pas les droits pour accéder à cette page.
        </p>
        <a
          href="/"
          className="btn bg-blue-600 text-white px-6 py-2 rounded-full shadow hover:bg-blue-700"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}
