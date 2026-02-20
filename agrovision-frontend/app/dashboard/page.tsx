"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/DashboardCard";
import AlertPanel from "@/components/AlertPanel";
import socket from "@/services/socket";

interface Sensor {
  _id: string;
  name: string;
  type: string;
  value: number;
  unit: string;
  createdAt: string;
}

interface Alert {
  _id: string;
  message: string;
  severity: "low" | "medium" | "high";
  resolved: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Proteger ruta
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Escuchar sensores en tiempo real
  useEffect(() => {
    socket.on("newSensorData", (data: Sensor) => {
      setSensors((prev) => [data, ...prev]);
    });

    return () => {
      socket.off("newSensorData");
    };
  }, []);

  // Escuchar alertas en tiempo real
  useEffect(() => {
    socket.on("newAlert", (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev]);
    });

    return () => {
      socket.off("newAlert");
    };
  }, []);

  // Obtener sensores iniciales
  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/sensors",
          {
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Error al obtener sensores");

        const data = await res.json();
        setSensors(data);
      } catch (error) {
        console.error(error);
      }
    };

    if (user) fetchSensors();
  }, [user]);

  // Obtener alertas iniciales
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/alerts",
          {
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Error al obtener alertas");

        const data = await res.json();
        setAlerts(data);
      } catch (error) {
        console.error(error);
      }
    };

    if (user) fetchAlerts();
  }, [user]);

  if (loading) return <p className="p-8">Cargando...</p>;
  if (!user) return null;

  // Obtener últimos valores
  const latestHumidity = sensors.find(
    (s) => s.type === "humidity"
  );

  const latestTemperature = sensors.find(
    (s) => s.type === "temperature"
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          🌱 Bienvenido {user.name}
        </h1>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
        >
          Cerrar sesión
        </button>
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-3 gap-6">
        <DashboardCard
          title="Sensores Totales"
          value={sensors.length}
        />

        <DashboardCard
          title="Humedad Actual"
          value={
            latestHumidity
              ? `${latestHumidity.value}${latestHumidity.unit}`
              : "—"
          }
        />

        <DashboardCard
          title="Temperatura Actual"
          value={
            latestTemperature
              ? `${latestTemperature.value}${latestTemperature.unit}`
              : "—"
          }
        />
      </div>

      {/* PANEL ADMIN */}
      {user.role === "admin" && (
        <div className="mt-8 p-6 bg-blue-100 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-2">
            Panel Administrador
          </h2>
          <p className="text-gray-700">
            Tienes permisos para crear sensores y administrar el sistema.
          </p>
        </div>
      )}

      {/* ALERTAS */}
      <div className="mt-8">
        <AlertPanel alerts={alerts} />
      </div>
    </div>
  );
}