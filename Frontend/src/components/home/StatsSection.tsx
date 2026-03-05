import { useEffect, useState } from "react";

interface StatItem {
  number: string;
  label: string;
  icon: string;
}

const stats: StatItem[] = [
  { number: "250+", label: "Propriétaires béninois", icon: "👥" },
  { number: "1000+", label: "Propriétés gérées", icon: "🏠" },
  { number: "₣50M+", label: "Loyers gérés", icon: "💰" },
  { number: "100%", label: "Gratuit et sécurisé", icon: "🔒" },
];

function CounterNumber({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(target * progress));
    }, 30);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count}</span>;
}

export default function StatsSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nos chiffres parlent d'eux-mêmes
          </h2>
          <p className="text-lg text-gray-600">
            Une plateforme de confiance pour les propriétaires béninois
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const numericValue = parseInt(stat.number.replace(/\D/g, "")) || 0;
            return (
              <div key={index} className="text-center">
                <div className="text-5xl mb-3">{stat.icon}</div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {stat.number.includes("+") || stat.number.includes("M") ? (
                    <>
                      <CounterNumber target={numericValue} />
                      {stat.number.includes("M") ? "M+" : "+"}
                    </>
                  ) : stat.number.includes("%") ? (
                    stat.number
                  ) : (
                    stat.number
                  )}
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
