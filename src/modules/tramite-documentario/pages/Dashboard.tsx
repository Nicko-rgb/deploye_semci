const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">📄 Trámite Documentario</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Bienvenido al módulo de Trámite Documentario</h2>
        <p className="text-gray-600 mb-4">
          Este módulo está en construcción. Aquí podrás gestionar:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Recepción de documentos</li>
          <li>Seguimiento de trámites</li>
          <li>Derivación de documentos</li>
          <li>Archivo digital</li>
          <li>Reportes de gestión</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
