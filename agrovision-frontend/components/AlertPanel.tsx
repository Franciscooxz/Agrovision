"use client";

interface Alert {
  _id: string;
  message: string;
  severity: "low" | "medium" | "high";
  resolved: boolean;
  createdAt: string;
}

interface Props {
  alerts: Alert[];
}

export default function AlertPanel({ alerts }: Props) {

  const resolveAlert = async (id: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/alerts/${id}/resolve`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Error al resolver alerta");

      // Recargar página automáticamente (simple y efectivo)
      window.location.reload();

    } catch (error) {
      console.error(error);
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Alertas</h2>
        <p className="text-gray-500">No hay alertas activas</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Alertas Activas</h2>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert._id}
            className={`p-4 rounded-lg flex justify-between items-center ${
              alert.severity === "high"
                ? "bg-red-100 border-l-4 border-red-500"
                : alert.severity === "medium"
                ? "bg-yellow-100 border-l-4 border-yellow-500"
                : "bg-blue-100 border-l-4 border-blue-500"
            }`}
          >
            <div>
              <p className="font-semibold">{alert.message}</p>
              <p className="text-sm text-gray-600">
                {new Date(alert.createdAt).toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => resolveAlert(alert._id)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition"
            >
              Resolver
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}